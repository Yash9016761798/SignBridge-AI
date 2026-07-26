"""
Early Stopping for SignBridge AI.
Monitors validation loss and stops training when no improvement.
"""
import torch
from pathlib import Path
from typing import Optional, Dict, Any


class EarlyStopping:
    """Early stopping to prevent overfitting."""

    def __init__(
        self,
        patience: int = 10,
        min_delta: float = 0.001,
        monitor: str = 'val_loss',
        mode: str = 'min',
        restore_best: bool = True,
    ):
        self.patience = patience
        self.min_delta = min_delta
        self.monitor = monitor
        self.mode = mode
        self.restore_best = restore_best
        self.counter = 0
        self.best_score = None
        self.best_state = None
        self.should_stop = False

    def __call__(self, score: float, model: torch.nn.Module) -> bool:
        if self.best_score is None:
            self.best_score = score
            if self.restore_best:
                self.best_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}
            return False

        improved = (score < self.best_score - self.min_delta) if self.mode == 'min' \
            else (score > self.best_score + self.min_delta)

        if improved:
            self.best_score = score
            self.counter = 0
            if self.restore_best:
                self.best_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.should_stop = True
                return True
        return False

    def restore(self, model: torch.nn.Module) -> None:
        if self.best_state is not None:
            model.load_state_dict(self.best_state)

    def get_state(self) -> Dict[str, Any]:
        return {
            'patience': self.patience,
            'min_delta': self.min_delta,
            'monitor': self.monitor,
            'mode': self.mode,
            'counter': self.counter,
            'best_score': self.best_score,
            'should_stop': self.should_stop,
        }
