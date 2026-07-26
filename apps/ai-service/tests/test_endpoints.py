"""
Unit tests for SignBridge AI Inference Service.
"""
import sys
import os
import json
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "ai-training"))

from schemas import (
    PredictRequest, TranslateRequest, WebcamFrameRequest,
    PoseFrame, HealthResponse, ModelInfoResponse,
    PredictionResult, TranslateResult, WebcamResult,
)
from preprocessor import preprocess_pose, create_pose_mask, normalize_landmarks, validate_pose_shape
from text_decoder import clean_text, decode_prediction, tokens_to_text
from config import Settings


def make_mock_pose(T=5, L=33, F=5):
    import random
    return [[[random.random() for _ in range(F)] for _ in range(L)] for _ in range(T)]


def make_mock_frame(L=33, F=5):
    import random
    return [[random.random() for _ in range(F)] for _ in range(L)]


class TestSettings:
    def test_defaults(self):
        s = Settings()
        assert s.APP_NAME == "SignBridge AI"
        assert s.PORT == 8000
        assert s.NUM_LANDMARKS == 33
        assert s.NUM_FEATURES == 5

    def test_from_env(self):
        os.environ["SIGNBRIDGE_PORT"] = "9000"
        os.environ["SIGNBRIDGE_DEBUG"] = "true"
        s = Settings.from_env()
        assert s.PORT == 9000
        assert s.DEBUG is True
        os.environ.pop("SIGNBRIDGE_PORT", None)
        os.environ.pop("SIGNBRIDGE_DEBUG", None)


class TestSchemas:
    def test_health_response(self):
        r = HealthResponse(status="healthy", model_loaded=True, model_version="1.0.0", uptime_seconds=10.5)
        assert r.status == "healthy"
        assert r.model_loaded is True

    def test_model_info_response(self):
        r = ModelInfoResponse(
            model_name="PoseTransformer", model_version="1.0.0",
            vocab_size=978, d_model=32, num_heads=4,
            num_encoder_layers=1, num_decoder_layers=1,
            num_parameters=90000, max_seq_length=30,
            num_landmarks=33, num_features=5, device="cpu",
        )
        assert r.vocab_size == 978
        assert r.device == "cpu"

    def test_predict_request(self):
        r = PredictRequest(pose_sequence=make_mock_pose())
        assert len(r.pose_sequence) == 5
        assert r.max_length is None
        assert r.temperature is None

    def test_predict_request_validation(self):
        with pytest.raises(Exception):
            PredictRequest(pose_sequence=[])

    def test_translate_request(self):
        r = TranslateRequest(frame=PoseFrame(landmarks=make_mock_frame()))
        assert len(r.frame.landmarks) == 33

    def test_webcam_frame_request(self):
        r = WebcamFrameRequest(frame_data=make_mock_pose(), session_id="abc-123")
        assert r.session_id == "abc-123"

    def test_prediction_result(self):
        r = PredictionResult(
            prediction={"text": "hello", "tokens": [1, 5, 2]},
            confidence=0.85,
            processing_time_ms=12.5,
            model_version="1.0.0",
        )
        assert r.confidence == 0.85

    def test_webcam_result(self):
        r = WebcamResult(
            prediction={"text": "hi", "tokens": [1, 3, 2]},
            confidence=0.9,
            processing_time_ms=8.2,
            model_version="1.0.0",
            session_id="s1",
        )
        assert r.session_id == "s1"


class TestPreprocessor:
    def test_normalize_landmarks(self):
        import numpy as np
        data = np.random.randn(33, 5).astype(np.float32)
        normed = normalize_landmarks(data)
        assert normed.shape == data.shape
        assert abs(normed.mean()) < 0.5

    def test_validate_pose_shape_2d(self):
        import numpy as np
        data = np.random.randn(33, 5).astype(np.float32)
        result = validate_pose_shape(data)
        assert result.shape == (1, 33, 5)

    def test_validate_pose_shape_3d(self):
        import numpy as np
        data = np.random.randn(10, 33, 5).astype(np.float32)
        result = validate_pose_shape(data, expected_t=5)
        assert result.shape == (5, 33, 5)

    def test_validate_pose_shape_pad(self):
        import numpy as np
        data = np.random.randn(3, 33, 5).astype(np.float32)
        result = validate_pose_shape(data, expected_t=10)
        assert result.shape == (10, 33, 5)

    def test_validate_pose_shape_wrong_landmarks(self):
        import numpy as np
        data = np.random.randn(5, 20, 5).astype(np.float32)
        with pytest.raises(ValueError, match="landmarks"):
            validate_pose_shape(data)

    def test_validate_pose_shape_wrong_features(self):
        import numpy as np
        data = np.random.randn(5, 33, 3).astype(np.float32)
        with pytest.raises(ValueError, match="features"):
            validate_pose_shape(data)

    def test_preprocess_pose(self):
        pose = make_mock_pose(5, 33, 5)
        tensor = preprocess_pose(pose, max_length=30)
        assert tensor.shape == (1, 30, 33, 5)
        assert tensor.dtype.is_floating_point

    def test_create_pose_mask(self):
        import torch
        pose = torch.randn(1, 10, 33, 5)
        mask = create_pose_mask(pose)
        assert mask.shape == (1, 10)
        assert mask.dtype == torch.bool


class TestDecoder:
    def test_clean_text(self):
        assert clean_text("  hello world  ") == "Hello world"
        assert clean_text("") == ""
        assert clean_text("a") == "A"

    def test_decode_prediction(self):
        raw = {"token_ids": [1, 5, 2], "text": "hello", "confidence": 0.8, "processing_time_ms": 10.0}
        result = decode_prediction(raw)
        assert result["text"] == "Hello"
        assert result["tokens"] == [1, 5, 2]
        assert result["confidence"] == 0.8

    def test_tokens_to_text(self):
        idx2word = {3: "hello", 4: "world"}
        text = tokens_to_text([1, 3, 4, 2], idx2word)
        text_lower = text.lower()
        assert "hello" in text_lower
        assert "world" in text_lower


class TestHealthEndpoint:
    def test_health_no_model(self):
        from fastapi.testclient import TestClient
        from main import app, bundle as _b
        client = TestClient(app)
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert "status" in data
        assert "model_loaded" in data
        assert "uptime_seconds" in data
        assert "model_version" in data
