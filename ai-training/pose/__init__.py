"""
Pose Processing Pipeline for SignBridge AI.

Provides complete pose data preprocessing for sign language translation.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


@dataclass
class Landmark:
    """Single pose landmark."""
    x: float
    y: float
    z: float
    visibility: float = 0.0
    confidence: float = 0.0


@dataclass
class PoseFrame:
    """Single frame of pose data."""
    frame_index: int
    timestamp: float
    landmarks: List[Landmark]
    
    @property
    def num_landmarks(self) -> int:
        return len(self.landmarks)
    
    @property
    def is_valid(self) -> bool:
        return len(self.landmarks) > 0


@dataclass
class PoseSequence:
    """Sequence of pose frames."""
    frames: List[PoseFrame]
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def num_frames(self) -> int:
        return len(self.frames)
    
    @property
    def num_landmarks(self) -> int:
        if self.frames:
            return self.frames[0].num_landmarks
        return 0
    
    @property
    def duration(self) -> float:
        if len(self.frames) < 2:
            return 0.0
        return self.frames[-1].timestamp - self.frames[0].timestamp
    
    def to_numpy(self) -> 'np.ndarray':
        """Convert to numpy array [T, L, 5] (x, y, z, visibility, confidence)."""
        import numpy as np
        if not self.frames:
            return np.array([])
        
        T = len(self.frames)
        L = self.frames[0].num_landmarks
        data = np.zeros((T, L, 5), dtype=np.float32)
        
        for t, frame in enumerate(self.frames):
            for l, lm in enumerate(frame.landmarks):
                data[t, l] = [lm.x, lm.y, lm.z, lm.visibility, lm.confidence]
        
        return data


from pose.reader import PoseReader
from pose.validator import PoseValidator
from pose.normalizer import PoseNormalizer
from pose.sequence import SequenceBuilder
from pose.augmentations import PoseAugmentor
from pose.visualizer import PoseVisualizer
from pose.mock_generator import MockPoseGenerator

__all__ = [
    'Landmark', 'PoseFrame', 'PoseSequence',
    'PoseReader', 'PoseValidator', 'PoseNormalizer',
    'SequenceBuilder', 'PoseAugmentor', 'PoseVisualizer',
    'MockPoseGenerator'
]
