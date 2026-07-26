"""
Pose Normalizer for SignBridge AI.
Normalizes pose coordinates for consistent model input.
"""
import logging
import math
from dataclasses import dataclass
from typing import Optional
from pose import PoseSequence, PoseFrame, Landmark

logger = logging.getLogger(__name__)


@dataclass
class NormalizerConfig:
    center: bool = True
    scale: bool = True
    shoulder_center: bool = False
    wrist_center: bool = False
    confidence_threshold: float = 0.5
    interpolate_missing: bool = True
    target_range: tuple = (-1.0, 1.0)


class PoseNormalizer:
    def __init__(self, config=None):
        if config is None:
            config = NormalizerConfig()
        elif isinstance(config, dict):
            config = NormalizerConfig(**config)
        self.config = config

    def normalize(self, sequence: PoseSequence) -> PoseSequence:
        frames = [self._normalize_frame(f, i) for i, f in enumerate(sequence.frames)]
        if self.config.center:
            frames = self._center_sequence(frames)
        if self.config.scale:
            frames = self._scale_sequence(frames)
        if self.config.interpolate_missing:
            frames = self._interpolate_missing(frames)
        return PoseSequence(frames=frames, metadata=sequence.metadata.copy())

    def _normalize_frame(self, frame: PoseFrame, idx: int) -> PoseFrame:
        landmarks = []
        for lm in frame.landmarks:
            if lm.confidence < self.config.confidence_threshold:
                landmarks.append(Landmark(x=0.0, y=0.0, z=0.0, visibility=0.0, confidence=lm.confidence))
            else:
                landmarks.append(Landmark(x=lm.x, y=lm.y, z=lm.z,
                                         visibility=lm.visibility, confidence=lm.confidence))
        return PoseFrame(frame_index=frame.frame_index, timestamp=frame.timestamp, landmarks=landmarks)

    def _center_sequence(self, frames):
        result = []
        for frame in frames:
            if self.config.wrist_center:
                center = self._get_wrist_center(frame)
            elif self.config.shoulder_center:
                center = self._get_shoulder_center(frame)
            else:
                center = self._get_body_center(frame)
            landmarks = [Landmark(x=lm.x - center[0], y=lm.y - center[1], z=lm.z - center[2],
                                  visibility=lm.visibility, confidence=lm.confidence) for lm in frame.landmarks]
            result.append(PoseFrame(frame_index=frame.frame_index, timestamp=frame.timestamp, landmarks=landmarks))
        return result

    def _get_body_center(self, frame):
        xs = [lm.x for lm in frame.landmarks if lm.confidence > 0]
        ys = [lm.y for lm in frame.landmarks if lm.confidence > 0]
        zs = [lm.z for lm in frame.landmarks if lm.confidence > 0]
        if not xs:
            return (0.0, 0.0, 0.0)
        return (sum(xs) / len(xs), sum(ys) / len(ys), sum(zs) / len(zs))

    def _get_shoulder_center(self, frame):
        left = frame.landmarks[11] if len(frame.landmarks) > 11 else None
        right = frame.landmarks[12] if len(frame.landmarks) > 12 else None
        if left and right and left.confidence > 0 and right.confidence > 0:
            return ((left.x + right.x) / 2, (left.y + right.y) / 2, (left.z + right.z) / 2)
        return self._get_body_center(frame)

    def _get_wrist_center(self, frame):
        left = frame.landmarks[15] if len(frame.landmarks) > 15 else None
        right = frame.landmarks[16] if len(frame.landmarks) > 16 else None
        if left and right and left.confidence > 0 and right.confidence > 0:
            return ((left.x + right.x) / 2, (left.y + right.y) / 2, (left.z + right.z) / 2)
        return self._get_shoulder_center(frame)

    def _scale_sequence(self, frames):
        all_coords = []
        for frame in frames:
            for lm in frame.landmarks:
                if lm.confidence > 0:
                    all_coords.extend([lm.x, lm.y, lm.z])
        if not all_coords:
            return frames
        max_val = max(abs(c) for c in all_coords) if all_coords else 1.0
        if max_val < 1e-6:
            max_val = 1.0
        lo, hi = self.config.target_range
        scale = (hi - lo) / (2 * max_val)
        result = []
        for frame in frames:
            landmarks = [Landmark(x=lm.x * scale, y=lm.y * scale, z=lm.z * scale,
                                  visibility=lm.visibility, confidence=lm.confidence) for lm in frame.landmarks]
            result.append(PoseFrame(frame_index=frame.frame_index, timestamp=frame.timestamp, landmarks=landmarks))
        return result

    def _interpolate_missing(self, frames):
        if len(frames) < 2:
            return frames
        result = [frames[0]]
        for i in range(1, len(frames)):
            prev = frames[i - 1]
            curr = frames[i]
            landmarks = []
            for j in range(len(curr.landmarks)):
                pl = prev.landmarks[j] if j < len(prev.landmarks) else Landmark(0, 0, 0)
                cl = curr.landmarks[j]
                if cl.confidence < self.config.confidence_threshold and pl.confidence > 0:
                    landmarks.append(Landmark(x=pl.x, y=pl.y, z=pl.z,
                                              visibility=pl.visibility, confidence=pl.confidence))
                else:
                    landmarks.append(cl)
            result.append(PoseFrame(frame_index=curr.frame_index, timestamp=curr.timestamp, landmarks=landmarks))
        return result
