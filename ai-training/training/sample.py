"""
Training Sample for SignBridge AI.
Represents one complete training sample with pose and text data.
"""
from dataclasses import dataclass, field
from typing import Dict, Any, Optional, List
import numpy as np


@dataclass
class TrainingSample:
    """One complete training sample."""
    uid: str
    pose_tensor: np.ndarray      # [T, L, 5] pose data
    input_ids: np.ndarray        # [N] decoder input (BOS + tokens)
    target_ids: np.ndarray       # [N] decoder output (tokens + EOS)
    attention_mask: np.ndarray   # [N] text attention mask
    pose_mask: np.ndarray        # [T] pose attention mask
    sequence_length: int         # original sequence length
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def pose_shape(self) -> tuple:
        return self.pose_tensor.shape

    @property
    def text_length(self) -> int:
        return len(self.input_ids)

    @property
    def pose_length(self) -> int:
        return self.sequence_length

    def to_dict(self) -> Dict[str, np.ndarray]:
        return {
            'uid': self.uid,
            'pose_tensor': self.pose_tensor,
            'input_ids': self.input_ids,
            'target_ids': self.target_ids,
            'attention_mask': self.attention_mask,
            'pose_mask': self.pose_mask,
            'sequence_length': np.array(self.sequence_length, dtype=np.int64),
        }

    def __repr__(self) -> str:
        return (
            f"TrainingSample(uid='{self.uid}', "
            f"pose={self.pose_shape}, "
            f"text_len={self.text_length}, "
            f"seq_len={self.sequence_length})"
        )
