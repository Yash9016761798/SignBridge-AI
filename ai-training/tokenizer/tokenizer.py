"""
Tokenizer for SignBridge AI NLP Pipeline.

Combines text normalization and vocabulary encoding for sign language translation.
"""

import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from preprocessing.normalizer import TextNormalizer, NormalizerConfig
from tokenizer.vocabulary import (
    Vocabulary, VocabularyConfig, 
    PAD_TOKEN, BOS_TOKEN, EOS_TOKEN, UNK_TOKEN
)

logger = logging.getLogger(__name__)


@dataclass
class TokenizerConfig:
    """Configuration for tokenizer."""
    # Normalization
    lowercase: bool = True
    remove_punctuation: bool = False
    keep_sentence_punctuation: bool = True
    
    # Vocabulary
    vocab_min_freq: int = 2
    vocab_max_size: int = 50000
    
    # Sequence
    max_length: int = 50
    padding: str = 'post'  # 'pre' or 'post'
    truncation: str = 'post'  # 'pre' or 'post'
    
    # Special tokens
    add_bos: bool = True
    add_eos: bool = True
    
    @property
    def pad_token(self) -> int:
        return 0
    
    @property
    def bos_token(self) -> int:
        return 1
    
    @property
    def eos_token(self) -> int:
        return 2
    
    @property
    def unk_token(self) -> int:
        return 3


class Tokenizer:
    """
    Tokenizer for sign language translation.
    
    Combines text normalization and vocabulary encoding.
    Supports encode/decode and batch operations.
    """
    
    def __init__(
        self,
        vocabulary: Vocabulary,
        config: Optional[TokenizerConfig] = None
    ):
        """
        Initialize tokenizer.
        
        Args:
            vocabulary: Vocabulary instance
            config: Tokenizer configuration
        """
        self.vocab = vocabulary
        self.config = config or TokenizerConfig()
        self.normalizer = TextNormalizer(NormalizerConfig(
            lowercase=self.config.lowercase,
            remove_punctuation=self.config.remove_punctuation,
            keep_sentence_punctuation=self.config.keep_sentence_punctuation
        ))
    
    @classmethod
    def from_config(cls, config: TokenizerConfig) -> 'Tokenizer':
        """Create tokenizer from config (empty vocabulary)."""
        vocab_config = VocabularyConfig(
            min_freq=config.vocab_min_freq,
            max_size=config.vocab_max_size
        )
        vocab = Vocabulary(vocab_config)
        return cls(vocab, config)
    
    @classmethod
    def build_from_csv(
        cls,
        csv_path: str,
        text_column: str = 'text',
        config: Optional[TokenizerConfig] = None
    ) -> 'Tokenizer':
        """
        Build tokenizer from CSV file.
        
        Args:
            csv_path: Path to CSV file
            text_column: Name of text column
            config: Tokenizer configuration
            
        Returns:
            Built Tokenizer instance
        """
        config = config or TokenizerConfig()
        
        # Build vocabulary
        vocab_config = VocabularyConfig(
            min_freq=config.vocab_min_freq,
            max_size=config.vocab_max_size
        )
        vocab = Vocabulary(vocab_config)
        vocab.build_from_csv(csv_path, text_column)
        
        return cls(vocab, config)
    
    def encode(
        self,
        text: str,
        add_special: bool = True,
        max_length: Optional[int] = None
    ) -> List[int]:
        """
        Encode text to token indices.
        
        Args:
            text: Input text
            add_special: Add BOS/EOS tokens
            max_length: Override max length
            
        Returns:
            List of token indices
        """
        # Normalize
        normalized = self.normalizer.normalize(text)
        
        # Split into words
        words = normalized.split()
        
        # Build token list
        tokens = []
        
        if add_special and self.config.add_bos:
            tokens.append(self.config.bos_token)
        
        for word in words:
            idx = self.vocab.get(word, self.config.unk_token)
            tokens.append(idx)
        
        if add_special and self.config.add_eos:
            tokens.append(self.config.eos_token)
        
        # Truncate if needed
        max_len = max_length or self.config.max_length
        if len(tokens) > max_len:
            if self.config.truncation == 'post':
                tokens = tokens[:max_len - 1] + [self.config.eos_token]
            else:
                tokens = [self.config.bos_token] + tokens[-(max_len - 1):]
        
        return tokens
    
    def decode(
        self,
        indices: List[int],
        remove_special: bool = True,
        skip_pad: bool = True
    ) -> str:
        """
        Decode token indices to text.
        
        Args:
            indices: List of token indices
            remove_special: Remove BOS/EOS/UNK tokens
            skip_pad: Skip padding tokens
            
        Returns:
            Decoded text string
        """
        words = []
        for idx in indices:
            word = self.vocab.idx2word.get(idx, UNK_TOKEN)
            
            # Skip special tokens
            if remove_special and word in [PAD_TOKEN, BOS_TOKEN, EOS_TOKEN, UNK_TOKEN]:
                continue
            
            # Skip padding
            if skip_pad and word == PAD_TOKEN:
                continue
            
            words.append(word)
        
        return ' '.join(words)
    
    def batch_encode(
        self,
        texts: List[str],
        add_special: bool = True,
        max_length: Optional[int] = None
    ) -> List[List[int]]:
        """
        Encode a batch of texts.
        
        Args:
            texts: List of text strings
            add_special: Add BOS/EOS tokens
            max_length: Override max length
            
        Returns:
            List of encoded sequences
        """
        return [self.encode(text, add_special, max_length) for text in texts]
    
    def batch_decode(
        self,
        indices_list: List[List[int]],
        remove_special: bool = True,
        skip_pad: bool = True
    ) -> List[str]:
        """
        Decode a batch of sequences.
        
        Args:
            indices_list: List of encoded sequences
            remove_special: Remove special tokens
            skip_pad: Skip padding tokens
            
        Returns:
            List of decoded texts
        """
        return [self.decode(indices, remove_special, skip_pad) for indices in indices_list]
    
    def save(self, directory: str) -> None:
        """
        Save tokenizer to directory.
        
        Args:
            directory: Output directory path
        """
        dir_path = Path(directory)
        dir_path.mkdir(parents=True, exist_ok=True)
        
        # Save vocabulary
        self.vocab.save(str(dir_path / 'vocab.json'))
        
        # Save config
        config_data = {
            'lowercase': self.config.lowercase,
            'remove_punctuation': self.config.remove_punctuation,
            'keep_sentence_punctuation': self.config.keep_sentence_punctuation,
            'vocab_min_freq': self.config.vocab_min_freq,
            'vocab_max_size': self.config.vocab_max_size,
            'max_length': self.config.max_length,
            'padding': self.config.padding,
            'truncation': self.config.truncation,
            'add_bos': self.config.add_bos,
            'add_eos': self.config.add_eos,
        }
        
        with open(dir_path / 'tokenizer_config.json', 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2)
        
        logger.info(f"Tokenizer saved to {directory}")
    
    @classmethod
    def load(cls, directory: str) -> 'Tokenizer':
        """
        Load tokenizer from directory.
        
        Args:
            directory: Input directory path
            
        Returns:
            Loaded Tokenizer instance
        """
        dir_path = Path(directory)
        
        # Load config
        with open(dir_path / 'tokenizer_config.json', 'r', encoding='utf-8') as f:
            config_data = json.load(f)
        
        config = TokenizerConfig(**config_data)
        
        # Load vocabulary
        vocab = Vocabulary.load(str(dir_path / 'vocab.json'))
        
        logger.info(f"Tokenizer loaded from {directory}")
        return cls(vocab, config)
    
    def __len__(self) -> int:
        """Get vocabulary size."""
        return len(self.vocab)
    
    def get_vocab_size(self) -> int:
        """Get vocabulary size."""
        return len(self.vocab)
    
    def get_special_tokens(self) -> Dict[str, int]:
        """Get special tokens mapping."""
        return {
            PAD_TOKEN: self.config.pad_token,
            BOS_TOKEN: self.config.bos_token,
            EOS_TOKEN: self.config.eos_token,
            UNK_TOKEN: self.config.unk_token,
        }
