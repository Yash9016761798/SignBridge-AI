"""
Reproducibility utilities for SignBridge AI.
Ensures deterministic training across runs.
"""
import os
import random
import numpy as np
import torch
from typing import Optional


class SeedManager:
    """Manages random seeds for reproducibility."""

    def __init__(self, seed: int = 42, cuda_deterministic: bool = True):
        self.seed = seed
        self.cuda_deterministic = cuda_deterministic

    def set_seed(self) -> None:
        random.seed(self.seed)
        np.random.seed(self.seed)
        torch.manual_seed(self.seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed(self.seed)
            torch.cuda.manual_seed_all(self.seed)
        os.environ['PYTHONHASHSEED'] = str(self.seed)
        if self.cuda_deterministic:
            torch.backends.cudnn.deterministic = True
            torch.backends.cudnn.benchmark = False
            torch.use_deterministic_algorithms(True)

    def get_state(self) -> dict:
        return {
            'seed': self.seed,
            'random_state': random.getstate(),
            'numpy_state': np.random.get_state(),
            'torch_state': torch.random.get_rng_state(),
            'cuda_states': (
                [torch.cuda.get_rng_state(i) for i in range(torch.cuda.device_count())]
                if torch.cuda.is_available() else []
            ),
        }

    def set_state(self, state: dict) -> None:
        random.setstate(state['random_state'])
        np.random.set_state(state['numpy_state'])
        torch.random.set_rng_state(state['torch_state'])
        if torch.cuda.is_available() and state['cuda_states']:
            for i, s in enumerate(state['cuda_states']):
                torch.cuda.set_rng_state(s, i)

    def __repr__(self) -> str:
        return f'SeedManager(seed={self.seed}, deterministic={self.cuda_deterministic})'
