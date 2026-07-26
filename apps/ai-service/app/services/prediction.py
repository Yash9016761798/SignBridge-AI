"""Mock prediction service for SignBridge AI Service

This module provides stub/mock predictions until a real ML model is integrated.
DO NOT implement TensorFlow or MediaPipe inference here yet.
"""

import random
import time
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

# Mock gesture labels for ISL recognition
MOCK_GESTURES = [
    "Hello", "Thank You", "Yes", "No", "Please", "Help", "Sorry",
    "Good Morning", "Good Night", "How Are You", "Name", "Water",
    "Mother", "Father", "Brother", "Sister", "Friend", "Happy",
    "Sad", "Love", "Eat", "Drink", "Go", "Come", "Stop",
    "One", "Two", "Three", "Four", "Five", "A", "B", "C",
]

MODEL_VERSION = "mock-v1.0.0"
MODEL_NAME = "SignBridge Gesture Recognition (Mock)"
MODEL_STATUS = "stub"


def predict_mock(prediction_type: str, session_id: str = None, user_id: str = None) -> dict:
    """Generate a mock prediction response

    Returns a simulated prediction with confidence score and alternatives.
    This is a placeholder until the real ML model is integrated.
    """
    start_time = time.time()

    # Simulate processing time (50-200ms)
    processing_time_ms = random.uniform(50, 200)
    time.sleep(processing_time_ms / 1000)

    # Pick a random primary gesture
    primary_gesture = random.choice(MOCK_GESTURES)
    primary_confidence = round(random.uniform(0.65, 0.98), 4)

    # Generate alternatives
    alternatives = []
    remaining = [g for g in MOCK_GESTURES if g != primary_gesture]
    for _ in range(min(3, len(remaining))):
        alt_gesture = random.choice(remaining)
        remaining.remove(alt_gesture)
        alt_confidence = round(random.uniform(0.1, primary_confidence - 0.1), 4)
        alternatives.append({
            "gesture": alt_gesture,
            "confidence": max(0.01, alt_confidence),
        })

    total_time = round((time.time() - start_time) * 1000, 2)

    logger.info(
        f"Mock prediction: {primary_gesture} ({primary_confidence}) "
        f"in {total_time}ms | type={prediction_type} session={session_id}"
    )

    return {
        "gesture": primary_gesture,
        "confidence": primary_confidence,
        "alternatives": alternatives,
        "processing_time_ms": total_time,
        "model_version": MODEL_VERSION,
        "model_name": MODEL_NAME,
        "prediction_type": prediction_type,
    }


def get_model_info() -> dict:
    """Return model information (stub)"""
    return {
        "name": MODEL_NAME,
        "version": MODEL_VERSION,
        "status": MODEL_STATUS,
        "type": "gesture_recognition",
        "framework": "stub",
        "input_types": ["image", "video", "landmarks"],
        "num_classes": len(MOCK_GESTURES),
        "supported_gestures": MOCK_GESTURES,
        "confidence_threshold": 0.7,
        "description": "Mock model for development. Will be replaced with TensorFlow/MediaPipe model.",
        "training_date": None,
        "evaluation_metrics": None,
    }
