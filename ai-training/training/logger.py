"""
Logger for SignBridge AI.
Tracks training metrics, learning rate, GPU memory, and parameter counts.
"""
import json
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from collections import defaultdict


class TrainingLogger:
    """Logs training metrics to file and console."""

    def __init__(self, log_dir: str = './logs', log_interval: int = 10):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.log_interval = log_interval
        self.history = defaultdict(list)
        self.start_time = time.time()

    def log_scalar(self, name: str, value: float, step: int) -> None:
        self.history[name].append({'step': step, 'value': value})

    def log_epoch(self, epoch: int, metrics: Dict[str, float]) -> None:
        for k, v in metrics.items():
            self.history[k].append({'epoch': epoch, 'value': v})

    def log_batch(self, batch_idx: int, loss: float, lr: float, epoch: int) -> None:
        if batch_idx % self.log_interval == 0:
            self.history['train_loss'].append({'epoch': epoch, 'batch': batch_idx, 'value': loss})
            self.history['learning_rate'].append({'epoch': epoch, 'batch': batch_idx, 'value': lr})

    def log_gpu_memory(self, epoch: int) -> Dict[str, float]:
        import torch
        if not torch.cuda.is_available():
            return {}
        mem = {
            'gpu_memory_allocated_mb': torch.cuda.memory_allocated() / 1024**2,
            'gpu_memory_cached_mb': torch.cuda.memory_reserved() / 1024**2,
            'gpu_memory_max_mb': torch.cuda.max_memory_allocated() / 1024**2,
        }
        for k, v in mem.items():
            self.history[k].append({'epoch': epoch, 'value': v})
        return mem

    def log_gradient_norm(self, model, epoch: int, step: int) -> float:
        total_norm = 0.0
        for p in model.parameters():
            if p.grad is not None:
                total_norm += p.grad.data.norm(2).item() ** 2
        total_norm = total_norm ** 0.5
        self.history['gradient_norm'].append({'epoch': epoch, 'step': step, 'value': total_norm})
        return total_norm

    def log_parameter_count(self, model) -> Dict[str, int]:
        total = sum(p.numel() for p in model.parameters())
        trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
        info = {'total_params': total, 'trainable_params': trainable, 'frozen_params': total - trainable}
        self.history['parameter_count'] = info
        return info

    def get_summary(self) -> Dict[str, Any]:
        elapsed = time.time() - self.start_time
        return {
            'elapsed_seconds': elapsed,
            'logged_metrics': list(self.history.keys()),
            'total_entries': sum(len(v) if isinstance(v, list) else 1 for v in self.history.values()),
        }

    def save(self, filename: str = 'training_log.json') -> str:
        path = self.log_dir / filename
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(dict(self.history), f, indent=2, default=str)
        return str(path)

    def reset(self) -> None:
        self.history.clear()
        self.start_time = time.time()
