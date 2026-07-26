# Baseline Experiment Report
SignBridge AI — Phase 13

## Status: COMPLETE

First real training experiment on a small pilot dataset.

## Dataset

| Split | Samples |
|-------|---------|
| Train | 400 |
| Validation | 50 |
| Test | 50 |
| **Total** | **500** |

Mock ISL data with random pose (32 frames, 33 landmarks, 5 features) and random text (vocab 1000, max length 20).

## Configuration

| Parameter | Value |
|-----------|-------|
| Epochs | 20 (early stop at 12) |
| Batch Size | 8 |
| Learning Rate | 0.0001 |
| Optimizer | AdamW |
| Scheduler | CosineAnnealing |
| Weight Decay | 0.01 |
| Gradient Clip | 1.0 |
| Label Smoothing | 0.1 |

## Model

| Component | Value |
|-----------|-------|
| Architecture | PoseTransformer |
| d_model | 128 |
| Heads | 4 |
| Encoder Layers | 3 |
| Decoder Layers | 3 |
| d_ff | 256 |
| **Parameters** | **1,272,808** |

## Training Results

| Epoch | Train Loss | Val Loss | Accuracy | Perplexity |
|-------|-----------|----------|----------|------------|
| 1 | 6.7971 | 6.6971 | 7.64% | 895.29 |
| 2 | 6.6592 | 6.6931 | 8.91% | 779.95 |
| 3 | 6.6232 | 6.6931 | 8.97% | 752.37 |
| 6 | 6.5461 | 6.7018 | 8.93% | 696.54 |
| 9 | 6.4488 | 6.7137 | 8.95% | 631.96 |
| 12 | 6.3678 | 6.7365 | 9.02% | 582.79 |

**Best epoch: 3** (val_loss=6.6931)

## Final Metrics

| Metric | Value |
|--------|-------|
| Parameter Count | 1,272,808 |
| Training Time | 102.24s (1.7m) |
| Best Epoch | 3 |
| Best Val Loss | 6.6931 |
| Best Accuracy | 8.56% |
| Best Perplexity | 752.37 |

## Training Curves

- `experiments/baseline/plots/training_loss.png` — decreasing (6.80 -> 6.37)
- `experiments/baseline/plots/validation_loss.png` — flat (6.70)
- `experiments/baseline/plots/accuracy.png` — slight increase (7.6% -> 9.0%)
- `experiments/baseline/plots/learning_rate.png` — cosine decay

## Example Predictions

| # | Ground Truth | Prediction | Accuracy |
|---|-------------|------------|----------|
| 1 | token_107 token_887 ... | (empty) | 10.0% |
| 3 | token_682 token_328 token_763 | (empty) | 25.0% |
| 8 | token_130 token_583 ... | (empty) | 16.7% |

Model has not yet learned to generate tokens (predicts EOS immediately).

## Observations

1. **Training loss decreased** from 6.80 to 6.37 — model is learning
2. **Validation loss flat** — expected on random data with no real patterns
3. **Accuracy low** (8-9%) — near random for vocab of 1000 tokens
4. **Early stopping triggered** at epoch 12 — val loss stopped improving
5. **Gradient norms stable** (~2-5) — no exploding gradients
6. **No NaN** — numerical stability confirmed

## Known Problems

1. Random data — no real pose-text correlation to learn
2. Small model — d_model=128 may be underpowered
3. No real ISL data — predictions are meaningless

## Recommendations

1. Use real iSign dataset for next experiment
2. Increase model size (d_model=256 or 512)
3. Increase epochs to 50+ with real data
4. Use larger batch size (16 or 32) with GPU
5. Enable mixed_precision=true for GPU training
6. Add learning rate warmup for larger models

## Files

```
experiments/baseline/
├── config.yaml          # Full configuration
├── metrics.json         # Training history
├── history.csv          # Epoch-by-epoch metrics
├── plots/
│   ├── training_loss.png
│   ├── validation_loss.png
│   ├── accuracy.png
│   └── learning_rate.png
└── checkpoints/
    ├── best.pt
    ├── latest.pt
    └── epoch_*.pt
```
