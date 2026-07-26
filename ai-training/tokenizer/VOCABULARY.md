# Vocabulary Documentation

## Overview

The SignBridge AI Vocabulary manages word-to-index mappings for sign language translation. It supports configurable frequency thresholds, maximum size limits, and special tokens.

## Special Tokens

| Token | Index | Purpose |
|-------|-------|---------|
| `<pad>` | 0 | Padding for batch processing |
| `<bos>` | 1 | Beginning of sequence marker |
| `<eos>` | 2 | End of sequence marker |
| `<unk>` | 3 | Unknown/out-of-vocabulary words |

## Building Vocabulary

### From CSV

```python
from tokenizer.vocabulary import Vocabulary, VocabularyConfig

config = VocabularyConfig(
    min_freq=2,        # Minimum word frequency
    max_size=50000,    # Maximum vocabulary size
    add_special_tokens=True
)

vocab = Vocabulary(config)
vocab.build_from_csv('iSign_v1.1.csv', text_column='text')

# Check stats
stats = vocab.get_stats()
print(f"Vocabulary size: {stats['vocab_size']}")
print(f"Total words: {stats['total_words']}")
print(f"Rare words: {stats['rare_words']}")
```

### From Texts

```python
texts = [
    "Hello world",
    "Good morning",
    "How are you"
]

vocab = Vocabulary(config)
vocab.build_from_texts(texts)
```

## Configuration

### vocabulary.yaml

```yaml
vocabulary:
  min_freq: 2
  max_size: 50000
  add_special_tokens: true

special_tokens:
  '<pad>': 0
  '<bos>': 1
  '<eos>': 2
  '<unk>': 3

data:
  csv_path: 'path/to/iSign_v1.1.csv'
  text_column: 'text'
  uid_column: 'uid'

output:
  save_dir: './tokenizer'
  vocab_file: 'vocab.json'
  stats_file: 'vocab_stats.json'
```

## Statistics

After building, vocabulary generates statistics:

```json
{
  "vocab_size": 35247,
  "total_words": 1363429,
  "unique_words": 68029,
  "rare_words": 32810,
  "min_freq": 2,
  "max_size": 50000,
  "special_tokens": ["<pad>", "<bos>", "<eos>", "<unk>"],
  "top_20_words": [
    ["the", 86201],
    ["to", 35855],
    ["and", 32791],
    ...
  ]
}
```

## File Format

### vocab.json

```json
{
  "config": {
    "min_freq": 2,
    "max_size": 50000,
    "special_tokens": {
      "<pad>": 0,
      "<bos>": 1,
      "<eos>": 2,
      "<unk>": 3
    }
  },
  "word2idx": {
    "<pad>": 0,
    "<bos>": 1,
    "<eos>": 2,
    "<unk>": 3,
    "the": 4,
    "to": 5,
    ...
  },
  "word_freq": {
    "the": 86201,
    "to": 35855,
    ...
  }
}
```

## API Reference

### VocabularyConfig

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `min_freq` | `int` | `2` | Minimum word frequency |
| `max_size` | `int` | `50000` | Maximum vocabulary size |
| `special_tokens` | `Dict[str, int]` | `SPECIAL_TOKENS` | Special tokens mapping |
| `add_special_tokens` | `bool` | `True` | Add special tokens |

### Vocabulary

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `build_from_texts(texts)` | `List[str]` | `self` | Build from texts |
| `build_from_csv(path, col)` | `str, str` | `self` | Build from CSV |
| `encode(text, add_special)` | `str, bool` | `List[int]` | Encode text |
| `decode(indices, remove_special)` | `List[int], bool` | `str` | Decode indices |
| `batch_encode(texts)` | `List[str]` | `List[List[int]]` | Batch encode |
| `batch_decode(indices_list)` | `List[List[int]]` | `List[str]` | Batch decode |
| `save(path)` | `str` | `None` | Save to file |
| `load(path)` | `str` | `Vocabulary` | Load from file |
| `get_stats()` | - | `dict` | Get statistics |

## Filtering Options

```yaml
filtering:
  min_word_length: 1
  max_word_length: 50
  alphabetic_only: false
  exclude_words: []
```

## Usage in Pipeline

```
CSV Data
    │
    ▼
┌─────────────────┐
│  Vocabulary      │  Build word-to-index mapping
│  Builder         │  Filter by frequency
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  vocab.json      │  Save vocabulary
│  vocab_stats.json│  Save statistics
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Tokenizer       │  Use vocabulary for encoding
└─────────────────┘
```
