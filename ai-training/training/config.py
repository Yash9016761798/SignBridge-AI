"""
Configuration loader for SignBridge AI training engine.
Loads and validates YAML configuration files.
"""
import yaml
from pathlib import Path
from typing import Dict, Any, Optional


class TrainingConfig:
    """Loads and validates training configuration."""

    DEFAULTS = {
        'batch_size': 16,
        'max_epochs': 100,
        'learning_rate': 0.0001,
        'weight_decay': 0.0001,
        'optimizer': 'adamw',
        'scheduler': 'cosineannealing',
        'gradient_clip': 1.0,
        'mixed_precision': False,
        'checkpoint_interval': 1,
        'log_interval': 10,
        'seed': 42,
        'patience': 10,
        'label_smoothing': 0.1,
        'warmup_steps': 4000,
        'save_dir': './experiments',
        'checkpoint_dir': './checkpoints',
        'log_dir': './logs',
    }

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = {**self.DEFAULTS}
        if config:
            self.config.update(config)

    @classmethod
    def from_yaml(cls, filepath: str) -> 'TrainingConfig':
        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError(f'Config file not found: {filepath}')
        with open(path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f) or {}
        flat = {}
        for section in data.values():
            if isinstance(section, dict):
                flat.update(section)
        return cls(flat)

    def get(self, key: str, default=None):
        return self.config.get(key, default)

    def __getitem__(self, key):
        return self.config[key]

    def __setitem__(self, key, value):
        self.config[key] = value

    def to_dict(self) -> Dict[str, Any]:
        return self.config.copy()

    def __repr__(self) -> str:
        return f'TrainingConfig({self.config})'
