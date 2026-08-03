"""
Utility functions for SignBridge AI Training workspace.

This module provides shared helpers for configuration loading, device detection,
reproducibility, and file operations.
"""

import os
import random
import logging
from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np
import yaml
import torch

logger = logging.getLogger(__name__)

# =============================================================================
# PATHS
# =============================================================================

PROJECT_ROOT = Path(__file__).parent.parent
CONFIGS_DIR = PROJECT_ROOT / "configs"
DATASETS_DIR = PROJECT_ROOT / "datasets"
MODELS_DIR = PROJECT_ROOT / "models"
EXPERIMENTS_DIR = PROJECT_ROOT / "experiments"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"


def get_project_root() -> Path:
    """Return the ai-training root directory."""
    return PROJECT_ROOT


# =============================================================================
# CONFIGURATION
# =============================================================================

def load_config(config_name: str) -> Dict[str, Any]:
    """Load a YAML configuration file from configs/ directory.

    Args:
        config_name: Name of config file (e.g., "dataset", "training", "model").
                     Automatically appends .yaml if missing.

    Returns:
        Parsed configuration dictionary.
    """
    if not config_name.endswith(".yaml"):
        config_name += ".yaml"

    config_path = CONFIGS_DIR / config_name
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    logger.info(f"Loaded config: {config_path}")
    return config


def merge_configs(base: Dict, override: Dict) -> Dict:
    """Deep merge two configuration dictionaries.

    Values in override take precedence over base.
    """
    result = base.copy()
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_configs(result[key], value)
        else:
            result[key] = value
    return result


# =============================================================================
# REPRODUCIBILITY
# =============================================================================

def set_seed(seed: int = 42) -> None:
    """Set random seed for reproducibility across all libraries.

    Args:
        seed: Random seed value.
    """
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

    os.environ["PYTHONHASHSEED"] = str(seed)
    logger.info(f"Random seed set to {seed}")


# =============================================================================
# DEVICE
# =============================================================================

def get_device(device_type: str = "auto") -> torch.device:
    """Determine the best available compute device.

    Args:
        device_type: "auto", "cuda", "cpu", or "mps".

    Returns:
        torch.device instance.
    """
    if device_type == "auto":
        if torch.cuda.is_available():
            device = torch.device("cuda")
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            device = torch.device("mps")
        else:
            device = torch.device("cpu")
    else:
        device = torch.device(device_type)

    logger.info(f"Using device: {device}")
    if device.type == "cuda":
        logger.info(f"GPU: {torch.cuda.get_device_name(0)}")
        logger.info(f"Memory: {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} GB")

    return device


# =============================================================================
# FILE OPERATIONS
# =============================================================================

def ensure_dir(path: Path) -> Path:
    """Create directory if it doesn't exist.

    Args:
        path: Directory path to create.

    Returns:
        The same path.
    """
    path.mkdir(parents=True, exist_ok=True)
    return path


def count_files(directory: Path, extensions: Optional[list] = None) -> int:
    """Count files in a directory, optionally filtered by extension.

    Args:
        directory: Directory to count files in.
        extensions: List of file extensions to filter (e.g., [".mp4", ".avi"]).

    Returns:
        Number of matching files.
    """
    if not directory.exists():
        return 0

    if extensions is None:
        return sum(1 for f in directory.iterdir() if f.is_file())

    return sum(
        1 for f in directory.iterdir()
        if f.is_file() and f.suffix.lower() in extensions
    )


# =============================================================================
# LOGGING
# =============================================================================

def setup_logging(level: str = "INFO", log_file: Optional[str] = None) -> None:
    """Configure logging for training scripts.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR).
        log_file: Optional file path to write logs to.
    """
    handlers = [logging.StreamHandler()]

    if log_file:
        ensure_dir(Path(log_file).parent)
        handlers.append(logging.FileHandler(log_file))

    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=handlers,
    )


# =============================================================================
# DATASET HELPERS
# =============================================================================

def resolve_dataset_path(config: Dict) -> Path:
    """Resolve dataset path from configuration.

    Supports:
    - Local path
    - Google Drive mount
    - HuggingFace (returns None, use streaming)

    Args:
        config: Dataset configuration dictionary.

    Returns:
        Path to dataset directory, or None for HuggingFace streaming.
    """
    source_type = config["source"]["type"]

    if source_type == "huggingface":
        logger.info("Dataset source: HuggingFace streaming (no local path)")
        return None

    if source_type == "local":
        path = Path(config["source"]["local"]["root_dir"])
        if not path.is_absolute():
            path = PROJECT_ROOT / path
        logger.info(f"Dataset source: local at {path}")
        return path

    if source_type == "gdrive":
        mount_point = Path(config["source"]["gdrive"]["mount_point"])
        logger.info(f"Dataset source: Google Drive at {mount_point}")
        return mount_point

    raise ValueError(f"Unknown dataset source type: {source_type}")


def get_huggingface_dataset(config: Dict):
    """Load dataset from HuggingFace Hub.

    Args:
        config: Dataset configuration dictionary.

    Returns:
        HuggingFace Dataset object (streaming or cached).
    """
    from datasets import load_dataset

    hf_config = config["source"]["huggingface"]
    dataset = load_dataset(
        hf_config["repo_id"],
        split=hf_config.get("split", "train"),
        streaming=hf_config.get("streaming", True),
        trust_remote_code=hf_config.get("trust_remote_code", True),
    )

    logger.info(f"Loaded HuggingFace dataset: {hf_config['repo_id']}")
    return dataset
