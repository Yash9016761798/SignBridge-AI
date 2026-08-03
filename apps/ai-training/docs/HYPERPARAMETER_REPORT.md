# Hyperparameter Optimization Report

SignBridge AI

## Status: COMPLETE

## Leaderboard

| Rank | Experiment | Val Loss | Accuracy | Perplexity | LR       | Optimizer | Batch |
| ---- | ---------- | -------- | -------- | ---------- | -------- | --------- | ----- |
| 1    | EXP_002    | 6.6479   | 0.0878   | 750.20     | 0.000010 | adamw     | 4     |
| 2    | EXP_006    | 6.6613   | 0.0878   | 688.73     | 0.000050 | adamw     | 4     |
| 3    | EXP_005    | 6.6999   | 0.0844   | 674.81     | 0.000300 | adamw     | 16    |
| 4    | EXP_003    | 6.7312   | 0.0844   | 837.81     | 0.000010 | adamw     | 16    |
| 5    | EXP_004    | 6.8179   | 0.0844   | 951.69     | 0.000010 | adam      | 16    |

## Best Configuration

**EXP_002**

```yaml
bos_token_id: 1
d_ff: 256
d_model: 128
eos_token_id: 2
max_epochs: 10
max_pose_length: 32
max_text_length: 20
mixed_precision: False
num_decoder_layers: 3
num_encoder_layers: 3
num_features: 5
num_heads: 4
num_landmarks: 33
num_samples: 500
pad_token_id: 0
patience: 5
pose_length: 32
seed: 42
test_split: 0.1
text_length: 20
train_split: 0.8
val_split: 0.1
vocab_size: 1000
learning_rate: 1e-05
batch_size: 4
optimizer: adamw
scheduler: cosineannealing
dropout: 0.1
label_smoothing: 0.0
weight_decay: 0.05
teacher_forcing_ratio: 1.0
gradient_clip: 2.0
```

| Metric           | Value               |
| ---------------- | ------------------- |
| total_epochs     | 10                  |
| final_train_loss | 6.620335869789123   |
| final_val_loss   | 6.6478878534757175  |
| best_val_loss    | 6.6478878534757175  |
| best_accuracy    | 0.08777155325962947 |
| training_time    | 129.28373765945435  |
| val_loss         | 6.6478878534757175  |
| accuracy         | 0.08777155325962947 |
| perplexity       | 750.197023318336    |
| train_time       | 128.33815836906433  |

## Worst Configuration

**EXP_004** - val_loss=6.817884922027588

## Top 5 Runs

1. **EXP_002**: val_loss=6.6479
1. **EXP_006**: val_loss=6.6613
1. **EXP_005**: val_loss=6.6999
1. **EXP_003**: val_loss=6.7312
1. **EXP_004**: val_loss=6.8179

## Metric Statistics

### val_loss

- Mean: 6.7116
- Min: 6.6479
- Max: 6.8179
- Std: 0.0607

### accuracy

- Mean: 0.0857
- Min: 0.0844
- Max: 0.0878
- Std: 0.0017

### perplexity

- Mean: 780.6459
- Min: 674.8129
- Max: 951.6855
- Std: 103.0526

### train_time

- Mean: 75.3378
- Min: 35.4204
- Max: 128.3382
- Std: 30.6080

## Config Impact (avg val_loss)

### learning_rate

- 5e-05: 6.6613
- 0.0003: 6.6999
- 1e-05: 6.7323

### optimizer

- adamw: 6.6851
- adam: 6.8179

### batch_size

- 4: 6.6546
- 16: 6.7496

### scheduler

- cosineannealing: 6.6851
- reducelronplateau: 6.8179

### dropout

- 0.1: 6.6851
- 0.3: 6.8179

## Recommendations

1. Best learning rate: EXP_002 (val_loss=6.6479)
1. Recommended LR range: around 5e-05
