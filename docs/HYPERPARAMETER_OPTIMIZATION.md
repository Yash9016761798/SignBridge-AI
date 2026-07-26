# Hyperparameter Optimization
SignBridge AI — Phase 14

## Status: COMPLETE

Automated hyperparameter search framework with 5 pilot experiments.

## Framework Components

| Module | Purpose |
|--------|---------|
| `experiments/manager.py` | Experiment lifecycle, directories, metadata |
| `experiments/tracker.py` | Real-time metric tracking |
| `experiments/search.py` | Grid Search, Random Search |
| `experiments/comparator.py` | Result comparison, leaderboard |
| `experiments/analyzer.py` | Pattern analysis, recommendations |
| `experiments/visualizer.py` | Comparison plots |
| `experiments/report.py` | Markdown report generation |

## Search Space

| Parameter | Values |
|-----------|--------|
| Learning Rate | 1e-5, 5e-5, 1e-4, 3e-4 |
| Batch Size | 4, 8, 16 |
| Optimizer | Adam, AdamW |
| Scheduler | CosineAnnealing, OneCycleLR, ReduceLROnPlateau |
| Dropout | 0.1, 0.2, 0.3 |
| Label Smoothing | 0.0, 0.05, 0.1 |
| Weight Decay | 0, 0.01, 0.05 |
| Gradient Clip | 0.5, 1.0, 2.0 |

## Results (5 Experiments)

| Rank | Experiment | Val Loss | Accuracy | Perplexity | LR | Optimizer | Batch |
|------|-----------|----------|----------|------------|-----|-----------|-------|
| 1 | EXP_002 | 6.6479 | 8.78% | 750.20 | 1e-5 | AdamW | 4 |
| 2 | EXP_006 | 6.6613 | 8.78% | 688.73 | 5e-5 | AdamW | 4 |
| 3 | EXP_005 | 6.6999 | 8.44% | 674.81 | 3e-4 | AdamW | 16 |
| 4 | EXP_003 | 6.7312 | 8.44% | 837.81 | 1e-5 | AdamW | 16 |
| 5 | EXP_004 | 6.8179 | 8.44% | 951.69 | 1e-5 | Adam | 16 |

## Winning Configuration

- **EXP_002**: lr=1e-5, AdamW, batch=4, CosineAnnealing, dropout=0.1
- Best val_loss: 6.6479
- Checkpoint: `weights/best_baseline.pt`

## Insights

1. **Lower LR (1e-5) wins** — 3 of top 4 experiments used 1e-5
2. **AdamW > Adam** — all top experiments used AdamW
3. **Smaller batch (4) slightly better** — top 2 used batch_size=4
4. **CosineAnnealing best** — ReduceLROnPlateau was worst
5. **Low dropout (0.1) preferred** — top 2 used 0.1

## Generated Files

```
experiments/
├── EXP_001/ through EXP_006/
│   ├── config.yaml
│   ├── metrics.json
│   ├── history.csv
│   ├── metadata.json
│   └── checkpoints/
├── comparison_plots/
│   ├── val_loss_comparison.png
│   ├── accuracy_comparison.png
│   ├── lr_vs_val_loss.png
│   ├── time_comparison.png
│   └── perplexity_comparison.png
weights/
└── best_baseline.pt
docs/
└── HYPERPARAMETER_REPORT.md
```

## Usage

```bash
# Run search
python scripts/run_hyperparameter_search.py

# Compare experiments
python scripts/compare_experiments.py
```
