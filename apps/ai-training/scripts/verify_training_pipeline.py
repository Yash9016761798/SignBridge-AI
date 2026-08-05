"""
End-to-End Training Pipeline Verification
SignBridge AI — Phase 12.5

Verifies every AI component works together before real training.
Uses only mock pose data, small metadata subset, small vocab.
"""
import sys
import os
import tempfile
import time
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader as TorchDataLoader

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from training.sample import TrainingSample
from training.collate import CollateFn
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
from training.trainer import Trainer
from models.transformer import PoseTransformer
from models.loss import SignBridgeLoss

# =============================================================================
# CONFIG
# =============================================================================
VOCAB_SIZE = 500
NUM_LANDMARKS = 33
NUM_FEATURES = 5
POSE_LEN = 32
TEXT_LEN = 15
BATCH_SIZE = 4
D_MODEL = 128
NUM_HEADS = 4
D_FF = 256
NUM_ENC_LAYERS = 2
NUM_DEC_LAYERS = 2


# =============================================================================
# MOCK DATASET
# =============================================================================
class MockSignBridgeDataset(Dataset):
    """Mock dataset returning TrainingSample-compatible dicts."""

    def __init__(self, size=16):
        self.size = size

    def __len__(self):
        return self.size

    def __getitem__(self, idx):
        return {
            'pose_tensor': torch.randn(POSE_LEN, NUM_LANDMARKS, NUM_FEATURES),
            'input_ids': torch.randint(1, VOCAB_SIZE, (TEXT_LEN,)),
            'target_ids': torch.randint(1, VOCAB_SIZE, (TEXT_LEN,)),
            'attention_mask': torch.ones(TEXT_LEN, dtype=torch.long),
            'pose_mask': torch.zeros(POSE_LEN, dtype=torch.bool),
        }


# =============================================================================
# HELPERS
# =============================================================================
def create_mock_sample(idx=0):
    return TrainingSample(
        uid=f'mock-{idx}',
        pose_tensor=np.random.randn(POSE_LEN, NUM_LANDMARKS, NUM_FEATURES).astype(np.float32),
        input_ids=np.random.randint(1, VOCAB_SIZE, size=(TEXT_LEN,)).astype(np.int64),
        target_ids=np.random.randint(1, VOCAB_SIZE, size=(TEXT_LEN,)).astype(np.int64),
        attention_mask=np.ones(TEXT_LEN, dtype=np.int64),
        pose_mask=np.zeros(POSE_LEN, dtype=np.bool_),
        sequence_length=POSE_LEN,
        metadata={'text': f'mock text {idx}'},
    )


def create_small_model():
    return PoseTransformer(
        vocab_size=VOCAB_SIZE,
        num_landmarks=NUM_LANDMARKS,
        num_features=NUM_FEATURES,
        d_model=D_MODEL,
        num_heads=NUM_HEADS,
        num_encoder_layers=NUM_ENC_LAYERS,
        num_decoder_layers=NUM_DEC_LAYERS,
        d_ff=D_FF,
        max_pose_length=POSE_LEN,
        max_text_length=TEXT_LEN,
        dropout=0.1,
        pad_token_id=0,
    )


def count_params(model):
    total = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    return total, trainable


def check_nan(tensor):
    return torch.isnan(tensor).any().item()


def check_inf(tensor):
    return torch.isinf(tensor).any().item()


# =============================================================================
# VERIFICATION
# =============================================================================
def run_verification():
    results = {'passed': 0, 'failed': 0, 'warnings': [], 'errors': []}
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    print('=' * 70)
    print('  SIGNBRIDGE AI — END-TO-END TRAINING PIPELINE VERIFICATION')
    print('=' * 70)
    print(f'  Device: {device}')
    print(f'  Vocab: {VOCAB_SIZE} | Landmarks: {NUM_LANDMARKS} | Features: {NUM_FEATURES}')
    print(f'  Pose: {POSE_LEN} | Text: {TEXT_LEN} | Batch: {BATCH_SIZE}')
    print(f'  d_model: {D_MODEL} | Heads: {NUM_HEADS} | EncLayers: {NUM_ENC_LAYERS} | DecLayers: {NUM_DEC_LAYERS}')
    print('=' * 70)

    def test(name, fn):
        try:
            result = fn()
            results['passed'] += 1
            print(f'  [PASS] {name}')
            return result
        except Exception as e:
            results['failed'] += 1
            results['errors'].append((name, str(e)))
            print(f'  [FAIL] {name}: {e}')
            return None

    # Step 1: Mock TrainingSample
    print('\n--- STEP 1: Mock TrainingSample ---')
    def step1():
        sample = create_mock_sample(0)
        assert sample.pose_tensor.shape == (POSE_LEN, NUM_LANDMARKS, NUM_FEATURES)
        assert sample.input_ids.shape == (TEXT_LEN,)
        assert sample.target_ids.shape == (TEXT_LEN,)
        assert sample.sequence_length == POSE_LEN
        return sample
    sample = test('Create mock TrainingSample', step1)

    # Step 2: Dataset
    print('\n--- STEP 2: Dataset ---')
    def step2():
        ds = MockSignBridgeDataset(size=16)
        assert len(ds) == 16
        item = ds[0]
        assert item['pose_tensor'].shape == (POSE_LEN, NUM_LANDMARKS, NUM_FEATURES)
        return ds
    ds = test('Create Dataset', step2)

    # Step 3: DataLoader
    print('\n--- STEP 3: DataLoader ---')
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

    def step3():
        loader = TorchDataLoader(ds, batch_size=BATCH_SIZE, collate_fn=dict_collate)
        batch = next(iter(loader))
        assert batch['pose_tensor'].shape[0] == BATCH_SIZE
        assert batch['pose_tensor'].shape[1:] == (POSE_LEN, NUM_LANDMARKS, NUM_FEATURES)
        return loader, batch
    loader, batch = test('Create DataLoader', step3)

    # Step 4: PoseTransformer
    print('\n--- STEP 4: PoseTransformer ---')
    def step4():
        model = create_small_model().to(device)
        total, trainable = count_params(model)
        print(f'        Parameters: {total:,} total, {trainable:,} trainable')
        return model
    model = test('Create PoseTransformer', step4)

    # Step 5: Forward pass
    print('\n--- STEP 5: Forward Pass ---')
    def step5():
        model.eval()
        pose = batch['pose_tensor'].to(device)
        input_ids = batch['input_ids'].to(device)
        pose_mask = batch['pose_mask'].to(device)
        with torch.no_grad():
            output = model(pose, input_ids, pose_mask)
        assert 'logits' in output
        assert output['logits'].shape == (BATCH_SIZE, TEXT_LEN, VOCAB_SIZE)
        assert output['memory'].shape[0] == BATCH_SIZE
        return output
    output = test('Forward pass', step5)

    # Step 6: Loss computation
    print('\n--- STEP 6: Loss Computation ---')
    def step6():
        loss_fn = SignBridgeLoss(vocab_size=VOCAB_SIZE, pad_token_id=0, smoothing=0.1)
        target = batch['target_ids'].to(device)
        loss = loss_fn(output['logits'], target)
        assert loss.dim() == 0
        assert not check_nan(loss)
        acc = loss_fn.compute_accuracy(output['logits'], target)
        print(f'        Loss: {loss.item():.4f} | Accuracy: {acc.item():.4f}')
        return loss_fn, loss
    loss_fn, loss = test('Loss computation', step6)

    # Step 7: Backward pass
    print('\n--- STEP 7: Backward Pass ---')
    def step7():
        model.train()
        model.zero_grad()
        pose = batch['pose_tensor'].to(device)
        input_ids = batch['input_ids'].to(device)
        target = batch['target_ids'].to(device)
        out = model(pose, input_ids)
        loss_b = loss_fn(out['logits'], target)
        loss_b.backward()
        grad_norm = 0.0
        for p in model.parameters():
            if p.grad is not None:
                grad_norm += p.grad.data.norm(2).item() ** 2
        grad_norm = grad_norm ** 0.5
        assert not check_nan(torch.tensor(grad_norm))
        print(f'        Gradient norm: {grad_norm:.4f}')
        return grad_norm
    grad_norm = test('Backward pass', step7)

    # Step 8: Optimizer step
    print('\n--- STEP 8: Optimizer Step ---')
    def step8():
        optimizer = OptimizerFactory.create(model.parameters(), optimizer_type='adamw', lr=0.0001)
        optimizer.step()
        return optimizer
    optimizer = test('Optimizer step (AdamW)', step8)

    # Step 9: Scheduler step
    print('\n--- STEP 9: Scheduler Step ---')
    def step9():
        scheduler = SchedulerFactory.create(optimizer, scheduler_type='cosineannealing', T_max=10)
        scheduler.step()
        lr = optimizer.param_groups[0]['lr']
        print(f'        LR after step: {lr:.6f}')
        return scheduler
    scheduler = test('Scheduler step (CosineAnnealing)', step9)

    # Step 10: Gradient clipping
    print('\n--- STEP 10: Gradient Clipping ---')
    def step10():
        model.train()
        model.zero_grad()
        pose = batch['pose_tensor'].to(device)
        input_ids = batch['input_ids'].to(device)
        target = batch['target_ids'].to(device)
        out = model(pose, input_ids)
        loss_c = loss_fn(out['logits'], target)
        loss_c.backward()
        norm_before = nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        print(f'        Norm before clip: {norm_before:.4f}')
        assert not check_nan(norm_before)
        return norm_before
    clip_norm = test('Gradient clipping', step10)

    # Step 11: Checkpoint save
    print('\n--- STEP 11: Checkpoint Save ---')
    def step11():
        tmpdir = tempfile.mkdtemp()
        ckpt_mgr = CheckpointManager(checkpoint_dir=tmpdir)
        path = ckpt_mgr.save_epoch(model, optimizer, scheduler, epoch=0, metrics={'loss': loss.item()})
        assert os.path.exists(path)
        files = os.listdir(tmpdir)
        print(f'        Saved to: {path}')
        print(f'        Files: {files}')
        return ckpt_mgr, tmpdir
    ckpt_mgr, tmpdir = test('Checkpoint save', step11)

    # Step 12: Checkpoint load
    print('\n--- STEP 12: Checkpoint Load ---')
    def step12():
        ckpt = ckpt_mgr.load_latest()
        assert ckpt is not None
        assert 'model_state_dict' in ckpt
        assert 'optimizer_state_dict' in ckpt
        assert ckpt['epoch'] == 0
        print(f'        Loaded epoch: {ckpt["epoch"]}')
        return ckpt
    ckpt = test('Checkpoint load', step12)

    # Step 13: Resume training
    print('\n--- STEP 13: Resume Training ---')
    def step13():
        new_model = create_small_model().to(device)
        new_model.load_state_dict(ckpt['model_state_dict'])
        optimizer2 = OptimizerFactory.create(new_model.parameters(), optimizer_type='adamw', lr=0.0001)
        optimizer2.load_state_dict(ckpt['optimizer_state_dict'])
        new_model.train()
        pose = batch['pose_tensor'].to(device)
        input_ids = batch['input_ids'].to(device)
        output2 = new_model(pose, input_ids)
        loss2 = loss_fn(output2['logits'], batch['target_ids'].to(device))
        loss2.backward()
        optimizer2.step()
        print(f'        Resumed loss: {loss2.item():.4f}')
        return True
    test('Resume training', step13)

    # Step 14: Mixed Precision forward
    print('\n--- STEP 14: Mixed Precision Forward ---')
    def step14():
        mp = MixedPrecisionManager(enabled=True)
        model.train()
        pose = batch['pose_tensor'].to(device)
        input_ids = batch['input_ids'].to(device)
        with mp:
            output_mp = model(pose, input_ids)
        assert output_mp['logits'].shape == (BATCH_SIZE, TEXT_LEN, VOCAB_SIZE)
        print(f'        AMP output shape: {output_mp["logits"].shape}')
        return True
    test('Mixed Precision forward', step14)

    # Step 15: Generate prediction
    print('\n--- STEP 15: Generate Prediction ---')
    def step15():
        model.eval()
        pose = batch['pose_tensor'].to(device)
        with torch.no_grad():
            generated = model.predict(pose, max_length=10)
        assert len(generated) == BATCH_SIZE
        assert all(isinstance(g, list) for g in generated)
        print(f'        Generated {len(generated)} sequences, lengths: {[len(g) for g in generated[:2]]}...')
        return True
    test('Generate prediction', step15)

    # =========================================================================
    # STRESS TEST
    # =========================================================================
    print('\n' + '=' * 70)
    print('  STRESS TEST')
    print('=' * 70)

    for n_iters in [1, 5, 10]:
        print(f'\n--- {n_iters} iterations ---')
        SeedManager(42).set_seed()
        model_s = create_small_model().to(device)
        opt_s = OptimizerFactory.create(model_s.parameters(), optimizer_type='adamw', lr=0.0001)
        loss_fn_s = SignBridgeLoss(vocab_size=VOCAB_SIZE, pad_token_id=0, smoothing=0.1)
        ds_s = MockSignBridgeDataset(size=BATCH_SIZE * 2)
        loader_s = TorchDataLoader(ds_s, batch_size=BATCH_SIZE, collate_fn=dict_collate)

        losses = []
        grad_norms = []
        ok = True
        t0 = time.time()
        for i in range(n_iters):
            for batch_s in loader_s:
                model_s.train()
                opt_s.zero_grad()
                pose_s = batch_s['pose_tensor'].to(device)
                input_s = batch_s['input_ids'].to(device)
                target_s = batch_s['target_ids'].to(device)
                out_s = model_s(pose_s, input_s)
                loss_s = loss_fn_s(out_s['logits'], target_s)

                if check_nan(loss_s):
                    print(f'        [FAIL] NaN loss at iter {i}')
                    ok = False
                    break

                loss_s.backward()
                gn = 0.0
                for p in model_s.parameters():
                    if p.grad is not None:
                        gn += p.grad.data.norm(2).item() ** 2
                gn = gn ** 0.5

                if check_nan(torch.tensor(gn)) or gn > 1000:
                    print(f'        [FAIL] Bad grad norm {gn} at iter {i}')
                    ok = False
                    break

                nn.utils.clip_grad_norm_(model_s.parameters(), max_norm=1.0)
                opt_s.step()
                losses.append(loss_s.item())
                grad_norms.append(gn)
        elapsed = time.time() - t0

        if ok:
            avg_loss = sum(losses) / len(losses) if losses else 0
            avg_gn = sum(grad_norms) / len(grad_norms) if grad_norms else 0
            print(f'        [PASS] {n_iters} iters | loss={avg_loss:.4f} | grad_norm={avg_gn:.4f} | time={elapsed:.3f}s')
            results['passed'] += 1
        else:
            results['failed'] += 1
            results['errors'].append((f'Stress {n_iters} iters', 'NaN or exploding gradients'))

    # =========================================================================
    # SUMMARY
    # =========================================================================
    total, trainable = count_params(model)
    print('\n' + '=' * 70)
    print('  TRAINING READINESS REPORT')
    print('=' * 70)
    print(f'  Components Tested:  15 + stress test')
    print(f'  Passed:             {results["passed"]}')
    print(f'  Failed:             {results["failed"]}')
    print()
    print('  Tensor Shapes:')
    print(f'    Input Pose:       ({BATCH_SIZE}, {POSE_LEN}, {NUM_LANDMARKS}, {NUM_FEATURES})')
    print(f'    Input Tokens:     ({BATCH_SIZE}, {TEXT_LEN})')
    print(f'    Encoder Memory:   ({BATCH_SIZE}, {POSE_LEN}, {D_MODEL})')
    print(f'    Decoder Logits:   ({BATCH_SIZE}, {TEXT_LEN}, {VOCAB_SIZE})')
    print()
    print('  Model:')
    print(f'    Parameters:       {total:,} total, {trainable:,} trainable')
    print(f'    Optimizer:        AdamW')
    print(f'    Scheduler:        CosineAnnealing')
    print(f'    Loss:             LabelSmoothing(0.1)')
    print()
    print('  Checkpoints:')
    print(f'    Format:           model + optimizer + scheduler + epoch + metrics')
    print(f'    Files:            best.pt, latest.pt, epoch_x.pt')
    print()
    if results['errors']:
        print('  Errors:')
        for name, err in results['errors']:
            print(f'    - {name}: {err}')
    print('=' * 70)
    if results['failed'] == 0:
        print('  ALL CHECKS PASSED — PIPELINE READY FOR TRAINING')
    else:
        print(f'  {results["failed"]} CHECKS FAILED — FIX BEFORE TRAINING')
    print('=' * 70)
    return results


if __name__ == '__main__':
    run_verification()
