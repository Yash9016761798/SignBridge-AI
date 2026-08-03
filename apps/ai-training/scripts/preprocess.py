"""
Preprocessing Pipeline for SignBridge AI Training.

This script handles dataset preprocessing: frame extraction, resizing,
normalization, train/val/test splitting, and format conversion.

DO NOT assume local files exist. Dataset source is always from configuration.
DO NOT run preprocessing automatically — this is infrastructure only.
"""

import sys
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))

from utils import load_config, get_project_root, resolve_dataset_path, ensure_dir, setup_logging

logger = logging.getLogger(__name__)


# =============================================================================
# FRAME EXTRACTION
# =============================================================================

def extract_frames_from_video(
    video_path: str,
    max_frames: int = 30,
    sample_rate: int = 1,
    target_size: Optional[Tuple[int, int]] = None,
) -> np.ndarray:
    """Extract frames from a video file.

    Args:
        video_path: Path to video file.
        max_frames: Maximum number of frames to extract.
        sample_rate: Extract every Nth frame.
        target_size: Optional (width, height) to resize frames.

    Returns:
        numpy array of shape (num_frames, height, width, 3).
    """
    try:
        import cv2
    except ImportError:
        raise ImportError("opencv-python is required for video preprocessing")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {video_path}")

    frames = []
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % sample_rate == 0:
            if target_size:
                frame = cv2.resize(frame, target_size)
            frames.append(frame)

        frame_idx += 1

        if len(frames) >= max_frames:
            break

    cap.release()

    if not frames:
        return np.array([])

    return np.stack(frames)


def extract_frames_from_hf_sample(sample: Any, max_frames: int = 30) -> np.ndarray:
    """Extract frames from a HuggingFace dataset sample.

    Args:
        sample: HuggingFace dataset sample with video data.
        max_frames: Maximum number of frames.

    Returns:
        numpy array of frames.
    """
    video = sample.get("video") or sample.get("pixel_values")

    if video is None:
        return np.array([])

    if hasattr(video, "numpy"):
        video = video.numpy()

    if isinstance(video, np.ndarray):
        if len(video.shape) == 4:  # (frames, H, W, C)
            return video[:max_frames]
        elif len(video.shape) == 3:  # Single frame (H, W, C)
            return video[np.newaxis, :]

    return np.array([])


# =============================================================================
# NORMALIZATION
# =============================================================================

def normalize_landmarks(landmarks: np.ndarray) -> np.ndarray:
    """Normalize landmark coordinates to [0, 1] range.

    Args:
        landmarks: Array of shape (num_frames, num_landmarks, 3).

    Returns:
        Normalized landmarks.
    """
    if landmarks.size == 0:
        return landmarks

    min_val = landmarks.min(axis=(-2, -1), keepdims=True)
    max_val = landmarks.max(axis=(-2, -1), keepdims=True)

    range_val = max_val - min_val
    range_val[range_val == 0] = 1.0  # Avoid division by zero

    return (landmarks - min_val) / range_val


def normalize_frames(frames: np.ndarray) -> np.ndarray:
    """Normalize video frames to [0, 1] range.

    Args:
        frames: Array of shape (num_frames, H, W, C) with values in [0, 255].

    Returns:
        Normalized frames with values in [0, 1].
    """
    return frames.astype(np.float32) / 255.0


# =============================================================================
# SPLITTING
# =============================================================================

def create_splits(
    data: np.ndarray,
    labels: np.ndarray,
    train_ratio: float = 0.8,
    val_ratio: float = 0.1,
    test_ratio: float = 0.1,
    seed: int = 42,
) -> Dict[str, Tuple[np.ndarray, np.ndarray]]:
    """Split data into train/val/test sets.

    Args:
        data: Input data array.
        labels: Label array.
        train_ratio: Fraction for training.
        val_ratio: Fraction for validation.
        test_ratio: Fraction for testing.
        seed: Random seed.

    Returns:
        Dictionary with 'train', 'val', 'test' keys mapping to (data, labels) tuples.
    """
    assert abs(train_ratio + val_ratio + test_ratio - 1.0) < 1e-6, "Ratios must sum to 1.0"

    n = len(data)
    indices = np.random.RandomState(seed).permutation(n)

    train_end = int(n * train_ratio)
    val_end = int(n * (train_ratio + val_ratio))

    train_idx = indices[:train_end]
    val_idx = indices[train_end:val_end]
    test_idx = indices[val_end:]

    return {
        "train": (data[train_idx], labels[train_idx]),
        "val": (data[val_idx], labels[val_idx]),
        "test": (data[test_idx], labels[test_idx]),
    }


# =============================================================================
# SAVE
# =============================================================================

def save_processed_data(
    splits: Dict[str, Tuple[np.ndarray, np.ndarray]],
    output_dir: str,
    format: str = "numpy",
) -> None:
    """Save preprocessed data splits.

    Args:
        splits: Dictionary of data splits.
        output_dir: Output directory path.
        format: Output format ("numpy", "csv", "parquet").
    """
    output_path = ensure_dir(Path(output_dir))

    for split_name, (data, labels) in splits.items():
        split_dir = output_path / split_name
        ensure_dir(split_dir)

        if format == "numpy":
            np.save(split_dir / "data.npy", data)
            np.save(split_dir / "labels.npy", labels)
        elif format == "csv":
            flat_data = data.reshape(len(data), -1)
            df = pd.DataFrame(flat_data)
            df["label"] = labels
            df.to_csv(split_dir / "data.csv", index=False)
        elif format == "parquet":
            flat_data = data.reshape(len(data), -1)
            df = pd.DataFrame(flat_data)
            df["label"] = labels
            df.to_parquet(split_dir / "data.parquet", index=False)

        logger.info(f"Saved {split_name}: {data.shape[0]} samples to {split_dir}")


# =============================================================================
# MAIN PIPELINE
# =============================================================================

def run_preprocessing(config: Dict) -> None:
    """Run the full preprocessing pipeline.

    Args:
        config: Dataset configuration dictionary.
    """
    logger.info("Starting preprocessing pipeline")
    logger.info(f"Source type: {config['source']['type']}")

    source_type = config["source"]["type"]

    if source_type == "huggingface":
        logger.info("HuggingFace preprocessing: use notebook 03_preprocessing.ipynb")
        logger.info("Streaming mode does not support bulk preprocessing via CLI")
    elif source_type in ("local", "gdrive"):
        root_dir = resolve_dataset_path(config)
        if root_dir and root_dir.exists():
            logger.info(f"Local dataset found at {root_dir}")
            logger.info("Use notebook 03_preprocessing.ipynb for full pipeline")
        else:
            logger.warning(f"Dataset directory not found: {root_dir}")
    else:
        logger.error(f"Unknown source type: {source_type}")


# =============================================================================
# CLI
# =============================================================================

def main():
    """Run preprocessing from CLI."""
    setup_logging(level="INFO")

    config = load_config("dataset")
    run_preprocessing(config)


if __name__ == "__main__":
    main()
