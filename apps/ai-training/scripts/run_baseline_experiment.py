"""
Baseline Training Experiment
SignBridge AI — First Real Training

Trains Pose Transformer on small pilot dataset (500 samples).
Verifies convergence, checkpoints, metrics, and logging.
"""
import sys
import os
import json
import time
import csv
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import yaml
from pathlib import Path
import random

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from training.seed import SeedManager
from training.optimizer import OptimizerFactory
from training.scheduler import SchedulerFactory
from training.mixed_precision import MixedPrecisionManager
from training.checkpoint import CheckpointManager
from training.logger import TrainingLogger
from training.metrics import MetricsTracker
from training.early_stopping import EarlyStopping
from training.profiler import Profiler
from training.config import TrainingConfig
from training.engine import TrainingEngine
from models.transformer import PoseTransformer
from models.loss import SignBridgeLoss


# =============================================================================
# MOCK DATASET
# =============================================================================
class MockISLDataset(Dataset):
    """Mock ISL dataset with pose and text data."""

    def __init__(self, size=500, pose_len=32, num_lm=33, num_f=5, text_len=20, vocab_size=1000, seed=42):
        self.size = size
        self.pose_len = pose_len
        self.num_lm = num_lm
        self.num_f = num_f
        self.text_len = text_len
        self.vocab_size = vocab_size

        rng = random.Random(seed)
        self.samples = []
        for i in range(size):
            pose = np.random.randn(pose_len, num_lm, num_f).astype(np.float32)
            text_len_actual = rng.randint(3, text_len - 2)
            input_ids = np.zeros(text_len, dtype=np.int64)
            input_ids[0] = 1  # BOS
            input_ids[1:text_len_actual + 1] = np.random.randint(4, vocab_size, size=text_len_actual)
            input_ids[text_len_actual + 1] = 2  # EOS

            target_ids = np.zeros(text_len, dtype=np.int64)
            target_ids[:text_len_actual] = input_ids[1:text_len_actual + 1]
            target_ids[text_len_actual] = 2  # EOS

            attention_mask = np.zeros(text_len, dtype=np.int64)
            attention_mask[:text_len_actual + 2] = 1

            pose_mask = np.zeros(pose_len, dtype=np.bool_)

            self.samples.append({
                'pose_tensor': pose,
                'input_ids': input_ids,
                'target_ids': target_ids,
                'attention_mask': attention_mask,
                'pose_mask': pose_mask,
                'sequence_length': pose_len,
            })

    def __len__(self):
        return self.size

    def __getitem__(self, idx):
        return {k: torch.tensor(v) if isinstance(v, np.ndarray) else v for k, v in self.samples[idx].items()}


def dict_collate(batch):
    keys = batch[0].keys()
    result = {}
    for k in keys:
        vals = [b[k] for b in batch]
        if isinstance(vals[0], torch.Tensor):
            result[k] = torch.stack(vals)
        else:
            result[k] = vals
    return result


# =============================================================================
# PLOTTING
# =============================================================================
def generate_plots(history, plots_dir):
    os.makedirs(plots_dir, exist_ok=True)

    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
    except ImportError:
        print('  [WARN] matplotlib not available, skipping plots')
        return

    epochs = list(range(1, len(history.get('avg_loss', [])) + 1))
    if not epochs:
        return

    # Training Loss
    if 'avg_loss' in history:
        plt.figure(figsize=(10, 6))
        plt.plot(epochs, history['avg_loss'], 'b-o', label='Training Loss')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.title('Training Loss')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig(os.path.join(plots_dir, 'training_loss.png'), dpi=150, bbox_inches='tight')
        plt.close()

    # Validation Loss
    if 'val_loss' in history:
        plt.figure(figsize=(10, 6))
        plt.plot(epochs[:len(history['val_loss'])], history['val_loss'], 'r-o', label='Validation Loss')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.title('Validation Loss')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig(os.path.join(plots_dir, 'validation_loss.png'), dpi=150, bbox_inches='tight')
        plt.close()

    # Accuracy
    if 'avg_accuracy' in history:
        plt.figure(figsize=(10, 6))
        plt.plot(epochs, history['avg_accuracy'], 'g-o', label='Training Accuracy')
        if 'val_accuracy' in history:
            plt.plot(epochs[:len(history['val_accuracy'])], history['val_accuracy'], 'm-o', label='Validation Accuracy')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.title('Token Accuracy')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig(os.path.join(plots_dir, 'accuracy.png'), dpi=150, bbox_inches='tight')
        plt.close()

    # Learning Rate
    if 'learning_rate' in history:
        plt.figure(figsize=(10, 6))
        plt.plot(epochs, history['learning_rate'], 'c-o', label='Learning Rate')
        plt.xlabel('Epoch')
        plt.ylabel('Learning Rate')
        plt.title('Learning Rate Schedule')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig(os.path.join(plots_dir, 'learning_rate.png'), dpi=150, bbox_inches='tight')
        plt.close()

    print(f'  Plots saved to {plots_dir}')


# =============================================================================
# INFERENCE
# =============================================================================
@torch.no_grad()
def run_inference(model, val_loader, vocab, device, num_samples=10):
    model.eval()
    results = []
    count = 0

    for batch in val_loader:
        if count >= num_samples:
            break
        pose = batch['pose_tensor'].to(device)
        target_ids = batch['target_ids'].to(device)
        B = pose.size(0)

        generated = model.predict(pose, max_length=20)

        for i in range(min(B, num_samples - count)):
            pred_tokens = generated[i]
            gt_tokens = target_ids[i].cpu().tolist()

            pred_text = vocab.decode(pred_tokens)
            gt_text = vocab.decode(gt_tokens)

            mask = target_ids[i] != 0
            correct = (torch.tensor(pred_tokens[:len(gt_tokens)]) == target_ids[i][:len(pred_tokens)]).float()
            acc = correct[mask[:len(correct)]].mean().item() if mask[:len(correct)].sum() > 0 else 0

            results.append({
                'ground_truth': gt_text,
                'prediction': pred_text,
                'accuracy': acc,
            })
            count += 1

    return results


class SimpleVocab:
    def __init__(self, size=1000):
        self.size = size
        self.id2word = {0: '<pad>', 1: '<bos>', 2: '<eos>', 3: '<unk>'}
        for i in range(4, size):
            self.id2word[i] = f'token_{i}'

    def decode(self, ids):
        tokens = []
        for tid in ids:
            if tid == 2:
                break
            if tid in (0, 1, 3):
                continue
            tokens.append(self.id2word.get(tid, f'<{tid}>'))
        return ' '.join(tokens) if tokens else '<empty>'


# =============================================================================
# MAIN
# =============================================================================
def main():
    print('=' * 70)
    print('  SIGNBRIDGE AI — BASELINE TRAINING EXPERIMENT')
    print('=' * 70)

    # Load config
    config_path = r'C:\Users\Gaurav Gopal Gosavi\OneDrive\Desktop\Sign languageproject\ai-training\configs\baseline_training.yaml'
    with open(config_path, 'r', encoding='utf-8') as f:
        raw_config = yaml.safe_load(f)

    flat_config = {}
    for section in raw_config.values():
        if isinstance(section, dict):
            flat_config.update(section)
    config = TrainingConfig(flat_config)

    # Setup directories
    base_dir = Path(config.get('base_dir', './experiments/baseline'))
    plots_dir = Path(config.get('plots_dir', str(base_dir / 'plots')))
    ckpt_dir = Path(config.get('checkpoint_dir', str(base_dir / 'checkpoints')))
    log_dir = Path(config.get('log_dir', str(base_dir / 'logs')))
    for d in [base_dir, plots_dir, ckpt_dir, log_dir]:
        d.mkdir(parents=True, exist_ok=True)

    # Save config
    with open(base_dir / 'config.yaml', 'w', encoding='utf-8') as f:
        yaml.dump(raw_config, f, default_flow_style=False)

    # Seed
    SeedManager(config.get('seed', 42)).set_seed()
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f'\n  Device: {device}')

    # Create dataset
    print('\n--- Dataset ---')
    ds_cfg = raw_config.get('dataset', {})
    full_dataset = MockISLDataset(
        size=ds_cfg.get('num_samples', 500),
        pose_len=ds_cfg.get('pose_length', 32),
        num_lm=ds_cfg.get('num_landmarks', 33),
        num_f=ds_cfg.get('num_features', 5),
        text_len=ds_cfg.get('text_length', 20),
        vocab_size=ds_cfg.get('vocab_size', 1000),
        seed=config.get('seed', 42),
    )
    print(f'  Total samples: {len(full_dataset)}')

    # Split
    n = len(full_dataset)
    n_train = int(n * 0.8)
    n_val = int(n * 0.1)
    n_test = n - n_train - n_val

    train_ds, val_ds, test_ds = torch.utils.data.random_split(
        full_dataset, [n_train, n_val, n_test],
        generator=torch.Generator().manual_seed(42),
    )
    print(f'  Train: {len(train_ds)} | Val: {len(val_ds)} | Test: {len(test_ds)}')

    batch_size = config.get('batch_size', 8)
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, collate_fn=dict_collate)
    val_loader = DataLoader(val_ds, batch_size=batch_size, collate_fn=dict_collate)
    test_loader = DataLoader(test_ds, batch_size=batch_size, collate_fn=dict_collate)

    # Create model
    print('\n--- Model ---')
    model_cfg = raw_config.get('model', {})
    model = PoseTransformer(
        vocab_size=model_cfg.get('vocab_size', 1000),
        num_landmarks=model_cfg.get('num_landmarks', 33),
        num_features=model_cfg.get('num_features', 5),
        d_model=model_cfg.get('d_model', 128),
        num_heads=model_cfg.get('num_heads', 4),
        num_encoder_layers=model_cfg.get('num_encoder_layers', 3),
        num_decoder_layers=model_cfg.get('num_decoder_layers', 3),
        d_ff=model_cfg.get('d_ff', 256),
        max_pose_length=model_cfg.get('max_pose_length', 32),
        max_text_length=model_cfg.get('max_text_length', 20),
        dropout=model_cfg.get('dropout', 0.1),
        pad_token_id=model_cfg.get('pad_token_id', 0),
        bos_token_id=model_cfg.get('bos_token_id', 1),
        eos_token_id=model_cfg.get('eos_token_id', 2),
    ).to(device)
    params = model.get_num_parameters()
    print(f'  Parameters: {params["total"]:,} total, {params["trainable"]:,} trainable')

    # Loss, Optimizer, Scheduler
    loss_fn = SignBridgeLoss(
        vocab_size=model_cfg.get('vocab_size', 1000),
        pad_token_id=model_cfg.get('pad_token_id', 0),
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
        T_max=config.get('max_epochs', 20),
    )

    # Mixed Precision
    mp = MixedPrecisionManager(enabled=config.get('mixed_precision', False))

    # Engine
    engine = TrainingEngine(
        model=model,
        loss_fn=loss_fn,
        optimizer=optimizer,
        scheduler=scheduler,
        device=device,
        mixed_precision=mp,
        gradient_clip=config.get('gradient_clip', 1.0),
    )

    # Checkpoint
    ckpt_mgr = CheckpointManager(checkpoint_dir=str(ckpt_dir))

    # Early Stopping
    es = EarlyStopping(
        patience=config.get('patience', 10),
        min_delta=config.get('min_delta', 0.001),
        monitor='val_loss',
        mode='min',
    )

    # Training loop
    print('\n--- Training ---')
    max_epochs = config.get('max_epochs', 20)
    history = {
        'avg_loss': [], 'val_loss': [], 'avg_accuracy': [], 'val_accuracy': [],
        'learning_rate': [], 'epoch_duration': [], 'gradient_norm': [],
        'perplexity': [], 'val_perplexity': [],
    }
    best_val_loss = float('inf')
    best_epoch = 0
    total_train_time = 0

    for epoch in range(max_epochs):
        epoch_start = time.time()

        # Train
        model.train()
        train_losses = []
        train_accs = []
        train_gn = []

        for batch in train_loader:
            optimizer.zero_grad()
            pose = batch['pose_tensor'].to(device)
            input_ids = batch['input_ids'].to(device)
            target_ids = batch['target_ids'].to(device)
            pose_mask = batch.get('pose_mask')
            if pose_mask is not None:
                pose_mask = pose_mask.to(device)

            with mp:
                output = model(pose, input_ids, pose_mask)
                loss = loss_fn(output['logits'], target_ids)

            mp.backward(loss)
            mp.step(optimizer)

            gn = 0.0
            for p in model.parameters():
                if p.grad is not None:
                    gn += p.grad.data.norm(2).item() ** 2
            gn = gn ** 0.5
            if config.get('gradient_clip', 0) > 0:
                torch.nn.utils.clip_grad_norm_(model.parameters(), config['gradient_clip'])

            acc = loss_fn.compute_accuracy(output['logits'], target_ids).item()
            train_losses.append(loss.item())
            train_accs.append(acc)
            train_gn.append(gn)

        if scheduler is not None and not isinstance(scheduler, torch.optim.lr_scheduler.ReduceLROnPlateau):
            scheduler.step()

        avg_train_loss = sum(train_losses) / len(train_losses)
        avg_train_acc = sum(train_accs) / len(train_accs)
        avg_gn = sum(train_gn) / len(train_gn)
        lr = optimizer.param_groups[0]['lr']

        # Validate
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
                vloss = loss_fn(out['logits'], target_ids)
                vacc = loss_fn.compute_accuracy(out['logits'], target_ids).item()
                val_losses.append(vloss.item())
                val_accs.append(vacc)

        avg_val_loss = sum(val_losses) / len(val_losses) if val_losses else 0
        avg_val_acc = sum(val_accs) / len(val_accs) if val_accs else 0
        epoch_time = time.time() - epoch_start
        total_train_time += epoch_time

        perplexity = min(np.exp(avg_train_loss), 1e10)
        val_perplexity = min(np.exp(avg_val_loss), 1e10)

        history['avg_loss'].append(avg_train_loss)
        history['val_loss'].append(avg_val_loss)
        history['avg_accuracy'].append(avg_train_acc)
        history['val_accuracy'].append(avg_val_acc)
        history['learning_rate'].append(lr)
        history['epoch_duration'].append(epoch_time)
        history['gradient_norm'].append(avg_gn)
        history['perplexity'].append(perplexity)
        history['val_perplexity'].append(val_perplexity)

        marker = ''
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            best_epoch = epoch + 1
            marker = ' *'
            ckpt_mgr.save_epoch(model, optimizer, scheduler, epoch, {'val_loss': avg_val_loss, 'val_acc': avg_val_acc})
            ckpt_mgr.save(model.state_dict(), 'best.pt', is_best=True)

        ckpt_mgr.save_epoch(model, optimizer, scheduler, epoch, {'val_loss': avg_val_loss, 'val_acc': avg_val_acc})
        ckpt_mgr.save(model.state_dict(), 'latest.pt')

        print(f'  Epoch {epoch+1:2d}/{max_epochs} | '
              f'loss={avg_train_loss:.4f} acc={avg_train_acc:.4f} | '
              f'val_loss={avg_val_loss:.4f} val_acc={avg_val_acc:.4f} | '
              f'ppl={perplexity:.2f} | lr={lr:.6f} | '
              f'time={epoch_time:.2f}s{marker}')

        if es(avg_val_loss, model):
            print(f'\n  Early stopping at epoch {epoch+1}')
            break

    # Save metrics
    metrics_path = base_dir / 'metrics.json'
    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2, default=str)

    # Save history CSV
    csv_path = base_dir / 'history.csv'
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        header = ['epoch'] + list(history.keys())
        writer.writerow(header)
        for i in range(len(history['avg_loss'])):
            writer.writerow([i + 1] + [history[k][i] for k in history.keys()])

    # Generate plots
    print('\n--- Plots ---')
    generate_plots(history, str(plots_dir))

    # Inference
    print('\n--- Inference (10 validation samples) ---')
    vocab = SimpleVocab(model_cfg.get('vocab_size', 1000))
    es.restore(model)
    results = run_inference(model, val_loader, vocab, device, num_samples=10)
    for i, r in enumerate(results):
        print(f'  [{i+1}] GT:     {r["ground_truth"]}')
        print(f'      Pred:   {r["prediction"]}')
        print(f'      Acc:    {r["accuracy"]:.4f}')

    # Final summary
    print('\n' + '=' * 70)
    print('  BASELINE EXPERIMENT COMPLETE')
    print('=' * 70)
    print(f'  Parameter Count:    {params["total"]:,}')
    print(f'  Training Time:      {total_train_time:.2f}s ({total_train_time/60:.1f}m)')
    print(f'  Best Epoch:         {best_epoch}')
    print(f'  Best Val Loss:      {best_val_loss:.4f}')
    print(f'  Best Val Accuracy:  {history["val_accuracy"][best_epoch-1]:.4f}')
    print(f'  Best Perplexity:    {history["perplexity"][best_epoch-1]:.2f}')
    print(f'  Checkpoint Path:    {ckpt_mgr.checkpoint_dir}')
    print(f'  Experiments Dir:    {base_dir}')
    print('=' * 70)


if __name__ == '__main__':
    main()
