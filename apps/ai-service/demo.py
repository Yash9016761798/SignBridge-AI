"""
Demo mode for SignBridge AI.
Provides sample pose sequences for demonstrations without webcam.
"""
import random
import logging
from typing import List, Dict, Any

logger = logging.getLogger("signbridge.demo")

# Sample ISL signs with their pose sequences (simplified 33 landmarks x 5 features)
DEMO_SIGNS: Dict[str, Dict[str, Any]] = {
    "hello": {
        "text": "hello",
        "description": "Greeting sign - open palm wave",
        "frames": 15,
        "confidence": 0.92,
    },
    "thank_you": {
        "text": "thank you",
        "description": "Thank you sign - hand from chin forward",
        "frames": 12,
        "confidence": 0.88,
    },
    "yes": {
        "text": "yes",
        "description": "Yes sign - fist nodding",
        "frames": 10,
        "confidence": 0.95,
    },
    "no": {
        "text": "no",
        "description": "No sign - index and middle finger snap",
        "frames": 8,
        "confidence": 0.91,
    },
    "please": {
        "text": "please",
        "description": "Please sign - open palm circular motion on chest",
        "frames": 14,
        "confidence": 0.87,
    },
    "sorry": {
        "text": "sorry",
        "description": "Sorry sign - fist circular motion on chest",
        "frames": 12,
        "confidence": 0.85,
    },
    "help": {
        "text": "help",
        "description": "Help sign - fist on open palm, lift up",
        "frames": 16,
        "confidence": 0.89,
    },
    "good_morning": {
        "text": "good morning",
        "description": "Good morning sign - good + morning",
        "frames": 20,
        "confidence": 0.83,
    },
}


def generate_sample_pose(num_landmarks: int = 33, num_features: int = 5) -> List[List[float]]:
    """Generate a single random pose frame.
    
    Returns a (num_landmarks, num_features) array of normalized pose data.
    """
    frame = []
    for i in range(num_landmarks):
        landmark = [
            random.uniform(0.0, 1.0),   # x
            random.uniform(0.0, 1.0),   # y
            random.uniform(-0.5, 0.5),  # z
            random.uniform(0.5, 1.0),   # visibility
            random.uniform(0.0, 1.0),   # extra feature
        ]
        frame.append(landmark)
    return frame


def generate_demo_sequence(
    sign_name: str = "hello",
    num_landmarks: int = 33,
    num_features: int = 5,
) -> List[List[List[float]]]:
    """Generate a pose sequence for a demo sign.
    
    Args:
        sign_name: Name of the sign to generate.
        num_landmarks: Number of pose landmarks.
        num_features: Number of features per landmark.
    
    Returns:
        List of frames, each frame is (num_landmarks, num_features).
    """
    sign_info = DEMO_SIGNS.get(sign_name, DEMO_SIGNS["hello"])
    num_frames = sign_info["frames"]
    
    sequence = []
    for _ in range(num_frames):
        frame = generate_sample_pose(num_landmarks, num_features)
        sequence.append(frame)
    
    return sequence


def get_demo_signs() -> List[Dict[str, Any]]:
    """Return list of available demo signs with metadata."""
    signs = []
    for name, info in DEMO_SIGNS.items():
        signs.append({
            "name": name,
            "text": info["text"],
            "description": info["description"],
            "frames": info["frames"],
            "confidence": info["confidence"],
        })
    return signs


def get_demo_prediction(sign_name: str = "hello") -> Dict[str, Any]:
    """Get a simulated prediction for a demo sign.
    
    Returns:
        Dict with prediction text, confidence, and processing time.
    """
    sign_info = DEMO_SIGNS.get(sign_name, DEMO_SIGNS["hello"])
    
    # Add some randomness to simulate real inference
    confidence = sign_info["confidence"] + random.uniform(-0.05, 0.05)
    confidence = max(0.0, min(1.0, confidence))
    
    processing_time = random.uniform(15.0, 45.0)  # ms
    
    return {
        "text": sign_info["text"],
        "confidence": round(confidence, 4),
        "processing_time_ms": round(processing_time, 2),
        "tokens": list(range(4, 4 + len(sign_info["text"].split()))),
    }
