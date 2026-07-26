# Representative Training Documentation

SignBridge AI — Phase 16

## Overview

Trains the PoseTransformer on the representative dataset subset using the existing training
infrastructure: optimizer, scheduler, checkpointing, early stopping, mixed precision, and logging.

## Configuration

```yaml
# configs/representative_training.yaml
representative_training:
  seed: 42
  max_epochs: 30
  batch_size: 4
  learning_rate: 1e-5
  optimizer: adamw
  scheduler: cosineannealing
  gradient_clip: 1.0
  mixed_precision: true
  label_smoothing: 0.1
  dropout: 0.1
  early_stopping:
    patience: 8
    min_delta: 0.001
```

## Model

PoseTransformer with ~1.27M parameters:

| Component      | Value |
| -------------- | ----- |
| d_model        | 256   |
| nhead          | 8     |
| Encoder layers | 4     |
| Decoder layers | 4     |
| FFN dim        | 1024  |
| Max sequence   | 512   |
| Pose dim       | 258   |

## Training Loop

```
for epoch in range(1, max_epochs + 1):
    train_metrics = train_epoch(epoch)
    val_metrics = validate()

    save_checkpoint(is_best=val_loss improved)
    save_checkpoint(latest)

    early_stop(val_loss)
    scheduler.step()

    if early_stop.should_stop:
        break
```

## Outputs

| File                    | Description           |
| ----------------------- | --------------------- |
| `checkpoints/best.pt`   | Best model checkpoint |
| `checkpoints/latest.pt` | Latest checkpoint     |
| `history.csv`           | Per-epoch metrics     |
| `metrics.json`          | Summary metrics       |
| `vocabulary.json`       | Word-to-index mapping |
| `training.log`          | Training log          |

## Checkpoint Schema

```json
{
  "epoch": 12,
  "model_state_dict": "...",
  "optimizer_state_dict": "...",
  "val_loss": 6.6479,
  "val_accuracy": 0.012,
  "val_perplexity": 768.5,
  "config": {...},
  "vocab": {...}
}
```

## Usage

```bash
python scripts/run_representative_training.py --config configs/representative_training.yaml
```

## Key Design Decisions

1. **AdamW optimizer**: Weight decay regularization prevents overfitting on the small subset.

2. **CosineAnnealing**: Smoothly decays learning rate from 1e-5 to near-zero, avoiding sharp drops.

3. **Early stopping (patience=8)**: Prevents overfitting. If val_loss does not improve for 8 epochs,
   training stops.

4. **Label smoothing (0.1)**: Prevents the model from being overconfident in its predictions,
   improving generalization.

5. **Gradient clipping (1.0)**: Prevents exploding gradients in the Transformer architecture.

6. **Mixed precision**: Uses float16 for faster training on GPU. Falls back to float32 on CPU
   (no-op).

## Dependencies

- `models/transformer.py` — PoseTransformer
- `models/loss.py` — SignBridgeLoss (not used directly; CrossEntropy with label smoothing is used
  instead for simplicity)
- `training/optimizer.py` — OptimizerFactory
- `training/scheduler.py` — SchedulerFactory
- `training/checkpoint.py` — CheckpointManager
- `training/early_stopping.py` — EarlyStopping
- `training/seed.py` — SeedManager
- `training/config.py` — TrainingConfig

## Expected Duration

| Device     | Epochs | Time/Epoch | Total    |
| ---------- | ------ | ---------- | -------- |
| CPU        | 30     | ~60s       | ~30 min  |
| GPU (T4)   | 30     | ~5s        | ~2.5 min |
| GPU (A100) | 30     | ~2s        | ~1 min   |

## Monitoring

Training logs are written to stdout and `history.csv`. Use TensorBoard for real-time monitoring:

```bash
tensorboard --logdir experiments/representative/logs
```
