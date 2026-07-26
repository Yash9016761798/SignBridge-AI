"""
Profiler for SignBridge AI.
Measures epoch duration, step duration, memory usage, and throughput.
"""
import time
import torch
from typing import Dict, Any, Optional
from collections import defaultdict


class Profiler:
    """Measures training performance metrics."""

    def __init__(self):
        self.reset()

    def reset(self) -> None:
        self._step_times = []
        self._epoch_start = 0
        self._epoch_end = 0
        self._samples_processed = 0
        self._start_time = time.time()

    def start_epoch(self) -> None:
        self._epoch_start = time.time()

    def end_epoch(self, num_samples: int) -> None:
        self._epoch_end = time.time()
        self._samples_processed = num_samples

    def record_step(self, step_time: float) -> None:
        self._step_times.append(step_time)

    def get_epoch_stats(self) -> Dict[str, Any]:
        epoch_duration = self._epoch_end - self._epoch_start
        avg_step = sum(self._step_times) / len(self._step_times) if self._step_times else 0
        throughput = self._samples_processed / epoch_duration if epoch_duration > 0 else 0
        return {
            'epoch_duration': epoch_duration,
            'avg_step_duration': avg_step,
            'total_steps': len(self._step_times),
            'throughput_samples_per_sec': throughput,
        }

    def get_memory_stats(self) -> Dict[str, float]:
        if not torch.cuda.is_available():
            return {'gpu_available': False}
        return {
            'gpu_available': True,
            'gpu_allocated_mb': torch.cuda.memory_allocated() / 1024**2,
            'gpu_cached_mb': torch.cuda.memory_reserved() / 1024**2,
            'gpu_max_allocated_mb': torch.cuda.max_memory_allocated() / 1024**2,
        }

    def get_summary(self) -> Dict[str, Any]:
        total_time = time.time() - self._start_time
        return {
            'total_time': total_time,
            'total_steps': len(self._step_times),
            'avg_step_time': sum(self._step_times) / len(self._step_times) if self._step_times else 0,
            'memory': self.get_memory_stats(),
        }
