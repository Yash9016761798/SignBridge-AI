# Pose Processing Pipeline

## Overview

The SignBridge AI Pose Processing Pipeline provides complete preprocessing for pose data in sign language translation. It supports multiple input formats, validation, normalization, sequence building, and augmentation.

## Architecture

```
Input Data (JSON/MediaPipe/iSign)
         │
         ▼
┌─────────────────┐
│   PoseReader     │  Adapter pattern for multiple formats
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Validator      │  Check quality and consistency
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Normalizer     │  Center, scale, interpolate
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Augmentor      │  Optional data augmentation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SequenceBuilder  │  Pad, truncate, create tensors
└────────┬────────┘
         │
         ▼
    Output Tensors
```

## Components

### 1. PoseReader

Reads pose data from multiple formats using adapter pattern.

**Supported Formats:**

| Format | Extension | Source |
|--------|-----------|--------|
| Mock JSON | `.json` | Test data |
| MediaPipe | `.json` | MediaPipe Holistic |
| iSign | `.pose` | iSign dataset |

**Usage:**

```python
from pose import PoseReader

reader = PoseReader()
sequence = reader.read('pose_data.json')
```

### 2. Common Format

Each frame contains:

```python
PoseFrame(
    frame_index=0,
    timestamp=0.033,
    landmarks=[
        Landmark(x=0.5, y=0.3, z=0.1, visibility=0.9, confidence=0.9),
        # ... 33 landmarks for MediaPipe Pose
    ]
)
```

**Feature Vector (5 per landmark):**

| Index | Feature | Description |
|-------|---------|-------------|
| 0 | x | Horizontal position |
| 1 | y | Vertical position |
| 2 | z | Depth |
| 3 | visibility | MediaPipe visibility |
| 4 | confidence | Detection confidence |

### 3. PoseValidator

Validates pose sequences for quality.

**Checks:**

- Empty sequences
- Missing landmarks
- NaN values
- Coordinate ranges
- Duplicate frames
- Dimension consistency

**Usage:**

```python
from pose import PoseValidator

validator = PoseValidator({'max_nan_ratio': 0.3})
report = validator.validate(sequence)
print(report.is_valid, report.errors)
```

### 4. PoseNormalizer

Normalizes pose coordinates.

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `center` | `true` | Center on body |
| `scale` | `true` | Scale to [-1, 1] |
| `shoulder_center` | `false` | Center on shoulders |
| `wrist_center` | `false` | Center on wrists |
| `confidence_threshold` | `0.5` | Filter low confidence |
| `interpolate_missing` | `true` | Fill missing landmarks |

**Usage:**

```python
from pose import PoseNormalizer

normalizer = PoseNormalizer()
normalized = normalizer.normalize(sequence)
```

### 5. SequenceBuilder

Builds padded tensors for model input.

**Output:**

```python
{
    'pose_tensor': np.ndarray,      # [T, L, 5]
    'attention_mask': np.ndarray,   # [T]
    'sequence_length': np.ndarray,  # scalar
}
```

**Usage:**

```python
from pose import SequenceBuilder

builder = SequenceBuilder({'max_length': 64})
result = builder.build(sequence)
batch = builder.build_batch([seq1, seq2, seq3])
```

### 6. PoseAugmentor

Configurable data augmentations.

**Augmentations:**

| Type | Parameter | Default |
|------|-----------|---------|
| Rotation | `rotation_range` | 15.0 degrees |
| Translation | `translation_range` | 0.1 |
| Scaling | `scale_range` | (0.9, 1.1) |
| Gaussian noise | `noise_std` | 0.01 |
| Horizontal flip | `flip_horizontal` | false |
| Frame dropping | `frame_drop_prob` | 0.0 |

**Usage:**

```python
from pose import PoseAugmentor

augmentor = PoseAugmentor({'rotation_range': 20.0, 'noise_std': 0.02})
augmented = augmentor.augment(sequence)
```

### 7. PoseVisualizer

Generates visualizations.

**Usage:**

```python
from pose import PoseVisualizer

viz = PoseVisualizer()
viz.plot_frame(sequence, frame_idx=0, save_path='frame_0.png')
viz.plot_statistics(sequence, save_path='stats.png')
```

### 8. MockPoseGenerator

Generates synthetic test data.

**Usage:**

```python
from pose import MockPoseGenerator

gen = MockPoseGenerator(num_landmarks=33, seed=42)
sequence = gen.generate(num_frames=30)
gen.save_json(sequence, 'mock_pose.json')
```

## Configuration

See `configs/pose.yaml` for all options.

## Pipeline Example

```python
from pose import (
    PoseReader, PoseValidator, PoseNormalizer,
    SequenceBuilder, PoseAugmentor
)

# Read
reader = PoseReader()
seq = reader.read('input.json')

# Validate
validator = PoseValidator()
report = validator.validate(seq)
assert report.is_valid

# Normalize
normalizer = PoseNormalizer()
norm_seq = normalizer.normalize(seq)

# Augment (optional)
augmentor = PoseAugmentor()
aug_seq = augmentor.augment(norm_seq)

# Build tensors
builder = SequenceBuilder({'max_length': 64})
result = builder.build(aug_seq)

# result['pose_tensor'] -> [64, 33, 5]
# result['attention_mask'] -> [64]
# result['sequence_length'] -> scalar
```

## MediaPipe Integration

```python
import mediapipe as mp
from pose import PoseReader

# Extract with MediaPipe
mp_pose = mp.solutions.pose
with mp_pose.Pose() as pose:
    results = pose.process(image)

# Convert to our format
landmarks = []
for lm in results.pose_landmarks.landmark:
    landmarks.append({
        'x': lm.x, 'y': lm.y, 'z': lm.z,
        'visibility': lm.visibility
    })

# Read with MediaPipeAdapter
reader = PoseReader()
seq = reader.read_json_string(json.dumps({'landmarks': [landmarks]}))
```

## iSign Integration

```python
from pose import PoseReader

reader = PoseReader()
seq = reader.read('path/to/video.pose')
```

## File Structure

```
pose/
├── __init__.py          # Data structures and exports
├── reader.py            # PoseReader with adapters
├── validator.py         # Validation pipeline
├── normalizer.py        # Normalization pipeline
├── sequence.py          # SequenceBuilder
├── augmentations.py     # Data augmentations
├── visualizer.py        # Visualization tools
└── mock_generator.py    # Mock data generator

configs/
└── pose.yaml            # Configuration

scripts/
└── verify_pose_pipeline.py  # Verification
```
