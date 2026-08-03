# Tokenizer Documentation

## Overview

The SignBridge AI Tokenizer provides text normalization and tokenization for Indian Sign Language
(ISL) translation. It converts raw text into token IDs suitable for sequence models.

## Architecture

```
Raw Text
    │
    ▼
┌─────────────────┐
│  Text Normalizer │  Lowercase, punctuation, whitespace
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Tokenizer     │  Word-level tokenization
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Vocabulary     │  Word-to-index mapping
└────────┬────────┘
         │
         ▼
    Token IDs
```

## Components

### 1. Text Normalizer

**File:** `preprocessing/normalizer.py`

Normalizes raw text with configurable options:

| Option                      | Default | Description                        |
| --------------------------- | ------- | ---------------------------------- |
| `lowercase`                 | `true`  | Convert to lowercase               |
| `strip_whitespace`          | `true`  | Remove leading/trailing whitespace |
| `collapse_whitespace`       | `true`  | Collapse multiple spaces           |
| `remove_punctuation`        | `false` | Remove all punctuation             |
| `keep_sentence_punctuation` | `true`  | Keep `.`, `!`, `?`                 |
| `normalize_unicode`         | `true`  | Normalize unicode characters       |

**Usage:**

```python
from preprocessing.normalizer import TextNormalizer, NormalizerConfig

config = NormalizerConfig(lowercase=True, remove_punctuation=False)
normalizer = TextNormalizer(config)

text = "  Hello, World!  "
normalized = normalizer.normalize(text)
# Output: "hello, world!"
```

### 2. Vocabulary

**File:** `tokenizer/vocabulary.py`

Manages word-to-index mappings with special tokens:

| Token   | Index | Description           |
| ------- | ----- | --------------------- |
| `<pad>` | 0     | Padding token         |
| `<bos>` | 1     | Beginning of sequence |
| `<eos>` | 2     | End of sequence       |
| `<unk>` | 3     | Unknown word          |

**Usage:**

```python
from tokenizer.vocabulary import Vocabulary, VocabularyConfig

config = VocabularyConfig(min_freq=2, max_size=50000)
vocab = Vocabulary(config)

# Build from CSV
vocab.build_from_csv('data.csv', text_column='text')

# Encode/decode
ids = vocab.encode("hello world")  # [1, 45, 67, 2]
text = vocab.decode(ids)  # "hello world"

# Save/load
vocab.save('vocab.json')
vocab = Vocabulary.load('vocab.json')
```

### 3. Tokenizer

**File:** `tokenizer/tokenizer.py`

Combines normalizer and vocabulary for end-to-end tokenization:

**Usage:**

```python
from tokenizer.tokenizer import Tokenizer, TokenizerConfig

# Build from CSV
tokenizer = Tokenizer.build_from_csv(
    'data.csv',
    text_column='text',
    config=TokenizerConfig(max_length=50)
)

# Encode
ids = tokenizer.encode("Hello, world!")
# Output: [1, 234, 567, 2]  (with BOS/EOS)

# Decode
text = tokenizer.decode(ids)
# Output: "hello, world!"

# Batch operations
batch_ids = tokenizer.batch_encode(["text1", "text2"])
batch_texts = tokenizer.batch_decode(batch_ids)

# Save/load
tokenizer.save('tokenizer/')
tokenizer = Tokenizer.load('tokenizer/')
```

## Configuration

### tokenizer.yaml

```yaml
normalization:
  lowercase: true
  remove_punctuation: false
  keep_sentence_punctuation: true

sequence:
  max_length: 50
  padding: 'post'
  truncation: 'post'

special_tokens:
  pad_id: 0
  bos_id: 1
  eos_id: 2
  unk_id: 3
```

## API Reference

### TextNormalizer

| Method                   | Input       | Output      | Description           |
| ------------------------ | ----------- | ----------- | --------------------- |
| `normalize(text)`        | `str`       | `str`       | Normalize single text |
| `normalize_batch(texts)` | `List[str]` | `List[str]` | Normalize batch       |

### Vocabulary

| Method                            | Input             | Output            | Description      |
| --------------------------------- | ----------------- | ----------------- | ---------------- |
| `build_from_texts(texts)`         | `List[str]`       | `self`            | Build from texts |
| `build_from_csv(path, col)`       | `str, str`        | `self`            | Build from CSV   |
| `encode(text, add_special)`       | `str, bool`       | `List[int]`       | Encode text      |
| `decode(indices, remove_special)` | `List[int], bool` | `str`             | Decode indices   |
| `batch_encode(texts)`             | `List[str]`       | `List[List[int]]` | Batch encode     |
| `batch_decode(indices_list)`      | `List[List[int]]` | `List[str]`       | Batch decode     |
| `save(path)`                      | `str`             | `None`            | Save to file     |
| `load(path)`                      | `str`             | `Vocabulary`      | Load from file   |

### Tokenizer

| Method                                         | Input                   | Output            | Description    |
| ---------------------------------------------- | ----------------------- | ----------------- | -------------- |
| `encode(text, add_special, max_length)`        | `str, bool, int`        | `List[int]`       | Encode text    |
| `decode(indices, remove_special, skip_pad)`    | `List[int], bool, bool` | `str`             | Decode indices |
| `batch_encode(texts, add_special, max_length)` | `List[str], bool, int`  | `List[List[int]]` | Batch encode   |
| `batch_decode(indices_list, remove_special)`   | `List[List[int]], bool` | `List[str]`       | Batch decode   |
| `save(directory)`                              | `str`                   | `None`            | Save tokenizer |
| `load(directory)`                              | `str`                   | `Tokenizer`       | Load tokenizer |

## Examples

### Basic Tokenization

```python
from tokenizer.tokenizer import Tokenizer

# Load pre-built tokenizer
tokenizer = Tokenizer.load('tokenizer/')

# Encode
text = "The quick brown fox"
ids = tokenizer.encode(text)
print(ids)  # [1, 15, 2341, 892, 4567, 2]

# Decode
decoded = tokenizer.decode(ids)
print(decoded)  # "the quick brown fox"
```

### Building from Scratch

```python
from tokenizer.tokenizer import Tokenizer, TokenizerConfig

# Configure
config = TokenizerConfig(
    lowercase=True,
    vocab_min_freq=2,
    vocab_max_size=35000,
    max_length=50
)

# Build from CSV
tokenizer = Tokenizer.build_from_csv(
    'iSign_v1.1.csv',
    text_column='text',
    config=config
)

# Save
tokenizer.save('tokenizer/')
```

## File Structure

```
tokenizer/
├── __init__.py
├── vocabulary.py      # Vocabulary class
├── tokenizer.py       # Tokenizer class
├── vocab.json         # Saved vocabulary
├── vocab_stats.json   # Vocabulary statistics
└── tokenizer_config.json  # Tokenizer config
```
