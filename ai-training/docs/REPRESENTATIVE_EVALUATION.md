# Representative Evaluation Documentation
SignBridge AI — Phase 16

## Overview

Evaluates the trained model on the test set. Computes standard NLP metrics,
generates predictions CSV, produces plots, and writes a final report.

## Metrics

| Metric | Description | Range |
|--------|-------------|-------|
| **BLEU** | Bilingual Evaluation Understudy (n-gram overlap) | 0–1 (higher better) |
| **WER** | Word Error Rate (edit distance / ref length) | 0–∞ (lower better) |
| **CER** | Character Error Rate (edit distance / ref chars) | 0–∞ (lower better) |
| **ROUGE-L** | Longest Common Subsequence F1 | 0–1 (higher better) |
| **Exact Match** | Fraction of predictions exactly matching reference | 0–1 |

### BLEU (1-gram to 4-gram)

```
BLEU = BP * exp(1/N * sum(log(precision_n))

BP = brevity penalty = exp(1 - ref_len/hyp_len) if hyp_len < ref_len else 1
```

### WER

```
WER = edit_distance(ref_words, hyp_words) / len(ref_words)
```

### CER

```
CER = edit_distance(ref_chars, hyp_chars) / len(ref_chars)
```

### ROUGE-L

```
ROUGE-L = F1(LCS(ref, hyp))
Precision = LCS_len / len(hyp)
Recall = LCS_len / len(ref)
F1 = 2 * P * R / (P + R)
```

## Files

| File | Description |
|------|-------------|
| `predictions.csv` | Per-sample predictions with metrics |
| `evaluation_metrics.json` | Aggregate metrics |
| `plots/training_loss.png` | Train vs val loss |
| `plots/validation_loss.png` | Validation loss |
| `plots/accuracy.png` | Train vs val accuracy |
| `plots/bleu.png` | BLEU scores |
| `plots/wer.png` | WER scores |
| `plots/cer.png` | CER scores |
| `plots/learning_rate.png` | LR schedule |
| `report.md` | Full evaluation report |

## predictions.csv Schema

| Column | Type | Description |
|--------|------|-------------|
| uid | string | Unique video/sample identifier |
| ground_truth | string | Reference sentence |
| prediction | string | Model prediction |
| bleu | float | Sample-level BLEU |
| wer | float | Sample-level WER |
| cer | float | Sample-level CER |

## Usage

### Generate Predictions

```bash
python scripts/generate_predictions.py --experiment-dir experiments/representative
```

### Evaluate

```bash
python scripts/evaluate_representative_model.py --experiment-dir experiments/representative
```

### Full Pipeline

```bash
python scripts/verify_representative_pipeline.py
```

## Report Contents

The `report.md` includes:

1. **Dataset Statistics** — Sizes, vocab, sentence lengths
2. **Training Summary** — Epochs, time, best checkpoint
3. **Evaluation Metrics** — BLEU, WER, CER, ROUGE-L, exact match
4. **Sample Predictions** — 10 random examples with metrics
5. **Error Analysis** — Common error patterns, failure modes
6. **Future Improvements** — Suggestions for model enhancement

## Expected Results

On the representative dataset with mock poses:

| Metric | Random | Trained (Expected) |
|--------|--------|-------------------|
| BLEU | ~0.01 | ~0.05–0.15 |
| WER | ~1.5 | ~1.0–1.3 |
| CER | ~2.0 | ~1.2–1.8 |
| Exact Match | 0.0 | ~0.01–0.05 |

Note: With mock poses (random noise), the model cannot learn meaningful
pose-text alignment. These metrics reflect the training infrastructure
working correctly. Real metrics will improve with actual pose data.

## Plots

All plots are saved at 150 DPI in `experiments/representative/plots/`.
Generated using matplotlib with Agg backend (no display required).
