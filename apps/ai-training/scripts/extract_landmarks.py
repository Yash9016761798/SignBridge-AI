"""
MediaPipe Landmark Extraction for SignBridge AI Training.

This script extracts hand, pose, and face landmarks from video frames
using MediaPipe solutions.

DO NOT assume local files exist. Dataset source is always from configuration.
"""

import sys
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))

from utils import load_config, get_project_root, ensure_dir, setup_logging

logger = logging.getLogger(__name__)


# =============================================================================
# MEDIAPIPE LANDMARK EXTRACTION
# =============================================================================

class LandmarkExtractor:
    """Extract landmarks from video frames using MediaPipe.

    Attributes:
        hands: MediaPipe Hands solution.
        pose: MediaPipe Pose solution.
        config: Landmark extraction configuration.
    """

    def __init__(self, config: Dict):
        """Initialize MediaPipe solutions.

        Args:
            config: Landmark configuration from dataset.yaml.
        """
        self.config = config
        self.hands = None
        self.pose = None
        self._initialize_mediapipe()

    def _initialize_mediapipe(self) -> None:
        """Initialize MediaPipe Hands and Pose solutions."""
        try:
            import mediapipe as mp

            mp_config = self.config.get("mediapipe", {})

            if self.config.get("extract_hands", True):
                self.hands = mp.solutions.hands.Hands(
                    static_image_mode=mp_config.get("static_image_mode", False),
                    max_num_hands=2,
                    min_detection_confidence=mp_config.get("min_detection_confidence", 0.5),
                    min_tracking_confidence=mp_config.get("min_tracking_confidence", 0.5),
                )
                logger.info("MediaPipe Hands initialized")

            if self.config.get("extract_pose", True):
                self.pose = mp.solutions.pose.Pose(
                    static_image_mode=mp_config.get("static_image_mode", False),
                    model_complexity=mp_config.get("model_complexity", 1),
                    min_detection_confidence=mp_config.get("min_detection_confidence", 0.5),
                    min_tracking_confidence=mp_config.get("min_tracking_confidence", 0.5),
                )
                logger.info("MediaPipe Pose initialized")

        except ImportError:
            logger.error("mediapipe is not installed. Install with: pip install mediapipe")
            raise

    def extract_from_frame(self, frame: np.ndarray) -> Dict[str, np.ndarray]:
        """Extract landmarks from a single RGB frame.

        Args:
            frame: RGB frame of shape (H, W, 3).

        Returns:
            Dictionary with keys: 'hands', 'pose', each containing
            landmark arrays.
        """
        import mediapipe as mp

        results = {}
        rgb_frame = frame

        # Ensure frame is RGB
        if len(frame.shape) == 3 and frame.shape[2] == 3:
            rgb_frame = frame

        # Extract hand landmarks
        if self.hands:
            hand_results = self.hands.process(rgb_frame)
            if hand_results.multi_hand_landmarks:
                hand_landmarks = []
                for hand_lm in hand_results.multi_hand_landmarks:
                    lm = np.array(
                        [[lm.x, lm.y, lm.z] for lm in hand_lm.landmark],
                        dtype=np.float32,
                    )
                    hand_landmarks.append(lm)
                # Pad to 2 hands
                while len(hand_landmarks) < 2:
                    hand_landmarks.append(np.zeros((21, 3), dtype=np.float32))
                results["hands"] = np.stack(hand_landmarks[:2])
            else:
                results["hands"] = np.zeros((2, 21, 3), dtype=np.float32)

        # Extract pose landmarks
        if self.pose:
            pose_results = self.pose.process(rgb_frame)
            if pose_results.pose_landmarks:
                pose_lm = pose_results.pose_landmarks.landmark
                results["pose"] = np.array(
                    [[lm.x, lm.y, lm.z] for lm in pose_lm],
                    dtype=np.float32,
                )
            else:
                results["pose"] = np.zeros((33, 3), dtype=np.float32)

        return results

    def extract_from_frames(self, frames: np.ndarray) -> Dict[str, np.ndarray]:
        """Extract landmarks from a sequence of frames.

        Args:
            frames: Array of shape (num_frames, H, W, 3).

        Returns:
            Dictionary with landmark sequences.
        """
        all_hands = []
        all_pose = []

        for frame in frames:
            landmarks = self.extract_from_frame(frame)
            if "hands" in landmarks:
                all_hands.append(landmarks["hands"])
            if "pose" in landmarks:
                all_pose.append(landmarks["pose"])

        result = {}
        if all_hands:
            result["hands"] = np.stack(all_hands)
        if all_pose:
            result["pose"] = np.stack(all_pose)

        return result

    def close(self) -> None:
        """Release MediaPipe resources."""
        if self.hands:
            self.hands.close()
        if self.pose:
            self.pose.close()


# =============================================================================
# LANDMARK PROCESSING
# =============================================================================

def flatten_landmarks(landmarks: Dict[str, np.ndarray]) -> np.ndarray:
    """Flatten multi-dimensional landmarks into a 1D feature vector per frame.

    Args:
        landmarks: Dictionary with 'hands' (T, 2, 21, 3) and 'pose' (T, 33, 3).

    Returns:
        Array of shape (T, num_features).
    """
    features = []

    if "hands" in landmarks:
        hands = landmarks["hands"]  # (T, 2, 21, 3)
        features.append(hands.reshape(hands.shape[0], -1))

    if "pose" in landmarks:
        pose = landmarks["pose"]  # (T, 33, 3)
        features.append(pose.reshape(pose.shape[0], -1))

    if not features:
        return np.array([])

    return np.concatenate(features, axis=1)


def normalize_landmarks(landmarks: np.ndarray) -> np.ndarray:
    """Normalize landmarks relative to the wrist point.

    Args:
        landmarks: Array of shape (T, num_landmarks, 3).

    Returns:
        Normalized landmarks.
    """
    if landmarks.size == 0:
        return landmarks

    # Use left wrist (landmark 0) as origin if available
    wrist = landmarks[:, 0:1, :]  # (T, 1, 3)
    return landmarks - wrist


# =============================================================================
# MAIN
# =============================================================================

def main():
    """Run landmark extraction from CLI."""
    setup_logging(level="INFO")

    config = load_config("dataset")
    landmark_config = config.get("preprocessing", {}).get("landmarks", {})

    logger.info("Landmark extraction infrastructure ready")
    logger.info(f"Extract hands: {landmark_config.get('extract_hands', True)}")
    logger.info(f"Extract pose: {landmark_config.get('extract_pose', True)}")
    logger.info(f"Normalize: {landmark_config.get('normalize', True)}")
    logger.info("Use notebook 02_pose_analysis.ipynb for interactive extraction")


if __name__ == "__main__":
    main()
