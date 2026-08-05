"""
Vocabulary Builder for SignBridge AI NLP Pipeline.

Builds vocabulary from text corpus with configurable frequency thresholds.
"""

import json
import logging
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


# Special tokens
SPECIAL_TOKENS = {
    '<pad>': 0,
    '<bos>': 1,
    '<eos>': 2,
    '<unk>': 3,
}

PAD_TOKEN = '<pad>'
BOS_TOKEN = '<bos>'
EOS_TOKEN = '<eos>'
UNK_TOKEN = '<unk>'


@dataclass
class VocabularyConfig:
    """Configuration for vocabulary building."""
    min_freq: int = 2
    max_size: int = 50000
    special_tokens: Dict[str, int] = field(default_factory=lambda: SPECIAL_TOKENS.copy())
    add_special_tokens: bool = True


class Vocabulary:
    """
    Manages word-to-index and index-to-word mappings.
    
    Supports:
    - Building from corpus
    - Loading/saving to file
    - Encoding/decoding text
    - Special tokens
    """
    
    def __init__(self, config: Optional[VocabularyConfig] = None):
        """
        Initialize vocabulary.
        
        Args:
            config: Vocabulary configuration
        """
        self.config = config or VocabularyConfig()
        self.word2idx: Dict[str, int] = {}
        self.idx2word: Dict[int, str] = {}
        self.word_freq: Counter = Counter()
        self._build_special_tokens()
    
    def _build_special_tokens(self):
        """Add special tokens to vocabulary."""
        if self.config.add_special_tokens:
            for token, idx in self.config.special_tokens.items():
                self.word2idx[token] = idx
                self.idx2word[idx] = token
    
    def build_from_texts(self, texts: List[str]) -> 'Vocabulary':
        """
        Build vocabulary from list of texts.
        
        Args:
            texts: List of text strings
            
        Returns:
            Self for chaining
        """
        logger.info(f"Building vocabulary from {len(texts)} texts...")
        
        # Count word frequencies
        for text in texts:
            words = text.split()
            self.word_freq.update(words)
        
        # Sort by frequency (descending)
        sorted_words = sorted(self.word_freq.items(), key=lambda x: (-x[1], x[0]))
        
        # Add words up to max_size
        start_idx = len(self.config.special_tokens)
        for word, freq in sorted_words:
            if freq < self.config.min_freq:
                continue
            if len(self.word2idx) >= self.config.max_size:
                break
            if word not in self.word2idx:
                idx = start_idx + len(self.word2idx) - len(self.config.special_tokens)
                self.word2idx[word] = idx
                self.idx2word[idx] = word
        
        logger.info(f"Vocabulary size: {len(self)}")
        return self
    
    def build_from_csv(self, csv_path: str, text_column: str = 'text') -> 'Vocabulary':
        """
        Build vocabulary from CSV file.
        
        Args:
            csv_path: Path to CSV file
            text_column: Name of text column
            
        Returns:
            Self for chaining
        """
        import pandas as pd
        
        logger.info(f"Loading CSV from {csv_path}...")
        df = pd.read_csv(csv_path)
        
        if text_column not in df.columns:
            raise ValueError(f"Column '{text_column}' not found in CSV. Available: {list(df.columns)}")
        
        texts = df[text_column].dropna().astype(str).tolist()
        return self.build_from_texts(texts)
    
    def encode(self, text: str, add_special: bool = True) -> List[int]:
        """
        Encode text to token indices.
        
        Args:
            text: Input text
            add_special: Add BOS/EOS tokens
            
        Returns:
            List of token indices
        """
        words = text.split()
        indices = []
        
        if add_special:
            indices.append(self.config.special_tokens[BOS_TOKEN])
        
        for word in words:
            idx = self.word2idx.get(word, self.config.special_tokens[UNK_TOKEN])
            indices.append(idx)
        
        if add_special:
            indices.append(self.config.special_tokens[EOS_TOKEN])
        
        return indices
    
    def decode(self, indices: List[int], remove_special: bool = True) -> str:
        """
        Decode token indices to text.
        
        Args:
            indices: List of token indices
            remove_special: Remove special tokens
            
        Returns:
            Decoded text string
        """
        words = []
        for idx in indices:
            word = self.idx2word.get(idx, UNK_TOKEN)
            if remove_special and word in self.config.special_tokens:
                continue
            words.append(word)
        return ' '.join(words)
    
    def batch_encode(self, texts: List[str], add_special: bool = True) -> List[List[int]]:
        """
        Encode a batch of texts.
        
        Args:
            texts: List of text strings
            add_special: Add BOS/EOS tokens
            
        Returns:
            List of encoded sequences
        """
        return [self.encode(text, add_special) for text in texts]
    
    def batch_decode(self, indices_list: List[List[int]], remove_special: bool = True) -> List[str]:
        """
        Decode a batch of sequences.
        
        Args:
            indices_list: List of encoded sequences
            remove_special: Remove special tokens
            
        Returns:
            List of decoded texts
        """
        return [self.decode(indices, remove_special) for indices in indices_list]
    
    def __len__(self) -> int:
        """Get vocabulary size."""
        return len(self.word2idx)
    
    def __contains__(self, word: str) -> bool:
        """Check if word is in vocabulary."""
        return word in self.word2idx
    
    def __getitem__(self, word: str) -> int:
        """Get index for word."""
        return self.word2idx.get(word, self.config.special_tokens[UNK_TOKEN])
    
    def get(self, word: str, default: int = None) -> Optional[int]:
        """Get index for word with default."""
        if default is None:
            default = self.config.special_tokens[UNK_TOKEN]
        return self.word2idx.get(word, default)
    
    def save(self, path: str) -> None:
        """
        Save vocabulary to file.
        
        Args:
            path: Output file path
        """
        data = {
            'config': {
                'min_freq': self.config.min_freq,
                'max_size': self.config.max_size,
                'special_tokens': self.config.special_tokens,
            },
            'word2idx': self.word2idx,
            'word_freq': dict(self.word_freq.most_common(10000)),  # Save top 10K frequencies
        }
        
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Vocabulary saved to {path}")
    
    @classmethod
    def load(cls, path: str) -> 'Vocabulary':
        """
        Load vocabulary from file.
        
        Args:
            path: Input file path
            
        Returns:
            Loaded Vocabulary instance
        """
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        config = VocabularyConfig(
            min_freq=data['config']['min_freq'],
            max_size=data['config']['max_size'],
            special_tokens=data['config']['special_tokens'],
        )
        
        vocab = cls(config)
        vocab.word2idx = data['word2idx']
        vocab.idx2word = {int(idx): word for word, idx in vocab.word2idx.items()}
        vocab.word_freq = Counter(data.get('word_freq', {}))
        
        logger.info(f"Vocabulary loaded from {path} (size: {len(vocab)})")
        return vocab

    def to_dict(self) -> dict:
        return {
            'config': {
                'min_freq': self.config.min_freq,
                'max_size': self.config.max_size,
                'special_tokens': self.config.special_tokens,
            },
            'word2idx': dict(self.word2idx),
            'idx2word': {str(k): v for k, v in self.idx2word.items()},
            'word_freq': dict(self.word_freq.most_common(10000)),
            'vocab_size': len(self),
        }

    @classmethod
    def from_dict(cls, d: dict) -> 'Vocabulary':
        config = VocabularyConfig(
            min_freq=d.get('config', {}).get('min_freq', 2),
            max_size=d.get('config', {}).get('max_size', 50000),
            special_tokens=d.get('config', {}).get('special_tokens', SPECIAL_TOKENS.copy()),
        )
        vocab = cls(config)
        vocab.word2idx = d.get('word2idx', {})
        vocab.idx2word = {int(k): v for k, v in d.get('idx2word', {}).items()}
        vocab.word_freq = Counter(d.get('word_freq', {}))
        return vocab

    def get_stats(self) -> dict:
        """
        Get vocabulary statistics.
        
        Returns:
            Dictionary with statistics
        """
        total_words = sum(self.word_freq.values())
        rare_words = sum(1 for w, f in self.word_freq.items() if f < self.config.min_freq)
        
        return {
            'vocab_size': len(self),
            'total_words': total_words,
            'unique_words': len(self.word_freq),
            'rare_words': rare_words,
            'min_freq': self.config.min_freq,
            'max_size': self.config.max_size,
            'special_tokens': list(self.config.special_tokens.keys()),
            'top_20_words': self.word_freq.most_common(20),
        }


def build_vocabulary(
    csv_path: str,
    output_path: str,
    text_column: str = 'text',
    min_freq: int = 2,
    max_size: int = 50000
) -> Vocabulary:
    """
    Build vocabulary from CSV and save to file.
    
    Args:
        csv_path: Path to CSV file
        output_path: Output vocabulary file path
        text_column: Name of text column
        min_freq: Minimum word frequency
        max_size: Maximum vocabulary size
        
    Returns:
        Built Vocabulary instance
    """
    config = VocabularyConfig(min_freq=min_freq, max_size=max_size)
    vocab = Vocabulary(config)
    vocab.build_from_csv(csv_path, text_column)
    vocab.save(output_path)
    
    # Save stats
    stats = vocab.get_stats()
    stats_path = str(Path(output_path).parent / 'vocab_stats.json')
    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Vocabulary stats saved to {stats_path}")
    return vocab
