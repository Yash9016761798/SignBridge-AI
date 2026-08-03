# Dataset Loader Documentation

## Overview

The SignBridge AI Dataset Loader reads iSign CSV data and prepares it for sign language translation.
It handles tokenization, padding, masking, and train/val/test splits.

## Architecture

```
CSV File
    │
    ▼
┌─────────────────┐
│  Dataset Loader  │  Read and validate data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Tokenizer       │  Convert text to token IDs
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Sequence Builder│  Pad, mask, create tensors
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Batch Builder   │  Create batched data
└─────────────────┘
```

## Components

### 1. Dataset Loader

**File:** `training/dataset_loader.py`

Loads and processes iSign CSV data:

```python
from training.dataset_loader import DatasetLoader, DatasetConfig
from tokenizer.tokenizer import Tokenizer

# Load tokenizer
tokenizer = Tokenizer.load('tokenizer/')

# Configure dataset
config = DatasetConfig(
    csv_path='iSign_v1.1.csv',
    text_column='text',
    uid_column='uid',
    max_length=50,
    train_split=0.8,
    val_split=0.1,
    test_split=0.1,
    random_seed=42
)

# Load data
loader = DatasetLoader(tokenizer, config)
loader.load()

# Split data
train, val, test = loader.split()

# Get batches
batches = loader.get_batch(train, batch_size=32)
```

### 2. Sample Dataclass

```python
@dataclass
class Sample:
    uid: str           # Unique identifier
    text: str          # Raw text
    token_ids: List[int]  # Encoded token IDs
    length: int        # Sequence length (before padding)
    attention_mask: List[int]  # Mask (1 for real tokens)
```

### 3. Sequence Builder

**File:** `training/sequence_builder.py`

Handles padding and masking:

```python
from training.sequence_builder import SequenceBuilder, SequenceConfig

config = SequenceConfig(max_length=50, padding='post')
builder = SequenceBuilder(config)

# Pad single sequence
padded = builder.pad_sequence([1, 2, 3], max_length=5)
# Output: [1, 2, 3, 0, 0]

# Create attention mask
mask = builder.create_attention_mask([1, 2, 3, 0, 0])
# Output: [1, 1, 1, 0, 0]

# Build batch
batch = builder.build_batch([[1, 2], [3, 4, 5]])
# Output: {'input_ids': [[1, 2, 0], [3, 4, 5]], 'attention_mask': [[1, 1, 0], [1, 1, 1]]}
```

## Configuration

### dataset.yaml

```yaml
dataset:
  csv_path: 'path/to/iSign_v1.1.csv'
  text_column: 'text'
  uid_column: 'uid'
  max_length: 50

  splits:
    train: 0.8
    val: 0.1
    test: 0.1
    random_seed: 42

  batch:
    size: 32
    shuffle: true
```

## Data Flow

### Loading

```
CSV File
    │
    ▼
┌─────────────────┐
│  pd.read_csv()   │  Read CSV
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validate        │  Check columns
│  Columns         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Process         │  Tokenize each row
│  Samples         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  List[Sample]    │  Store samples
└─────────────────┘
```

### Splitting

```
All Samples
    │
    ▼
┌─────────────────┐
│  Shuffle         │  Random seed
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Split           │  80/10/10
│  Indices         │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ Train │ │ Val   │
│ 80%   │ │ 10%   │
└───────┘ └───────┘
         │
         ▼
┌───────┐
│ Test  │
│ 10%   │
└───────┘
```

### Batching

```
Samples
    │
    ▼
┌─────────────────┐
│  Sort by Length   │  Optional
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pad Sequences   │  Pad to max length
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create Masks    │  Attention masks
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Batch Tensors   │  Stack arrays
└─────────────────┘
```

## API Reference

### DatasetConfig

| Parameter     | Type    | Default  | Description            |
| ------------- | ------- | -------- | ---------------------- |
| `csv_path`    | `str`   | -        | Path to CSV file       |
| `text_column` | `str`   | `'text'` | Text column name       |
| `uid_column`  | `str`   | `'uid'`  | UID column name        |
| `max_length`  | `int`   | `50`     | Max sequence length    |
| `train_split` | `float` | `0.8`    | Training split ratio   |
| `val_split`   | `float` | `0.1`    | Validation split ratio |
| `test_split`  | `float` | `0.1`    | Test split ratio       |
| `random_seed` | `int`   | `42`     | Random seed            |

### DatasetLoader

| Method                           | Input               | Output                    | Description |
| -------------------------------- | ------------------- | ------------------------- | ----------- |
| `load(csv_path)`                 | `str`               | `self`                    | Load data   |
| `split()`                        | -                   | `Tuple[List, List, List]` | Split data  |
| `get_batch(samples, batch_size)` | `List[Sample], int` | `List[Dict]`              | Get batches |
| `save_split(samples, path)`      | `List[Sample], str` | `None`                    | Save split  |
| `load_split(path)`               | `str`               | `List[Sample]`            | Load split  |

### SequenceBuilder

| Method                                  | Input             | Output                  | Description   |
| --------------------------------------- | ----------------- | ----------------------- | ------------- |
| `pad_sequence(seq, max_length)`         | `List[int], int`  | `List[int]`             | Pad sequence  |
| `create_attention_mask(seq)`            | `List[int]`       | `List[int]`             | Create mask   |
| `create_causal_mask(length)`            | `int`             | `List[List[int]]`       | Causal mask   |
| `pad_batch(sequences)`                  | `List[List[int]]` | `np.ndarray`            | Pad batch     |
| `build_batch(token_ids_list)`           | `List[List[int]]` | `Dict[str, np.ndarray]` | Build batch   |
| `build_encoder_decoder_batch(src, tgt)` | `List, List`      | `Dict[str, np.ndarray]` | Seq2seq batch |

## Batch Output Format

```python
batch = {
    'token_ids': [[1, 234, 567, 2, 0],    # [B, T]
                  [1, 89, 234, 567, 2]],
    'attention_mask': [[1, 1, 1, 1, 0],    # [B, T]
                       [1, 1, 1, 1, 1]],
    'lengths': [4, 5],                      # [B]
    'uids': ['abc-1', 'def-1'],            # [B]
    'texts': ['hello world', 'good morning']  # [B]
}
```

## Encoder-Decoder Format

```python
batch = {
    'encoder_input_ids': [[1, 234, 567, 2, 0]],     # Source
    'encoder_attention_mask': [[1, 1, 1, 1, 0]],
    'encoder_lengths': [4],
    'decoder_input_ids': [[1, 89, 234, 0, 0]],      # Target input (shifted right)
    'decoder_attention_mask': [[1, 1, 1, 0, 0]],
    'decoder_lengths': [3],
    'labels': [[89, 234, 2, 0, 0]],                  # Target output (shifted left)
    'labels_attention_mask': [[1, 1, 1, 0, 0]],
}
```

## File Structure

```
training/
├── __init__.py
├── dataset_loader.py    # DatasetLoader class
├── sequence_builder.py  # SequenceBuilder class
└── DATASET_LOADER.md    # This file
```
