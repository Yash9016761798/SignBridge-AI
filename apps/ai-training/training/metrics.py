"""
Metrics tracker for SignBridge AI.
Training: Loss, Token Accuracy, Perplexity, Gradient Norm, Learning Rate.
Validation: BLEU, WER, CER, ROUGE placeholders.
"""
import math
import numpy as np
from typing import Dict, Any, List, Optional
from collections import defaultdict


class MetricsTracker:
    """Tracks and computes training/validation metrics."""

    def __init__(self):
        self.reset()

    def reset(self) -> None:
        self._data = defaultdict(list)

    def update(self, key: str, value: float) -> None:
        self._data[key].append(value)

    def update_batch(self, loss: float, lr: float, grad_norm: float, accuracy: float) -> None:
        self._data['loss'].append(loss)
        self._data['learning_rate'].append(lr)
        self._data['gradient_norm'].append(grad_norm)
        self._data['accuracy'].append(accuracy)

    def compute_perplexity(self, loss: float) -> float:
        return math.exp(min(loss, 20))

    def compute_bleu(self, predictions: List[str], references: List[str]) -> float:
        return 0.0

    def compute_wer(self, predictions: List[str], references: List[str]) -> float:
        return 0.0

    def compute_cer(self, predictions: List[str], references: List[str]) -> float:
        return 0.0

    def compute_rouge(self, predictions: List[str], references: List[str]) -> Dict[str, float]:
        return {'rouge-1': 0.0, 'rouge-2': 0.0, 'rouge-l': 0.0}

    def get_epoch_metrics(self) -> Dict[str, float]:
        metrics = {}
        for k, v in self._data.items():
            if isinstance(v, list) and len(v) > 0:
                metrics[f'avg_{k}'] = sum(v) / len(v)
                if k == 'loss':
                    metrics['perplexity'] = self.compute_perplexity(metrics[f'avg_{k}'])
            elif isinstance(v, dict):
                metrics.update(v)
        return metrics

    def get_recent(self, n: int = 10) -> Dict[str, float]:
        return {k: v[-n:] if isinstance(v, list) else v for k, v in self._data.items()}

    def __repr__(self) -> str:
        keys = list(self._data.keys())
        return f'MetricsTracker({len(keys)} metrics: {keys})'
