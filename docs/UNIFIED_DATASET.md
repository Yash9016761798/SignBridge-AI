# Unified Training Dataset
SignBridge AI — Phase 10C

## Overview
The unified dataset layer combines pose data and tokenized text into a single training sample for neural network input.

## Components

### TrainingSample
A single training example containing:
- `pose_tensor`: (max_frames, num_landmarks, 5) — x, y, z, visibility, confidence
- `input_ids`: (max_text_length,) — tokenized source text (with BOS)
- `target_ids`: (max_text_length,) — tokenized target text (with EOS)
- `attention_mask`: (max_text_length,) — 1 for real tokens, 0 for padding
- `pose_mask`: (max_frames,) — 1 for real frames, 0 for padding

### SignBridgeDataset
Merges pose data with tokenized text:
- Loads pose from `.npy` files
- Tokenizes text using trained Tokenizer
- Returns TrainingSample with aligned tensors

### CollateFn
Pads variable-length tensors to batch dimensions:
- Dynamic padding (minimum required size)
- Batch dimension: (batch_size, ...)

### DataLoader
Pure Python DataLoader wrapper:
- `batch_size`: samples per batch
- `shuffle`: randomize order
- `num_workers`: parallel loading
- `seed`: reproducibility

### MetadataHandler
Generates dataset statistics:
- Text length statistics (avg, min, max)
- Batch validation
- Statistics export to JSON

## Configuration
`configs/dataset.yaml` — all settings for pose, tokenizer, and training.

## Verification
```
python scripts/verify_unified_dataset.py
```

## Shape Reference
- Batch Pose: (B, max_frames, num_landmarks, 5)
- Batch Tokens: (B, max_text_length)
- Batch Labels: (B, max_text_length)
- Batch Attention: (B, max_text_length)
- Batch Pose Mask: (B, max_frames)
