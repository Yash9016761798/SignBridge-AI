"""
Hyperparameter Search for SignBridge AI.
Runs controlled experiments with different hyperparameter configurations.
"""
import sys
import os
import json
import time
import yaml
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from pathlib import Path
import random

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from training.seed import SeedManager
from training.optimizer import OptimizerFactory
from training.scheduler import SchedulerFactory
from training.mixed_precision import MixedPrecisionManager
from training.checkpoint import CheckpointManager
from training.config import TrainingConfig
from models.transformer import PoseTransformer
from models.loss import SignBridgeLoss
from experiments.manager import ExperimentManager
from experiments.tracker import ExperimentTracker
from experiments.search import SearchSpace, RandomSearch, GridSearch
from experiments.comparator import ExperimentComparator
from experiments.visualizer import ExperimentVisualizer
from experiments.report import ReportGenerator


# =============================================================================
# MOCK DATASET
# =============================================================================
class MockISLDataset(Dataset):
    def __init__(self, size=500, pose_len=32, num_lm=33, num_f=5, text_len=20, vocab_size=1000, seed=42):
        self.samples = []
        rng = random.Random(seed)
        for i in range(size):
            pose = np.random.randn(pose_len, num_lm, num_f).astype(np.float32)
            tl = rng.randint(3, text_len - 2)
            inp = np.zeros(text_len, dtype=np.int64)
            inp[0] = 1
            inp[1:tl+1] = np.random.randint(4, vocab_size, size=tl)
            inp[tl+1] = 2
            tgt = np.zeros(text_len, dtype=np.int64)
            tgt[:tl] = inp[1:tl+1]
            tgt[tl] = 2
            am = np.zeros(text_len, dtype=np.int64)
            am[:tl+2] = 1
            pm = np.zeros(pose_len, dtype=np.bool_)
            self.samples.append({
                'pose_tensor': pose, 'input_ids': inp, 'target_ids': tgt,
                'attention_mask': am, 'pose_mask': pm, 'sequence_length': pose_len,
            })

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        return {k: torch.tensor(v) if isinstance(v, np.ndarray) else v for k, v in self.samples[idx].items()}


def dict_collate(batch):
    result = {}
    for k in batch[0].keys():
        vals = [b[k] for b in batch]
        if isinstance(vals[0], torch.Tensor):
            result[k] = torch.stack(vals)
        else:
            result[k] = vals
    return result


# =============================================================================
# SINGLE EXPERIMENT RUNNER
# =============================================================================
def run_single_experiment(config, exp_dir, dataset_params, device):
    exp_id = exp_dir.name
    SeedManager(config.get('seed', 42)).set_seed()

    tracker = ExperimentTracker(exp_dir)
    ckpt_dir = exp_dir / 'checkpoints'
    ckpt_dir.mkdir(exist_ok=True)
    ckpt_mgr = CheckpointManager(checkpoint_dir=str(ckpt_dir))

    ds = MockISLDataset(
        size=dataset_params.get('num_samples', 500),
        pose_len=dataset_params.get('pose_length', 32),
        vocab_size=config.get('vocab_size', 1000),
        text_len=dataset_params.get('text_length', 20),
        seed=config.get('seed', 42),
    )
    n = len(ds)
    n_train = int(n * dataset_params.get('train_split', 0.8))
    n_val = int(n * dataset_params.get('val_split', 0.1))
    n_test = n - n_train - n_val
    train_ds, val_ds, _ = torch.utils.data.random_split(
        ds, [n_train, n_val, n_test], generator=torch.Generator().manual_seed(42)
    )

    bs = config.get('batch_size', 8)
    train_loader = DataLoader(train_ds, batch_size=bs, shuffle=True, collate_fn=dict_collate)
    val_loader = DataLoader(val_ds, batch_size=bs, collate_fn=dict_collate)

    model = PoseTransformer(
        vocab_size=config.get('vocab_size', 1000),
        num_landmarks=config.get('num_landmarks', 33),
        num_features=config.get('num_features', 5),
        d_model=config.get('d_model', 128),
        num_heads=config.get('num_heads', 4),
        num_encoder_layers=config.get('num_encoder_layers', 3),
        num_decoder_layers=config.get('num_decoder_layers', 3),
        d_ff=config.get('d_ff', 256),
        max_pose_length=config.get('max_pose_length', 32),
        max_text_length=config.get('max_text_length', 20),
        dropout=config.get('dropout', 0.1),
        pad_token_id=config.get('pad_token_id', 0),
    ).to(device)

    loss_fn = SignBridgeLoss(
        vocab_size=config.get('vocab_size', 1000),
        pad_token_id=config.get('pad_token_id', 0),
        smoothing=config.get('label_smoothing', 0.1),
    )

    optimizer = OptimizerFactory.create(
        model.parameters(),
        optimizer_type=config.get('optimizer', 'adamw'),
        lr=config.get('learning_rate', 0.0001),
        weight_decay=config.get('weight_decay', 0.01),
    )

    scheduler = SchedulerFactory.create(
        optimizer,
        scheduler_type=config.get('scheduler', 'cosineannealing'),
        T_max=config.get('max_epochs', 15),
    )

    mp = MixedPrecisionManager(enabled=config.get('mixed_precision', False))
    clip = config.get('gradient_clip', 1.0)
    max_epochs = config.get('max_epochs', 15)
    patience = config.get('patience', 8)

    best_val_loss = float('inf')
    patience_counter = 0
    train_start = time.time()

    for epoch in range(max_epochs):
        epoch_start = time.time()
        model.train()
        train_losses = []
        train_accs = []

        for batch in train_loader:
            optimizer.zero_grad()
            pose = batch['pose_tensor'].to(device)
            input_ids = batch['input_ids'].to(device)
            target_ids = batch['target_ids'].to(device)
            pose_mask = batch.get('pose_mask')
            if pose_mask is not None:
                pose_mask = pose_mask.to(device)

            with mp:
                out = model(pose, input_ids, pose_mask)
                loss = loss_fn(out['logits'], target_ids)

            mp.backward(loss)
            mp.step(optimizer)

            if clip > 0:
                torch.nn.utils.clip_grad_norm_(model.parameters(), clip)

            train_losses.append(loss.item())
            train_accs.append(loss_fn.compute_accuracy(out['logits'], target_ids).item())

        if scheduler is not None and not isinstance(scheduler, torch.optim.lr_scheduler.ReduceLROnPlateau):
            scheduler.step()

        avg_train_loss = sum(train_losses) / len(train_losses)
        avg_train_acc = sum(train_accs) / len(train_accs)

        model.eval()
        val_losses = []
        val_accs = []
        with torch.no_grad():
            for batch in val_loader:
                pose = batch['pose_tensor'].to(device)
                input_ids = batch['input_ids'].to(device)
                target_ids = batch['target_ids'].to(device)
                pose_mask = batch.get('pose_mask')
                if pose_mask is not None:
                    pose_mask = pose_mask.to(device)
                out = model(pose, input_ids, pose_mask)
                vl = loss_fn(out['logits'], target_ids)
                va = loss_fn.compute_accuracy(out['logits'], target_ids).item()
                val_losses.append(vl.item())
                val_accs.append(va)

        avg_val_loss = sum(val_losses) / len(val_losses) if val_losses else 0
        avg_val_acc = sum(val_accs) / len(val_accs) if val_accs else 0
        epoch_time = time.time() - epoch_start
        lr = optimizer.param_groups[0]['lr']
        ppl = min(np.exp(avg_train_loss), 1e10)

        tracker.log_epoch(epoch + 1, {
            'train_loss': avg_train_loss,
            'val_loss': avg_val_loss,
            'accuracy': avg_val_acc,
            'perplexity': ppl,
            'learning_rate': lr,
            'epoch_time': epoch_time,
        })

        marker = ''
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            patience_counter = 0
            marker = ' *'
            ckpt_mgr.save_epoch(model, optimizer, scheduler, epoch, {'val_loss': avg_val_loss})
        else:
            patience_counter += 1

        print(f'    Epoch {epoch+1:2d}/{max_epochs} | loss={avg_train_loss:.4f} val_loss={avg_val_loss:.4f} acc={avg_val_acc:.4f} time={epoch_time:.1f}s{marker}')

        if patience_counter >= patience:
            print(f'    Early stopping at epoch {epoch+1}')
            break

    total_time = time.time() - train_start
    ckpt_mgr.save_epoch(model, optimizer, scheduler, epoch, {'val_loss': best_val_loss})
    ckpt_mgr.save(model.state_dict(), 'latest.pt')

    summary = tracker.get_summary()
    summary['val_loss'] = best_val_loss
    summary['accuracy'] = avg_val_acc
    summary['perplexity'] = ppl
    summary['train_time'] = total_time

    tracker.save()
    tracker.save_csv()

    return summary


# =============================================================================
# MAIN
# =============================================================================
def main():
    print('=' * 70)
    print('  SIGNBRIDGE AI — HYPERPARAMETER SEARCH')
    print('=' * 70)

    config_path = r'C:\Users\Gaurav Gopal Gosavi\OneDrive\Desktop\Sign languageproject\ai-training\configs\hyperparameter_search.yaml'
    with open(config_path, 'r', encoding='utf-8') as f:
        raw = yaml.safe_load(f)

    search_cfg = raw.get('search', {})
    base_config = raw.get('base_config', {})
    search_space_dict = raw.get('search_space', {})
    output_cfg = raw.get('output', {})

    search_space = SearchSpace.from_dict(search_space_dict)

    # Convert string values to proper types
    for key in ['learning_rate', 'dropout', 'label_smoothing', 'weight_decay', 'gradient_clip']:
        vals = getattr(search_space, key, [])
        setattr(search_space, key, [float(v) for v in vals])
    for key in ['batch_size']:
        vals = getattr(search_space, key, [])
        setattr(search_space, key, [int(v) for v in vals])
    for key in ['teacher_forcing_ratio']:
        vals = getattr(search_space, key, [])
        setattr(search_space, key, [float(v) for v in vals])

    # Convert base config numeric values
    for key in ['learning_rate', 'weight_decay', 'dropout', 'label_smoothing', 'd_model', 'd_ff',
                 'max_pose_length', 'max_text_length', 'num_landmarks', 'num_features',
                 'num_heads', 'num_encoder_layers', 'num_decoder_layers', 'vocab_size',
                 'pad_token_id', 'bos_token_id', 'eos_token_id', 'pose_length', 'text_length',
                 'num_samples', 'max_epochs', 'patience', 'seed', 'batch_size']:
        if key in base_config:
            try:
                base_config[key] = type(TrainingConfig.DEFAULTS.get(key, base_config[key]))(base_config[key])
            except (ValueError, TypeError):
                pass

    strategy = search_cfg.get('strategy', 'random')
    max_exp = search_cfg.get('max_experiments', 5)
    seed = search_cfg.get('seed', 42)

    base_dir = output_cfg.get('base_dir', './experiments')
    weights_dir = output_cfg.get('weights_dir', './weights')
    os.makedirs(weights_dir, exist_ok=True)

    if strategy == 'grid':
        searcher = GridSearch(search_space)
    else:
        searcher = RandomSearch(search_space, seed=seed)

    configs = searcher.get_configs(base_config, max_experiments=max_exp)

    # Ensure numeric types in configs
    int_keys = ['batch_size', 'vocab_size', 'num_landmarks', 'num_features', 'd_model',
                'num_heads', 'num_encoder_layers', 'num_decoder_layers', 'd_ff',
                'max_pose_length', 'max_text_length', 'pad_token_id', 'bos_token_id',
                'eos_token_id', 'max_epochs', 'patience', 'seed', 'num_samples', 'pose_length', 'text_length']
    float_keys = ['learning_rate', 'weight_decay', 'dropout', 'label_smoothing', 'gradient_clip',
                  'teacher_forcing_ratio', 'train_split', 'val_split', 'test_split']
    for cfg in configs:
        for k in int_keys:
            if k in cfg:
                try:
                    cfg[k] = int(float(str(cfg[k])))
                except (ValueError, TypeError):
                    pass
        for k in float_keys:
            if k in cfg:
                try:
                    cfg[k] = float(str(cfg[k]))
                except (ValueError, TypeError):
                    pass

    print(f'\n  Strategy: {strategy}')
    print(f'  Experiments: {len(configs)}')
    print(f'  Max epochs per experiment: {base_config.get("max_epochs", 15)}')

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f'  Device: {device}')

    exp_manager = ExperimentManager(base_dir)

    for i, cfg in enumerate(configs):
        lr_val = cfg.get('learning_rate', 0)
        if isinstance(lr_val, str):
            lr_val = float(lr_val)
        exp_name = f'exp_{i+1:03d}_lr{lr_val:.0e}_{cfg.get("optimizer", "adamw")}'
        exp_dir = exp_manager.create_experiment(exp_name, cfg)
        exp_id = exp_dir.name

        print(f'\n{"="*70}')
        print(f'  [{i+1}/{len(configs)}] {exp_id}: {exp_name}')
        print(f'  lr={cfg.get("learning_rate")}, opt={cfg.get("optimizer")}, bs={cfg.get("batch_size")}, sched={cfg.get("scheduler")}')
        print(f'  dropout={cfg.get("dropout")}, smoothing={cfg.get("label_smoothing")}, wd={cfg.get("weight_decay")}')
        print(f'{"="*70}')

        dataset_params = {
            'num_samples': base_config.get('num_samples', 500),
            'train_split': base_config.get('train_split', 0.8),
            'val_split': base_config.get('val_split', 0.1),
            'pose_length': base_config.get('pose_length', 32),
            'text_length': base_config.get('text_length', 20),
        }

        summary = run_single_experiment(cfg, exp_dir, dataset_params, device)

        exp_manager.update_experiment_status(exp_id, 'completed', summary)
        exp_manager.save_experiment_metrics(exp_id, summary)

        print(f'\n  Result: val_loss={summary["val_loss"]:.4f} acc={summary["accuracy"]:.4f} ppl={summary["perplexity"]:.2f}')

    # Comparison
    print(f'\n{"="*70}')
    print('  EXPERIMENT COMPARISON')
    print(f'{"="*70}')

    comparator = ExperimentComparator(base_dir)
    leaderboard = comparator.get_leaderboard()
    print('\n  Leaderboard:')
    for entry in leaderboard:
        print(f'    #{entry["rank"]} {entry["exp_id"]}: val_loss={entry["val_loss"]:.4f} acc={entry["accuracy"]:.4f} lr={entry["lr"]:.6f} opt={entry["optimizer"]}')

    best = comparator.get_best()
    if best:
        print(f'\n  WINNER: {best["exp_id"]}')
        print(f'    Val Loss:  {best["metrics"].get("val_loss", "N/A"):.4f}')
        print(f'    Accuracy:  {best["metrics"].get("accuracy", "N/A"):.4f}')
        print(f'    Perplexity: {best["metrics"].get("perplexity", "N/A"):.2f}')

        best_exp_dir = exp_manager.get_experiment_dir(best["exp_id"])
        best_ckpt = best_exp_dir / 'checkpoints' / 'best.pt'
        if best_ckpt.exists():
            import shutil
            dst = os.path.join(weights_dir, 'best_baseline.pt')
            shutil.copy2(best_ckpt, dst)
            print(f'    Checkpoint: {dst}')

    # Visualizations
    print('\n  Generating comparison plots...')
    viz = ExperimentVisualizer(base_dir)
    plots = viz.generate_all_plots(output_cfg.get('plots_dir', './experiments/comparison_plots'))
    for p in plots:
        print(f'    {p}')

    # Report
    print('\n  Generating report...')
    report_gen = ReportGenerator(base_dir)
    report = report_gen.generate_report(output_cfg.get('report_path', 'docs/HYPERPARAMETER_REPORT.md'))
    print(f'    Report saved')

    print(f'\n{"="*70}')
    print('  HYPERPARAMETER SEARCH COMPLETE')
    print(f'{"="*70}')
    print(f'  Total Experiments: {len(configs)}')
    if best:
        print(f'  Best Experiment:   {best["exp_id"]}')
        print(f'  Best Val Loss:     {best["metrics"].get("val_loss", "N/A"):.4f}')
        print(f'  Best Accuracy:     {best["metrics"].get("accuracy", "N/A"):.4f}')
        print(f'  Best Perplexity:   {best["metrics"].get("perplexity", "N/A"):.2f}')
        print(f'  Checkpoint:        {os.path.join(weights_dir, "best_baseline.pt")}')
    print(f'{"="*70}')


if __name__ == '__main__':
    main()
