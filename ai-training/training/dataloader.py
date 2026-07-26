"""
DataLoader for SignBridge AI.
Pure Python DataLoader with shuffle, batching, and prefetch support.
"""
import logging
import random
from typing import List, Dict, Any, Optional, Iterator
import numpy as np
from training.sample import TrainingSample
from training.collate import CollateFn

logger = logging.getLogger(__name__)


class DataLoader:
    """
    Pure Python DataLoader for SignBridge datasets.
    """

    def __init__(
        self,
        dataset,
        batch_size: int = 16,
        shuffle: bool = True,
        num_workers: int = 0,
        collate_fn: Optional[CollateFn] = None,
        seed: int = 42,
        prefetch: int = 0,
    ):
        self.dataset = dataset
        self.batch_size = batch_size
        self.shuffle = shuffle
        self.num_workers = num_workers
        self.collate_fn = collate_fn or CollateFn()
        self.seed = seed
        self.prefetch = prefetch
        self._indices = list(range(len(dataset)))
        if shuffle:
            rng = random.Random(seed)
            rng.shuffle(self._indices)

    def __len__(self) -> int:
        return (len(self.dataset) + self.batch_size - 1) // self.batch_size

    def __iter__(self) -> Iterator[Dict[str, Any]]:
        indices = self._indices.copy()
        if self.shuffle:
            rng = random.Random(self.seed)
            rng.shuffle(indices)

        batches = []
        for i in range(0, len(indices), self.batch_size):
            batch_indices = indices[i:i + self.batch_size]
            samples = [self.dataset[idx] for idx in batch_indices]
            batch = self.collate_fn(samples)
            batches.append(batch)

        for batch in batches:
            yield batch

    def get_batch(self, batch_idx: int) -> Dict[str, Any]:
        start = batch_idx * self.batch_size
        end = min(start + self.batch_size, len(self.dataset))
        if start >= len(self.dataset):
            raise IndexError(f'Batch index {batch_idx} out of range')
        indices = self._indices[start:end]
        samples = [self.dataset[idx] for idx in indices]
        return self.collate_fn(samples)

    def get_statistics(self) -> Dict[str, Any]:
        return {
            'num_samples': len(self.dataset),
            'batch_size': self.batch_size,
            'num_batches': len(self),
            'shuffle': self.shuffle,
            'seed': self.seed,
        }
