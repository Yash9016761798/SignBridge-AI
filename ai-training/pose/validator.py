"""
Pose Validator for SignBridge AI.
Validates pose sequences for quality and consistency.
"""
import logging
import math
from dataclasses import dataclass, field
from typing import List, Dict, Any
from pose import PoseSequence

logger = logging.getLogger(__name__)


@dataclass
class ValidationReport:
    is_valid: bool = True
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    stats: Dict[str, Any] = field(default_factory=dict)


class PoseValidator:
    def __init__(self, config=None):
        config = config or {}
        self.max_nan_ratio = config.get('max_nan_ratio', 0.3)
        self.min_frames = config.get('min_frames', 1)
        self.max_frames = config.get('max_frames', 1000)
        self.min_landmarks = config.get('min_landmarks', 1)
        self.max_landmarks = config.get('max_landmarks', 200)
        self.coord_range = config.get('coord_range', (-10.0, 10.0))

    def validate(self, sequence: PoseSequence) -> ValidationReport:
        report = ValidationReport()

        if not sequence.frames:
            report.is_valid = False
            report.errors.append('Empty sequence')
            return report

        num_frames = len(sequence.frames)
        report.stats['num_frames'] = num_frames

        if num_frames < self.min_frames:
            report.is_valid = False
            report.errors.append(f'Too few frames: {num_frames} < {self.min_frames}')

        if num_frames > self.max_frames:
            report.warnings.append(f'Large sequence: {num_frames} frames')

        num_landmarks = sequence.frames[0].num_landmarks
        report.stats['num_landmarks'] = num_landmarks

        if num_landmarks < self.min_landmarks:
            report.is_valid = False
            report.errors.append(f'Too few landmarks: {num_landmarks}')

        if num_landmarks > self.max_landmarks:
            report.warnings.append(f'Many landmarks: {num_landmarks}')

        nan_count = 0
        total_count = 0
        duplicate_check = set()
        has_duplicates = False

        for i, frame in enumerate(sequence.frames):
            if frame.num_landmarks != num_landmarks:
                report.is_valid = False
                report.errors.append(f'Frame {i}: {frame.num_landmarks} landmarks (expected {num_landmarks})')

            for lm in frame.landmarks:
                total_count += 1
                if math.isnan(lm.x) or math.isnan(lm.y) or math.isnan(lm.z):
                    nan_count += 1
                lo, hi = self.coord_range
                if not (lo <= lm.x <= hi) and lm.x != 0.0:
                    report.warnings.append(f'Frame {i}: x={lm.x:.2f} out of range')
                if not (lo <= lm.y <= hi) and lm.y != 0.0:
                    report.warnings.append(f'Frame {i}: y={lm.y:.2f} out of range')

            frame_key = tuple((lm.x, lm.y, lm.z) for lm in frame.landmarks)
            if frame_key in duplicate_check:
                has_duplicates = True
            duplicate_check.add(frame_key)

        nan_ratio = nan_count / total_count if total_count > 0 else 0
        report.stats['nan_count'] = nan_count
        report.stats['nan_ratio'] = round(nan_ratio, 4)

        if nan_ratio > self.max_nan_ratio:
            report.is_valid = False
            report.errors.append(f'Too many NaN values: {nan_ratio:.1%}')

        if has_duplicates:
            report.warnings.append('Duplicate frames detected')

        return report
