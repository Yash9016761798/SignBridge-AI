"""
Text Normalizer for SignBridge AI NLP Pipeline.

Provides configurable text normalization for sign language translation.
"""

import re
import unicodedata
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class NormalizerConfig:
    """Configuration for text normalization."""
    lowercase: bool = True
    strip_whitespace: bool = True
    collapse_whitespace: bool = True
    remove_punctuation: bool = False
    keep_sentence_punctuation: bool = True
    remove_numbers: bool = False
    normalize_unicode: bool = True
    remove_accents: bool = False
    min_length: int = 1
    max_length: Optional[int] = None

    # Punctuation handling
    sentence_punctuation = {'.', '!', '?'}
    word_punctuation = {',', ';', ':', '-', '—', '–'}
    special_chars = {'&', '@', '#', '%', '*', '+', '=', '<', '>', '/', '\\'}


class TextNormalizer:
    """
    Normalizes text for sign language translation.
    
    Supports:
    - Lowercasing
    - Whitespace normalization
    - Punctuation handling
    - Unicode normalization
    - Configurable options
    """
    
    def __init__(self, config: Optional[NormalizerConfig] = None):
        """
        Initialize normalizer.
        
        Args:
            config: Normalizer configuration (uses defaults if None)
        """
        self.config = config or NormalizerConfig()
        self._compile_patterns()
    
    def _compile_patterns(self):
        """Compile regex patterns for efficiency."""
        self._whitespace_pattern = re.compile(r'\s+')
        self._leading_trailing_pattern = re.compile(r'^\s+|\s+$')
        self._punctuation_pattern = re.compile(r'[^\w\s]')
        self._number_pattern = re.compile(r'\b\d+\b')
        self._special_pattern = re.compile(r'[&@#%*+=<>/\\]')
    
    def normalize(self, text: str) -> str:
        """
        Normalize input text.
        
        Args:
            text: Raw input text
            
        Returns:
            Normalized text
        """
        if not text:
            return ""
        
        # Apply normalization steps
        text = self._normalize_unicode(text)
        text = self._lowercase(text)
        text = self._handle_punctuation(text)
        text = self._handle_numbers(text)
        text = self._normalize_whitespace(text)
        text = self._remove_special_chars(text)
        text = self._apply_length_constraints(text)
        
        return text
    
    def _normalize_unicode(self, text: str) -> str:
        """Normalize unicode characters."""
        if not self.config.normalize_unicode:
            return text
        
        # Normalize to NFKD form
        text = unicodedata.normalize('NFKD', text)
        
        # Remove accents if configured
        if self.config.remove_accents:
            text = ''.join(
                c for c in text
                if unicodedata.category(c) != 'Mn'
            )
        
        return text
    
    def _lowercase(self, text: str) -> str:
        """Convert to lowercase."""
        if self.config.lowercase:
            return text.lower()
        return text
    
    def _handle_punctuation(self, text: str) -> str:
        """Handle punctuation based on configuration."""
        if self.config.remove_punctuation:
            if self.config.keep_sentence_punctuation:
                # Keep sentence-ending punctuation
                kept = set(self.config.sentence_punctuation)
                return ''.join(
                    c if (c.isalnum() or c.isspace() or c in kept) else ' '
                    for c in text
                )
            else:
                # Remove all punctuation
                return ''.join(
                    c if (c.isalnum() or c.isspace()) else ' '
                    for c in text
                )
        return text
    
    def _handle_numbers(self, text: str) -> str:
        """Handle numbers based on configuration."""
        if self.config.remove_numbers:
            return self._number_pattern.sub('', text)
        return text
    
    def _normalize_whitespace(self, text: str) -> str:
        """Normalize whitespace."""
        if self.config.strip_whitespace:
            text = self._leading_trailing_pattern.sub('', text)
        
        if self.config.collapse_whitespace:
            text = self._whitespace_pattern.sub(' ', text)
        
        return text
    
    def _remove_special_chars(self, text: str) -> str:
        """Remove special characters."""
        return self._special_pattern.sub(' ', text)
    
    def _apply_length_constraints(self, text: str) -> str:
        """Apply min/max length constraints."""
        if len(text) < self.config.min_length:
            return ""
        
        if self.config.max_length and len(text) > self.config.max_length:
            text = text[:self.config.max_length]
        
        return text
    
    def normalize_batch(self, texts: List[str]) -> List[str]:
        """
        Normalize a batch of texts.
        
        Args:
            texts: List of raw texts
            
        Returns:
            List of normalized texts
        """
        return [self.normalize(text) for text in texts]


def create_normalizer(
    lowercase: bool = True,
    remove_punctuation: bool = False,
    keep_sentence_punctuation: bool = True
) -> TextNormalizer:
    """
    Factory function to create a normalizer with common settings.
    
    Args:
        lowercase: Convert to lowercase
        remove_punctuation: Remove punctuation
        keep_sentence_punctuation: Keep sentence-ending punctuation
        
    Returns:
        Configured TextNormalizer
    """
    config = NormalizerConfig(
        lowercase=lowercase,
        remove_punctuation=remove_punctuation,
        keep_sentence_punctuation=keep_sentence_punctuation
    )
    return TextNormalizer(config)
