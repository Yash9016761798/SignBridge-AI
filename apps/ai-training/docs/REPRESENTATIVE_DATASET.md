# Representative Dataset Documentation

SignBridge AI — Phase 16

## Overview

A stratified subset of the Exploration-Lab/iSign dataset, sized for demonstration without requiring
the full 127K samples. Designed to preserve sentence length distribution, vocabulary diversity, and
frequency patterns.

## Target Size

- Total: 10,000–20,000 samples (default: 15,000)
- Train: 80%
- Validation: 10%
- Test: 10%

## Stratification Strategy

### Primary Stratification: Sentence Length

Binned into five groups based on word count:

| Bin          | Word Count | Purpose                          |
| ------------ | ---------- | -------------------------------- |
| Short        | 1–5        | Common greetings, simple phrases |
| Medium-Short | 6–10       | Simple sentences                 |
| Medium       | 11–15      | Standard ISL sentences           |
| Medium-Long  | 16–20      | Complex sentences                |
| Long         | 21–50      | Rare, verbose expressions        |

### Secondary Stratification: Word Count

Ensures each bin has proportional representation proportional to the full dataset.

### Constraints

- Minimum 100 samples per bin
- Maximum 5,000 samples per bin
- Fallback: uniform sampling if stratification fails

## Files

| File             | Description                           |
| ---------------- | ------------------------------------- |
| `train.csv`      | Training split (uid, text)            |
| `validation.csv` | Validation split (uid, text)          |
| `test.csv`       | Test split (uid, text)                |
| `metadata.json`  | Statistics, vocabulary, distributions |

## Usage

### Build Dataset

```bash
python scripts/build_representative_dataset.py --config configs/representative_dataset.yaml
```

### Verify Dataset

```bash
python scripts/verify_representative_pipeline.py
```

## Metadata Schema

```json
{
  "version": "1.0",
  "source": "Exploration-Lab/iSign",
  "seed": 42,
  "total_sampled": 15000,
  "train_size": 12000,
  "validation_size": 1500,
  "test_size": 1500,
  "unique_vocab": 5000,
  "sentence_stats": { "overall": {...}, "train": {...}, ... },
  "vocabulary_stats": { "top_50_words": [...] },
  "stratification": { "primary": "sentence_length", ... }
}
```

## Design Decisions

1. **Stratified over random**: Preserves the distribution of sentence lengths and vocabulary usage,
   producing a dataset that behaves like the full corpus.

2. **80/10/10 split**: Standard train/val/test ratio. Validation for early stopping, test for final
   unbiased evaluation.

3. **Mock poses during training**: Since we do not have extracted poses on the local machine, mock
   pose data is used for training. This is acceptable because:
   - The PoseTransformer architecture is validated on 500 mock samples
   - The training pipeline (optimizer, scheduler, checkpointing) is the focus
   - Real poses will be used when running on Colab with extracted data

4. **Configurable**: All parameters in YAML. Adjust target_size, ratios, and bin sizes as needed.
