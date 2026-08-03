"""
Dataset Loader for SignBridge AI NLP Pipeline.

Loads and processes iSign CSV data for sign language translation.
"""

import json
import logging
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import pandas as pd

from tokenizer.tokenizer import Tokenizer, TokenizerConfig

logger = logging.getLogger(__name__)


@dataclass
class DatasetConfig:
    """Configuration for dataset loading."""
    csv_path: str
    text_column: str = 'text'
    uid_column: str = 'uid'
    max_length: int = 50
    train_split: float = 0.8
    val_split: float = 0.1
    test_split: float = 0.1
    random_seed: int = 42


@dataclass
class Sample:
    """Single dataset sample."""
    uid: str
    text: str
    token_ids: List[int]
    length: int
    attention_mask: List[int]


class DatasetLoader:
    """
    Loads and processes iSign dataset for sign language translation.
    
    Supports:
    - Loading from CSV
    - Train/val/test splits
    - Tokenization
    - Sequence padding
    """
    
    def __init__(
        self,
        tokenizer: Tokenizer,
        config: Optional[DatasetConfig] = None
    ):
        """
        Initialize dataset loader.
        
        Args:
            tokenizer: Tokenizer instance
            config: Dataset configuration
        """
        self.tokenizer = tokenizer
        self.config = config or DatasetConfig(csv_path='')
        self.data: Optional[pd.DataFrame] = None
        self.samples: List[Sample] = []
    
    def load(self, csv_path: Optional[str] = None) -> 'DatasetLoader':
        """
        Load data from CSV file.
        
        Args:
            csv_path: Path to CSV file (overrides config)
            
        Returns:
            Self for chaining
        """
        path = csv_path or self.config.csv_path
        logger.info(f"Loading dataset from {path}...")
        
        self.data = pd.read_csv(path)
        logger.info(f"Loaded {len(self.data)} rows")
        
        # Validate columns
        if self.config.uid_column not in self.data.columns:
            raise ValueError(f"UID column '{self.config.uid_column}' not found")
        if self.config.text_column not in self.data.columns:
            raise ValueError(f"Text column '{self.config.text_column}' not found")
        
        # Process samples
        self._process_samples()
        
        return self
    
    def _process_samples(self) -> None:
        """Process raw data into samples."""
        self.samples = []
        
        for _, row in self.data.iterrows():
            uid = str(row[self.config.uid_column])
            text = str(row[self.config.text_column])
            
            # Skip empty text
            if not text or text == 'nan':
                continue
            
            # Tokenize
            token_ids = self.tokenizer.encode(text, add_special=True)
            length = len(token_ids)
            
            # Create attention mask (1 for real tokens, 0 for padding)
            attention_mask = [1] * length
            
            sample = Sample(
                uid=uid,
                text=text,
                token_ids=token_ids,
                length=length,
                attention_mask=attention_mask
            )
            
            self.samples.append(sample)
        
        logger.info(f"Processed {len(self.samples)} samples")
    
    def split(
        self,
        train_ratio: Optional[float] = None,
        val_ratio: Optional[float] = None,
        test_ratio: Optional[float] = None
    ) -> Tuple[List[Sample], List[Sample], List[Sample]]:
        """
        Split data into train/val/test sets.
        
        Args:
            train_ratio: Training set ratio
            val_ratio: Validation set ratio
            test_ratio: Test set ratio
            
        Returns:
            Tuple of (train, val, test) samples
        """
        train_r = train_ratio or self.config.train_split
        val_r = val_ratio or self.config.val_split
        test_r = test_ratio or self.config.test_split
        
        # Validate ratios
        total = train_r + val_r + test_r
        if abs(total - 1.0) > 1e-6:
            raise ValueError(f"Split ratios must sum to 1.0, got {total}")
        
        # Shuffle samples
        random.seed(self.config.random_seed)
        shuffled = self.samples.copy()
        random.shuffle(shuffled)
        
        # Calculate split indices
        n = len(shuffled)
        train_end = int(n * train_r)
        val_end = train_end + int(n * val_r)
        
        train_samples = shuffled[:train_end]
        val_samples = shuffled[train_end:val_end]
        test_samples = shuffled[val_end:]
        
        logger.info(f"Split: train={len(train_samples)}, val={len(val_samples)}, test={len(test_samples)}")
        
        return train_samples, val_samples, test_samples
    
    def get_batch(
        self,
        samples: List[Sample],
        batch_size: int = 32
    ) -> List[Dict[str, List]]:
        """
        Get batched data from samples.
        
        Args:
            samples: List of Sample objects
            batch_size: Batch size
            
        Returns:
            List of batch dictionaries
        """
        batches = []
        
        for i in range(0, len(samples), batch_size):
            batch_samples = samples[i:i + batch_size]
            
            # Pad sequences
            max_len = max(s.length for s in batch_samples)
            
            token_ids = []
            attention_mask = []
            lengths = []
            uids = []
            texts = []
            
            for s in batch_samples:
                # Pad token_ids
                padded_ids = s.token_ids + [0] * (max_len - s.length)
                token_ids.append(padded_ids)
                
                # Pad attention_mask
                padded_mask = s.attention_mask + [0] * (max_len - s.length)
                attention_mask.append(padded_mask)
                
                lengths.append(s.length)
                uids.append(s.uid)
                texts.append(s.text)
            
            batch = {
                'token_ids': token_ids,
                'attention_mask': attention_mask,
                'lengths': lengths,
                'uids': uids,
                'texts': texts,
            }
            
            batches.append(batch)
        
        return batches
    
    def save_split(
        self,
        samples: List[Sample],
        output_path: str
    ) -> None:
        """
        Save split to JSON file.
        
        Args:
            samples: List of Sample objects
            output_path: Output file path
        """
        data = []
        for s in samples:
            data.append({
                'uid': s.uid,
                'text': s.text,
                'token_ids': s.token_ids,
                'length': s.length,
                'attention_mask': s.attention_mask,
            })
        
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved {len(samples)} samples to {output_path}")
    
    def load_split(self, input_path: str) -> List[Sample]:
        """
        Load split from JSON file.
        
        Args:
            input_path: Input file path
            
        Returns:
            List of Sample objects
        """
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        samples = []
        for item in data:
            sample = Sample(
                uid=item['uid'],
                text=item['text'],
                token_ids=item['token_ids'],
                length=item['length'],
                attention_mask=item['attention_mask'],
            )
            samples.append(sample)
        
        logger.info(f"Loaded {len(samples)} samples from {input_path}")
        return samples
    
    def __len__(self) -> int:
        """Get dataset size."""
        return len(self.samples)
    
    def __getitem__(self, idx: int) -> Sample:
        """Get sample by index."""
        return self.samples[idx]
