"""
Training Engine for SignBridge AI.
Core training loop with forward/backward pass, metric computation, and callback dispatch.
"""
import torch
import torch.nn as nn
import time
from typing import Dict, Any, Optional, List
from training.metrics import MetricsTracker
from training.profiler import Profiler
from training.logger import TrainingLogger
from training.mixed_precision import MixedPrecisionManager
from models.loss import SignBridgeLoss


class TrainingEngine:
    """Core training engine that handles train/val steps."""

    def __init__(
        self,
        model: nn.Module,
        loss_fn: SignBridgeLoss,
        optimizer: torch.optim.Optimizer,
        scheduler=None,
        device: torch.device = None,
        mixed_precision: Optional[MixedPrecisionManager] = None,
        gradient_clip: float = 1.0,
    ):
        self.device = device or torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = model.to(self.device)
        self.loss_fn = loss_fn
        self.optimizer = optimizer
        self.scheduler = scheduler
        self.mixed_precision = mixed_precision or MixedPrecisionManager(enabled=False)
        self.gradient_clip = gradient_clip
        self.metrics = MetricsTracker()
        self.profiler = Profiler()
        self.logger = TrainingLogger()
        self.global_step = 0

    def train_step(self, batch: Dict[str, torch.Tensor]) -> Dict[str, float]:
        self.model.train()
        pose = batch['pose_tensor'].to(self.device)
        input_ids = batch['input_ids'].to(self.device)
        target_ids = batch['target_ids'].to(self.device)
        pose_mask = batch.get('pose_mask')
        if pose_mask is not None:
            pose_mask = pose_mask.to(self.device)

        start = time.time()
        self.optimizer.zero_grad()

        with self.mixed_precision:
            output = self.model(pose, input_ids, pose_mask)
            loss = self.loss_fn(output['logits'], target_ids)

        self.mixed_precision.backward(loss)
        self.mixed_precision.step(self.optimizer)

        grad_norm = 0.0
        for p in self.model.parameters():
            if p.grad is not None:
                grad_norm += p.grad.data.norm(2).item() ** 2
        grad_norm = grad_norm ** 0.5

        if self.gradient_clip > 0:
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), self.gradient_clip)

        if self.scheduler is not None and hasattr(self.scheduler, 'step') and not isinstance(self.scheduler, torch.optim.lr_scheduler.ReduceLROnPlateau):
            self.scheduler.step()

        step_time = time.time() - start
        self.profiler.record_step(step_time)
        self.global_step += 1

        accuracy = self.loss_fn.compute_accuracy(output['logits'], target_ids).item()
        lr = self.optimizer.param_groups[0]['lr']

        return {
            'loss': loss.item(),
            'accuracy': accuracy,
            'learning_rate': lr,
            'gradient_norm': grad_norm,
            'step_time': step_time,
            'perplexity': self.metrics.compute_perplexity(loss.item()),
        }

    @torch.no_grad()
    def validation_step(self, batch: Dict[str, torch.Tensor]) -> Dict[str, float]:
        self.model.eval()
        pose = batch['pose_tensor'].to(self.device)
        input_ids = batch['input_ids'].to(self.device)
        target_ids = batch['target_ids'].to(self.device)
        pose_mask = batch.get('pose_mask')
        if pose_mask is not None:
            pose_mask = pose_mask.to(self.device)

        output = self.model(pose, input_ids, pose_mask)
        loss = self.loss_fn(output['logits'], target_ids)
        accuracy = self.loss_fn.compute_accuracy(output['logits'], target_ids).item()

        return {
            'val_loss': loss.item(),
            'val_accuracy': accuracy,
            'val_perplexity': self.metrics.compute_perplexity(loss.item()),
        }

    def compute_batch_metrics(self, batch: Dict[str, float]) -> Dict[str, float]:
        return batch
