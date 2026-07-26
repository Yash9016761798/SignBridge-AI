"""
Configuration for SignBridge AI Inference Service.
Loads settings from environment variables with sensible defaults.
"""
import os
from pathlib import Path
from dataclasses import dataclass, field


@dataclass
class Settings:
    """Application settings loaded from environment variables."""

    APP_NAME: str = "SignBridge AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    MODEL_CHECKPOINT_PATH: str = "experiments/representative/checkpoints/best.pt"
    VOCAB_PATH: str = "experiments/representative/vocabulary.json"
    MODEL_VERSION: str = "1.0.0"

    NUM_LANDMARKS: int = 33
    NUM_FEATURES: int = 5
    MAX_SEQ_LENGTH: int = 30
    MAX_GENERATION_LENGTH: int = 30
    NUM_BEAMS: int = 1
    TEMPERATURE: float = 1.0

    CORS_ORIGINS: str = "http://localhost:3000"
    MAX_BATCH_SIZE: int = 32
    REQUEST_TIMEOUT: float = 30.0
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 10

    @classmethod
    def from_env(cls) -> 'Settings':
        return cls(
            APP_NAME=os.getenv("SIGNBRIDGE_APP_NAME", cls.APP_NAME),
            APP_VERSION=os.getenv("SIGNBRIDGE_APP_VERSION", cls.APP_VERSION),
            DEBUG=os.getenv("SIGNBRIDGE_DEBUG", "false").lower() in ("true", "1", "yes"),
            HOST=os.getenv("SIGNBRIDGE_HOST", cls.HOST),
            PORT=int(os.getenv("SIGNBRIDGE_PORT", str(cls.PORT))),
            LOG_LEVEL=os.getenv("SIGNBRIDGE_LOG_LEVEL", cls.LOG_LEVEL),
            MODEL_CHECKPOINT_PATH=os.getenv("SIGNBRIDGE_MODEL_CHECKPOINT", cls.MODEL_CHECKPOINT_PATH),
            VOCAB_PATH=os.getenv("SIGNBRIDGE_VOCAB_PATH", cls.VOCAB_PATH),
            MODEL_VERSION=os.getenv("SIGNBRIDGE_MODEL_VERSION", cls.MODEL_VERSION),
            NUM_LANDMARKS=int(os.getenv("SIGNBRIDGE_NUM_LANDMARKS", str(cls.NUM_LANDMARKS))),
            NUM_FEATURES=int(os.getenv("SIGNBRIDGE_NUM_FEATURES", str(cls.NUM_FEATURES))),
            MAX_SEQ_LENGTH=int(os.getenv("SIGNBRIDGE_MAX_SEQ_LENGTH", str(cls.MAX_SEQ_LENGTH))),
            MAX_GENERATION_LENGTH=int(os.getenv("SIGNBRIDGE_MAX_GEN_LENGTH", str(cls.MAX_GENERATION_LENGTH))),
            CORS_ORIGINS=os.getenv("SIGNBRIDGE_CORS_ORIGINS", cls.CORS_ORIGINS),
            MAX_BATCH_SIZE=int(os.getenv("SIGNBRIDGE_MAX_BATCH_SIZE", str(cls.MAX_BATCH_SIZE))),
            REQUEST_TIMEOUT=float(os.getenv("SIGNBRIDGE_REQUEST_TIMEOUT", str(cls.REQUEST_TIMEOUT))),
            RATE_LIMIT_PER_MINUTE=int(os.getenv("SIGNBRIDGE_RATE_LIMIT_PER_MINUTE", str(cls.RATE_LIMIT_PER_MINUTE))),
            RATE_LIMIT_BURST=int(os.getenv("SIGNBRIDGE_RATE_LIMIT_BURST", str(cls.RATE_LIMIT_BURST))),
        )

    def resolve_checkpoint_path(self) -> Path:
        p = Path(self.MODEL_CHECKPOINT_PATH)
        if not p.is_absolute():
            candidate = Path(__file__).resolve().parent.parent.parent / "ai-training" / p
            if candidate.exists():
                return candidate
            candidate2 = Path(__file__).resolve().parent.parent.parent / p
            if candidate2.exists():
                return candidate2
            return Path(__file__).resolve().parent.parent.parent / "ai-training" / p
        return p

    def resolve_vocab_path(self) -> Path:
        p = Path(self.VOCAB_PATH)
        if not p.is_absolute():
            candidate = Path(__file__).resolve().parent.parent.parent / "ai-training" / p
            if candidate.exists():
                return candidate
            candidate2 = Path(__file__).resolve().parent.parent.parent / p
            if candidate2.exists():
                return candidate2
            return Path(__file__).resolve().parent.parent.parent / "ai-training" / p
        return p
