"""
Verify SignBridge AI Inference Service.
Checks that the API starts, model loads, endpoints respond, and tests pass.
"""
import sys
import os
import subprocess
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "apps" / "ai-service"))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "models"))

RESULTS = []


def check(name: str, passed: bool, detail: str = ""):
    status = "PASS" if passed else "FAIL"
    RESULTS.append((name, passed))
    msg = f"  [{status}] {name}"
    if detail:
        msg += f": {detail}"
    print(msg)


def verify_files():
    print("\n1. File Structure")
    print("-" * 40)
    svc = Path("apps/ai-service")
    files = [
        "main.py", "config.py", "schemas.py", "model_loader.py",
        "preprocessor.py", "inference_engine.py",         "text_decoder.py",
        "requirements.txt", "README.md", "Dockerfile",
        "tests/__init__.py", "tests/test_endpoints.py",
    ]
    for f in files:
        p = svc / f
        check(f"{f} exists", p.exists(), f"size={p.stat().st_size if p.exists() else 0}")


def verify_config():
    print("\n2. Configuration")
    print("-" * 40)
    from config import Settings
    s = Settings()
    check("Settings loads", True, f"APP_NAME={s.APP_NAME}")
    check("Default port", s.PORT == 8000)
    check("Num landmarks", s.NUM_LANDMARKS == 33)
    check("Max seq length", s.MAX_SEQ_LENGTH == 30)

    ckpt = s.resolve_checkpoint_path()
    check("Checkpoint path resolves", ckpt.exists(), f"path={ckpt}")
    vcb = s.resolve_vocab_path()
    check("Vocab path resolves", vcb.exists(), f"path={vcb}")


def verify_schemas():
    print("\n3. Pydantic Schemas")
    print("-" * 40)
    from schemas import (
        HealthResponse, ModelInfoResponse, PredictRequest,
        TranslateRequest, WebcamFrameRequest, PredictionResult,
        TranslateResult, WebcamResult,
    )
    check("HealthResponse", True)
    check("ModelInfoResponse", True)
    check("PredictRequest", True)
    check("TranslateRequest", True)
    check("WebcamFrameRequest", True)
    check("PredictionResult", True)
    check("TranslateResult", True)
    check("WebcamResult", True)


def verify_model_load():
    print("\n4. Model Loading")
    print("-" * 40)
    from config import Settings
    from model_loader import load_model
    s = Settings()
    try:
        bundle = load_model(
            str(s.resolve_checkpoint_path()),
            str(s.resolve_vocab_path()),
            device_str="cpu",
        )
        check("Model loads", True, f"vocab={bundle.vocab_size}, params={bundle.num_parameters:,}")
        check("Vocabulary loaded", bundle.vocab_size > 0, f"size={bundle.vocab_size}")
        check("Config loaded", bundle.config is not None, f"keys={list(bundle.config.keys())}")
    except Exception as e:
        check("Model loads", False, str(e))


def verify_preprocessor():
    print("\n5. Preprocessor")
    print("-" * 40)
    import numpy as np
    from preprocessor import preprocess_pose, create_pose_mask, normalize_landmarks, validate_pose_shape

    pose = [[[float(np.random.randn()) for _ in range(5)] for _ in range(33)] for _ in range(10)]
    tensor = preprocess_pose(pose, max_length=30)
    check("preprocess_pose", tensor.shape == (1, 30, 33, 5), f"shape={tensor.shape}")

    mask = create_pose_mask(tensor)
    check("create_pose_mask", mask.shape == (1, 30), f"shape={mask.shape}")

    arr = np.random.randn(33, 5).astype(np.float32)
    normed = normalize_landmarks(arr)
    check("normalize_landmarks", normed.shape == arr.shape)


def verify_inference():
    print("\n6. Inference Engine")
    print("-" * 40)
    from config import Settings
    from model_loader import load_model
    from inference_engine import InferenceEngine
    s = Settings()
    try:
        bundle = load_model(str(s.resolve_checkpoint_path()), str(s.resolve_vocab_path()), "cpu")
        engine = InferenceEngine(bundle)

        import numpy as np
        pose = [[[float(np.random.randn()) for _ in range(5)] for _ in range(33)] for _ in range(10)]
        result = engine.predict(pose, max_length=10)
        check("predict returns result", "text" in result, f"text='{result['text'][:50]}'")
        check("confidence is float", isinstance(result["confidence"], float))
        check("processing_time_ms", result["processing_time_ms"] > 0, f"{result['processing_time_ms']:.1f}ms")
    except Exception as e:
        check("inference", False, str(e))


def verify_decoder():
    print("\n7. Decoder")
    print("-" * 40)
    from text_decoder import clean_text, decode_prediction, tokens_to_text
    check("clean_text", clean_text("  hello  ") == "Hello")
    raw = {"token_ids": [1, 5, 2], "text": "hello world", "confidence": 0.8, "processing_time_ms": 10.0}
    decoded = decode_prediction(raw)
    check("decode_prediction", decoded["text"] == "Hello world")
    idx2word = {3: "test", 4: "case"}
    text = tokens_to_text([1, 3, 4, 2], idx2word)
    check("tokens_to_text", "Test" in text or "test" in text)


def verify_api():
    print("\n8. API Endpoints")
    print("-" * 40)
    try:
        from fastapi.testclient import TestClient
        import main as main_module
        from model_loader import load_model
        from config import Settings
        from inference_engine import InferenceEngine

        s = Settings()
        main_module.bundle = load_model(
            str(s.resolve_checkpoint_path()), str(s.resolve_vocab_path()), "cpu"
        )
        main_module.engine = InferenceEngine(main_module.bundle)

        client = TestClient(main_module.app)

        resp = client.get("/health")
        check("GET /health", resp.status_code == 200, f"status={resp.status_code}")
        data = resp.json()
        check("health has model_loaded", "model_loaded" in data)
        check("health has uptime_seconds", "uptime_seconds" in data)

        resp = client.get("/model/info")
        check("GET /model/info", resp.status_code == 200, f"status={resp.status_code}")

        import numpy as np
        pose = [[[float(np.random.randn()) for _ in range(5)] for _ in range(33)] for _ in range(5)]
        resp = client.post("/predict", json={"pose_sequence": pose, "max_length": 10})
        check("POST /predict", resp.status_code == 200, f"status={resp.status_code}")

        frame = [[float(np.random.randn()) for _ in range(5)] for _ in range(33)]
        resp = client.post("/translate", json={"frame": {"landmarks": frame}, "max_length": 10})
        check("POST /translate", resp.status_code == 200, f"status={resp.status_code}")

        resp = client.post("/webcam/frame", json={"frame_data": pose, "session_id": "test-1"})
        check("POST /webcam/frame", resp.status_code == 200, f"status={resp.status_code}")

        resp = client.get("/docs")
        check("Swagger docs", resp.status_code == 200)

        resp = client.get("/openapi.json")
        check("OpenAPI spec", resp.status_code == 200)
    except Exception as e:
        check("API endpoints", False, str(e))


def verify_tests():
    print("\n9. Unit Tests")
    print("-" * 40)
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pytest", "apps/ai-service/tests/test_endpoints.py",
             "-v", "--tb=short", "--rootdir=apps/ai-service"],
            capture_output=True, text=True, timeout=120,
            cwd=str(Path(__file__).resolve().parent.parent.parent),
            env={**os.environ, "PYTHONPATH": str(Path(__file__).resolve().parent.parent.parent / "apps" / "ai-service") + ";" + str(Path(__file__).resolve().parent.parent) + ";" + str(Path(__file__).resolve().parent.parent / "models")},
        )
        passed = result.returncode == 0
        lines = [l for l in result.stdout.split("\n") if "PASSED" in l or "FAILED" in l or "passed" in l or "failed" in l]
        detail = "\n".join(lines[-5:]) if lines else result.stdout[-200:]
        check("All tests pass", passed, f"\n{detail}")
    except subprocess.TimeoutExpired:
        check("All tests pass", False, "timeout after 120s")
    except Exception as e:
        check("All tests pass", False, str(e))


def main():
    print("=" * 60)
    print("SIGNBRIDGE AI INFERENCE SERVICE VERIFICATION")
    print("=" * 60)

    verify_files()
    verify_config()
    verify_schemas()
    verify_model_load()
    verify_preprocessor()
    verify_inference()
    verify_decoder()
    verify_api()
    verify_tests()

    passed = sum(1 for _, ok in RESULTS if ok)
    failed = sum(1 for _, ok in RESULTS if not ok)
    total = len(RESULTS)

    print("\n" + "=" * 60)
    print(f"RESULTS: {passed}/{total} passed, {failed} failed")
    print("=" * 60)

    if failed > 0:
        print("\nFailed checks:")
        for name, ok in RESULTS:
            if not ok:
                print(f"  [FAIL] {name}")

    overall = "PASS" if failed == 0 else "FAIL"
    print(f"\nOverall: {overall}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
