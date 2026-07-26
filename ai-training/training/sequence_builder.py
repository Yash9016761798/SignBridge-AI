"""
Sequence Builder for SignBridge AI NLP Pipeline.

Handles padding, masking, and batch tensor creation.
"""

import logging
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class SequenceConfig:
    """Configuration for sequence building."""
    max_length: int = 50
    pad_token_id: int = 0
    bos_token_id: int = 1
    eos_token_id: int = 2
    unk_token_id: int = 3
    padding: str = 'post'  # 'pre' or 'post'
    truncation: str = 'post'  # 'pre' or 'post'
    dtype: str = 'int64'  # 'int32' or 'int64'


class SequenceBuilder:
    """
    Builds padded and masked sequences for model input.
    
    Supports:
    - Single sequence padding
    - Batch padding
    - Attention mask creation
    - Causal mask creation
    """
    
    def __init__(self, config: Optional[SequenceConfig] = None):
        """
        Initialize sequence builder.
        
        Args:
            config: Sequence configuration
        """
        self.config = config or SequenceConfig()
    
    def pad_sequence(
        self,
        sequence: List[int],
        max_length: Optional[int] = None,
        padding: Optional[str] = None,
        truncation: Optional[str] = None
    ) -> List[int]:
        """
        Pad or truncate a single sequence.
        
        Args:
            sequence: Input sequence
            max_length: Override max length
            padding: Override padding direction
            truncation: Override truncation direction
            
        Returns:
            Padded/truncated sequence
        """
        max_len = max_length or self.config.max_length
        pad_dir = padding or self.config.padding
        trunc_dir = truncation or self.config.truncation
        
        # Truncate if needed
        if len(sequence) > max_len:
            if trunc_dir == 'post':
                sequence = sequence[:max_len - 1] + [self.config.eos_token_id]
            else:
                sequence = [self.config.bos_token_id] + sequence[-(max_len - 1):]
        
        # Pad if needed
        if len(sequence) < max_len:
            pad_length = max_len - len(sequence)
            if pad_dir == 'post':
                sequence = sequence + [self.config.pad_token_id] * pad_length
            else:
                sequence = [self.config.pad_token_id] * pad_length + sequence
        
        return sequence
    
    def create_attention_mask(
        self,
        sequence: List[int],
        max_length: Optional[int] = None
    ) -> List[int]:
        """
        Create attention mask for a sequence.
        
        Args:
            sequence: Input sequence (already padded)
            max_length: Override max length
            
        Returns:
            Attention mask (1 for real tokens, 0 for padding)
        """
        max_len = max_length or self.config.max_length
        
        # Count non-padding tokens
        real_length = 0
        for token in sequence[:max_len]:
            if token != self.config.pad_token_id:
                real_length += 1
            else:
                break
        
        # Create mask
        mask = [1] * real_length + [0] * (max_len - real_length)
        return mask[:max_len]
    
    def create_causal_mask(self, length: int) -> List[List[int]]:
        """
        Create causal (autoregressive) mask.
        
        Args:
            length: Sequence length
            
        Returns:
            Causal mask matrix
        """
        mask = []
        for i in range(length):
            row = [1] * (i + 1) + [0] * (length - i - 1)
            mask.append(row)
        return mask
    
    def pad_batch(
        self,
        sequences: List[List[int]],
        max_length: Optional[int] = None,
        padding: Optional[str] = None
    ) -> np.ndarray:
        """
        Pad a batch of sequences.
        
        Args:
            sequences: List of input sequences
            max_length: Override max length
            padding: Override padding direction
            
        Returns:
            Padded batch as numpy array
        """
        max_len = max_length or self.config.max_length
        pad_dir = padding or self.config.padding
        
        # Pad each sequence
        padded = []
        for seq in sequences:
            padded_seq = self.pad_sequence(seq, max_len, pad_dir)
            padded.append(padded_seq)
        
        return np.array(padded, dtype=self.config.dtype)
    
    def create_batch_attention_mask(
        self,
        sequences: List[List[int]],
        max_length: Optional[int] = None
    ) -> np.ndarray:
        """
        Create attention masks for a batch.
        
        Args:
            sequences: List of input sequences (already padded)
            max_length: Override max length
            
        Returns:
            Batch attention mask as numpy array
        """
        max_len = max_length or self.config.max_length
        
        masks = []
        for seq in sequences:
            mask = self.create_attention_mask(seq, max_len)
            masks.append(mask)
        
        return np.array(masks, dtype=self.config.dtype)
    
    def build_batch(
        self,
        token_ids_list: List[List[int]],
        max_length: Optional[int] = None
    ) -> Dict[str, np.ndarray]:
        """
        Build complete batch with padding and masks.
        
        Args:
            token_ids_list: List of token ID sequences
            max_length: Override max length
            
        Returns:
            Dictionary with 'input_ids', 'attention_mask', 'lengths'
        """
        max_len = max_length or self.config.max_length
        
        # Pad sequences
        input_ids = self.pad_batch(token_ids_list, max_len)
        
        # Create attention masks
        attention_mask = self.create_batch_attention_mask(token_ids_list, max_len)
        
        # Calculate lengths
        lengths = np.array([
            min(len(seq), max_len) for seq in token_ids_list
        ], dtype=self.config.dtype)
        
        return {
            'input_ids': input_ids,
            'attention_mask': attention_mask,
            'lengths': lengths,
        }
    
    def build_encoder_decoder_batch(
        self,
        source_ids: List[List[int]],
        target_ids: List[List[int]],
        max_source_length: Optional[int] = None,
        max_target_length: Optional[int] = None
    ) -> Dict[str, np.ndarray]:
        """
        Build encoder-decoder batch for seq2seq models.
        
        Args:
            source_ids: List of source token ID sequences
            target_ids: List of target token ID sequences
            max_source_length: Override source max length
            max_target_length: Override target max length
            
        Returns:
            Dictionary with encoder and decoder inputs
        """
        src_max = max_source_length or self.config.max_length
        tgt_max = max_target_length or self.config.max_length
        
        # Source (encoder input)
        encoder_input = self.build_batch(source_ids, src_max)
        
        # Target input (decoder input - shifted right with BOS)
        decoder_input_ids = []
        for seq in target_ids:
            # Add BOS, remove EOS
            if seq and seq[0] == self.config.bos_token_id:
                decoder_input_ids.append(seq[:-1] if len(seq) > 1 else seq)
            else:
                decoder_input_ids.append([self.config.bos_token_id] + seq[:-1])
        
        decoder_input = self.build_batch(decoder_input_ids, tgt_max)
        
        # Target output (labels - shifted left with EOS)
        decoder_output_ids = []
        for seq in target_ids:
            # Remove BOS, keep EOS
            if seq and seq[0] == self.config.bos_token_id:
                decoder_output_ids.append(seq[1:])
            else:
                decoder_output_ids.append(seq)
        
        decoder_output = self.build_batch(decoder_output_ids, tgt_max)
        
        return {
            'encoder_input_ids': encoder_input['input_ids'],
            'encoder_attention_mask': encoder_input['attention_mask'],
            'encoder_lengths': encoder_input['lengths'],
            'decoder_input_ids': decoder_input['input_ids'],
            'decoder_attention_mask': decoder_input['attention_mask'],
            'decoder_lengths': decoder_input['lengths'],
            'labels': decoder_output['input_ids'],
            'labels_attention_mask': decoder_output['attention_mask'],
        }
    
    def to_numpy(self, data: Dict[str, List]) -> Dict[str, np.ndarray]:
        """
        Convert dictionary of lists to numpy arrays.
        
        Args:
            data: Dictionary with list values
            
        Returns:
            Dictionary with numpy array values
        """
        result = {}
        for key, value in data.items():
            if isinstance(value, list):
                result[key] = np.array(value, dtype=self.config.dtype)
            else:
                result[key] = value
        return result
