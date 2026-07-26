# Training Engine
SignBridge AI — Phase 12

## Overview
Production-ready training infrastructure for the Pose Transformer.

## Architecture
```
Trainer
  ├── SeedManager (reproducibility)
  ├── OptimizerFactory (Adam/AdamW/SGD/RMSProp)
  ├── SchedulerFactory (Cosine/OneCycle/LinearWarmup/Plateau)
  ├── MixedPrecisionManager (AMP)
  ├── TrainingEngine
  │     ├── train_step()
  │     ├── validation_step()
  │     ├── MetricsTracker
  │     └── Profiler
  ├── CheckpointManager (best.pt/latest.pt/epoch_x.pt)
  ├── TrainingLogger
  ├── EarlyStopping
  └── Callbacks
        ├── CheckpointCallback
        ├── EarlyStoppingCallback
        ├── LearningRateMonitorCallback
        ├── ProgressBarCallback
        └── LoggerCallback
```

## Components

### Trainer
- `fit(train_loader, val_loader)` — full training loop
- `train_epoch()` — single epoch training
- `validate_epoch()` — single epoch validation
- `save_checkpoint()` / `load_checkpoint()` — persistence
- `resume_training()` — continue from checkpoint

### Supported Optimizers
| Optimizer | Parameters |
|-----------|-----------|
| Adam | lr, betas, eps, weight_decay |
| AdamW | lr, betas, eps, weight_decay |
| SGD | lr, momentum, nesterov, weight_decay |
| RMSprop | lr, alpha, momentum, weight_decay |

### Supported Schedulers
| Scheduler | Key Parameters |
|-----------|---------------|
| CosineAnnealing | T_max, eta_min |
| OneCycleLR | max_lr, pct_start, anneal_strategy |
| LinearWarmup | warmup_steps, d_model |
| ReduceLROnPlateau | patience, factor, min_lr |

### Mixed Precision
- AMP with GradScaler
- Dynamic loss scaling
- CPU/GPU compatible

### Checkpoint Format
```python
{
    'epoch': int,
    'model_state_dict': dict,
    'optimizer_state_dict': dict,
    'scheduler_state_dict': dict,
    'metrics': dict,
    'timestamp': str,
    'config': dict,
}
```

### Metrics
- **Training**: Loss, Token Accuracy, Perplexity, Gradient Norm, Learning Rate
- **Validation**: Loss, Accuracy, Perplexity
- **Placeholders**: BLEU, WER, CER, ROUGE

## Configuration
`configs/training_engine.yaml`

## Usage
```python
from training.trainer import Trainer
from training.config import TrainingConfig

config = TrainingConfig.from_yaml('configs/training_engine.yaml')
trainer = Trainer(model, config)
history = trainer.fit(train_loader, val_loader)
```
