"""
Sequence Builder for SignBridge AI.
Handles padding, truncation, and batch creation for pose sequences.
"""
import logging
from dataclasses import dataclass
from typing import List, Dict, Optional
import numpy as np
from pose import PoseSequence

logger = logging.getLogger(__name__)


@dataclass
class SequenceConfig:
    max_length: int = 64
    padding: str = 'post'
    truncation: str = 'post'
    num_features: int = 5
    dtype: str = 'float32'


class SequenceBuilder:
    def __init__(self, config=None):
        if config is None:
            config = SequenceConfig()
        elif isinstance(config, dict):
            config = SequenceConfig(**config)
        self.config = config

    def build(self, sequence: PoseSequence) -> Dict[str, np.ndarray]:
        data = sequence.to_numpy()
        if data.size == 0:
            return self._empty_output()

        T, L, F = data.shape
        T_target = min(T, self.config.max_length)

        if T > self.config.max_length:
            if self.config.truncation == 'post':
                data = data[:T_target]
            else:
                data = data[T - T_target:]

        seq_len = T_target
        if T_target < self.config.max_length:
            pad_len = self.config.max_length - T_target
            if self.config.padding == 'post':
                pad_width = [(0, pad_len), (0, 0), (0, 0)]
            else:
                pad_width = [(pad_len, 0), (0, 0), (0, 0)]
            data = np.pad(data, pad_width, mode='constant', constant_values=0)

        attention_mask = np.zeros(self.config.max_length, dtype=np.int64)
        attention_mask[:T_target] = 1

        return {
            'pose_tensor': data.astype(self.config.dtype),
            'attention_mask': attention_mask,
            'sequence_length': np.array(seq_len, dtype=np.int64),
        }

    def build_batch(self, sequences: List[PoseSequence]) -> Dict[str, np.ndarray]:
        results = [self.build(s) for s in sequences]
        return {
            'pose_tensor': np.stack([r['pose_tensor'] for r in results]),
            'attention_mask': np.stack([r['attention_mask'] for r in results]),
            'sequence_length': np.stack([r['sequence_length'] for r in results]),
        }

    def _empty_output(self):
        shape = (self.config.max_length, 1, self.config.num_features)
        return {
            'pose_tensor': np.zeros(shape, dtype=self.config.dtype),
            'attention_mask': np.zeros(self.config.max_length, dtype=np.int64),
            'sequence_length': np.array(0, dtype=np.int64),
        }

    def create_causal_mask(self, length: int) -> np.ndarray:
        mask = np.tril(np.ones((length, length), dtype=np.int64))
        return mask
