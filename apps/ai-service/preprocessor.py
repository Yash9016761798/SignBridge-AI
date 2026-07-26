"""
Preprocessing module for SignBridge AI.
Converts raw pose data into tensors suitable for the PoseTransformer.
"""
import numpy as np
import torch
from typing import List, Optional


def normalize_landmarks(landmarks: np.ndarray) -> np.ndarray:
    """Normalize pose landmarks to zero-mean, unit-variance.

    Args:
        landmarks: Array of shape (T, L, F) or (L, F).

    Returns:
        Normalized array of same shape.
    """
    mean = landmarks.mean(axis=-2, keepdims=True)
    std = landmarks.std(axis=-2, keepdims=True) + 1e-8
    return (landmarks - mean) / std


def validate_pose_shape(pose: np.ndarray, expected_t: Optional[int] = None,
                         expected_l: int = 33, expected_f: int = 5) -> np.ndarray:
    """Validate and pad/trim pose array to expected dimensions.

    Args:
        pose: Raw pose array.
        expected_t: Expected time steps (None = no trim/pad on time).
        expected_l: Expected landmarks.
        expected_f: Expected features.

    Returns:
        Validated array of shape (T, L, F).

    Raises:
        ValueError: If landmark/feature dimensions are wrong.
    """
    if pose.ndim == 2:
        pose = pose[np.newaxis, :, :]

    if pose.ndim != 3:
        raise ValueError(f"Expected 3D pose array (T, L, F), got shape {pose.shape}")

    T, L, F = pose.shape
    if L != expected_l:
        raise ValueError(f"Expected {expected_l} landmarks, got {L}")
    if F != expected_f:
        raise ValueError(f"Expected {expected_f} features, got {F}")

    if expected_t is not None:
        if T > expected_t:
            pose = pose[:expected_t]
        elif T < expected_t:
            pad = np.zeros((expected_t - T, L, F), dtype=pose.dtype)
            pose = np.concatenate([pose, pad], axis=0)

    return pose


def preprocess_pose(
    pose_sequence: List[List[List[float]]],
    max_length: int = 30,
    num_landmarks: int = 33,
    num_features: int = 5,
    normalize: bool = True,
) -> torch.Tensor:
    """Convert a list of pose frames into a normalized torch tensor.

    Args:
        pose_sequence: List of frames, each frame is (L, F) list.
        max_length: Maximum time steps.
        num_landmarks: Expected landmark count.
        num_features: Expected feature count.
        normalize: Whether to normalize landmarks.

    Returns:
        Tensor of shape (1, T, L, F).
    """
    pose = np.array(pose_sequence, dtype=np.float32)
    pose = validate_pose_shape(pose, expected_t=max_length,
                                expected_l=num_landmarks, expected_f=num_features)

    if normalize:
        pose = normalize_landmarks(pose)

    tensor = torch.tensor(pose, dtype=torch.float32).unsqueeze(0)
    return tensor


def create_pose_mask(pose_tensor: torch.Tensor) -> torch.Tensor:
    """Create padding mask for the pose tensor.

    True = padded frame (should be masked/ignored).
    False = valid frame.

    Args:
        pose_tensor: Shape (B, T, L, F).

    Returns:
        Mask of shape (B, T), True where padded.
    """
    B, T, L, F = pose_tensor.shape
    mask = torch.zeros(B, T, dtype=torch.bool, device=pose_tensor.device)
    norm = pose_tensor.abs().sum(dim=(-1, -2))
    mask = norm == 0
    return mask
