"""
Mock Pose Generator for SignBridge AI.
Generates realistic synthetic pose data for testing.
"""
import random
import math
import json
from pathlib import Path
from typing import Optional, List, Dict
from pose import PoseSequence, PoseFrame, Landmark


class MockPoseGenerator:
    def __init__(self, num_landmarks=33, seed=None):
        self.num_landmarks = num_landmarks
        self.rng = random.Random(seed)

    def generate(self, num_frames=30, missing_prob=0.05, confidence_range=(0.5, 1.0)) -> PoseSequence:
        frames = []
        base_positions = self._generate_base_positions()

        for t in range(num_frames):
            landmarks = []
            for l in range(self.num_landmarks):
                if self.rng.random() < missing_prob:
                    landmarks.append(Landmark(x=0.0, y=0.0, z=0.0, visibility=0.0, confidence=0.0))
                else:
                    bx, by, bz = base_positions[l]
                    motion_x = 0.1 * math.sin(2 * math.pi * t / num_frames + l * 0.5)
                    motion_y = 0.05 * math.cos(2 * math.pi * t / num_frames + l * 0.3)
                    noise_x = self.rng.gauss(0, 0.01)
                    noise_y = self.rng.gauss(0, 0.01)
                    noise_z = self.rng.gauss(0, 0.005)
                    conf = self.rng.uniform(*confidence_range)
                    landmarks.append(Landmark(
                        x=bx + motion_x + noise_x,
                        y=by + motion_y + noise_y,
                        z=bz + noise_z,
                        visibility=conf,
                        confidence=conf
                    ))
            frames.append(PoseFrame(frame_index=t, timestamp=t / 30.0, landmarks=landmarks))

        return PoseSequence(
            frames=frames,
            metadata={'source': 'mock', 'num_frames': num_frames, 'num_landmarks': self.num_landmarks}
        )

    def _generate_base_positions(self) -> List[tuple]:
        positions = []
        for l in range(self.num_landmarks):
            angle = 2 * math.pi * l / self.num_landmarks
            x = 0.3 * math.cos(angle) + self.rng.gauss(0, 0.05)
            y = 0.3 * math.sin(angle) + self.rng.gauss(0, 0.05)
            z = self.rng.gauss(0, 0.02)
            positions.append((x, y, z))
        return positions

    def generate_sequence(self, name='mock', num_frames=30) -> PoseSequence:
        return self.generate(num_frames=num_frames)

    def generate_batch(self, count=10, num_frames=30) -> List[PoseSequence]:
        return [self.generate(num_frames=num_frames) for _ in range(count)]

    def save_json(self, sequence: PoseSequence, path: str):
        data = {
            'metadata': sequence.metadata,
            'frames': []
        }
        for frame in sequence.frames:
            frame_data = {
                'frame_index': frame.frame_index,
                'timestamp': frame.timestamp,
                'landmarks': [
                    {'x': lm.x, 'y': lm.y, 'z': lm.z, 'visibility': lm.visibility, 'confidence': lm.confidence}
                    for lm in frame.landmarks
                ]
            }
            data['frames'].append(frame_data)

        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
