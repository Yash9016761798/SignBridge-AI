"""
Pose Augmentations for SignBridge AI.
Configurable data augmentations for pose sequences.
"""
import random
import math
from dataclasses import dataclass, field
from typing import List, Optional
from pose import PoseSequence, PoseFrame, Landmark


@dataclass
class AugmentationConfig:
    rotation_range: float = 15.0
    translation_range: float = 0.1
    scale_range: tuple = (0.9, 1.1)
    noise_std: float = 0.01
    flip_horizontal: bool = False
    time_stretch_range: tuple = (0.8, 1.2)
    frame_drop_prob: float = 0.0
    random_seed: Optional[int] = None


class PoseAugmentor:
    def __init__(self, config=None):
        if config is None:
            config = AugmentationConfig()
        elif isinstance(config, dict):
            config = AugmentationConfig(**config)
        self.config = config
        self.rng = random.Random(config.random_seed)

    def augment(self, sequence: PoseSequence) -> PoseSequence:
        frames = [self._augment_frame(f) for f in sequence.frames]
        if self.config.flip_horizontal:
            frames = [self._flip_frame(f) for f in frames]
        if self.config.frame_drop_prob > 0:
            frames = self._drop_frames(frames)
        return PoseSequence(frames=frames, metadata=sequence.metadata.copy())

    def _augment_frame(self, frame: PoseFrame) -> PoseFrame:
        landmarks = []
        for lm in frame.landmarks:
            x, y, z = lm.x, lm.y, lm.z
            angle = math.radians(self.rng.uniform(-self.config.rotation_range, self.config.rotation_range))
            cos_a, sin_a = math.cos(angle), math.sin(angle)
            x_new = x * cos_a - y * sin_a
            y_new = x * sin_a + y * cos_a
            tx = self.rng.uniform(-self.config.translation_range, self.config.translation_range)
            ty = self.rng.uniform(-self.config.translation_range, self.config.translation_range)
            x_new += tx
            y_new += ty
            scale = self.rng.uniform(*self.config.scale_range)
            x_new *= scale
            y_new *= scale
            z *= scale
            nx = self.rng.gauss(0, self.config.noise_std)
            ny = self.rng.gauss(0, self.config.noise_std)
            nz = self.rng.gauss(0, self.config.noise_std)
            landmarks.append(Landmark(
                x=x_new + nx, y=y_new + ny, z=z + nz,
                visibility=lm.visibility, confidence=lm.confidence
            ))
        return PoseFrame(frame_index=frame.frame_index, timestamp=frame.timestamp, landmarks=landmarks)

    def _flip_frame(self, frame: PoseFrame) -> PoseFrame:
        landmarks = [Landmark(x=-lm.x, y=lm.y, z=lm.z,
                              visibility=lm.visibility, confidence=lm.confidence) for lm in frame.landmarks]
        return PoseFrame(frame_index=frame.frame_index, timestamp=frame.timestamp, landmarks=landmarks)

    def _drop_frames(self, frames: List[PoseFrame]) -> List[PoseFrame]:
        if len(frames) <= 2:
            return frames
        return [f for f in frames if self.rng.random() >= self.config.frame_drop_prob] or frames[:1]
