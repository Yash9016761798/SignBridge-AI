"""
Trainer for SignBridge AI.
Orchestrates the complete training lifecycle.
"""
import torch
import torch.nn as nn
from typing import Dict, Any, Optional, List
from training.engine import TrainingEngine
from training.optimizer import OptimizerFactory
from training.scheduler import SchedulerFactory
from training.checkpoint import CheckpointManager
from training.logger import TrainingLogger
from training.metrics import MetricsTracker
from training.callbacks import (
    Callback, CheckpointCallback, EarlyStoppingCallback,
    LearningRateMonitorCallback, ProgressBarCallback, LoggerCallback,
)
from training.early_stopping import EarlyStopping
from training.mixed_precision import MixedPrecisionManager
from training.seed import SeedManager
from training.profiler import Profiler
from training.config import TrainingConfig
from models.loss import SignBridgeLoss


class Trainer:
    """
    Complete training orchestrator for SignBridge AI.

    Usage:
        trainer = Trainer(model, config)
        trainer.fit(train_loader, val_loader)
    """

    def __init__(
        self,
        model: nn.Module,
        config: Optional[TrainingConfig] = None,
        loss_fn: Optional[SignBridgeLoss] = None,
        callbacks: Optional[List[Callback]] = None,
    ):
        self.config = config or TrainingConfig()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        # Reproducibility
        self.seed_manager = SeedManager(self.config.get('seed', 42))
        self.seed_manager.set_seed()

        # Loss
        self.loss_fn = loss_fn or SignBridgeLoss(
            vocab_size=self.config.get('vocab_size', 35000),
            pad_token_id=self.config.get('pad_token_id', 0),
            smoothing=self.config.get('label_smoothing', 0.1),
        )

        # Optimizer
        self.optimizer = OptimizerFactory.create(
            model.parameters(),
            optimizer_type=self.config.get('optimizer', 'adamw'),
            lr=self.config.get('learning_rate', 0.0001),
            weight_decay=self.config.get('weight_decay', 0.0001),
        )

        # Scheduler
        self.scheduler = SchedulerFactory.create(
            self.optimizer,
            scheduler_type=self.config.get('scheduler', 'cosineannealing'),
            T_max=self.config.get('max_epochs', 100),
            epochs=self.config.get('max_epochs', 100),
            steps_per_epoch=self.config.get('steps_per_epoch', 1000),
            max_lr=self.config.get('learning_rate', 0.0001) * 10,
            warmup_steps=self.config.get('warmup_steps', 4000),
            d_model=self.config.get('d_model', 512),
        )

        # Mixed Precision
        self.mp_manager = MixedPrecisionManager(enabled=self.config.get('mixed_precision', False))

        # Engine
        self.engine = TrainingEngine(
            model=model,
            loss_fn=self.loss_fn,
            optimizer=self.optimizer,
            scheduler=self.scheduler,
            device=self.device,
            mixed_precision=self.mp_manager,
            gradient_clip=self.config.get('gradient_clip', 1.0),
        )

        # Checkpoint
        self.checkpoint_manager = CheckpointManager(
            checkpoint_dir=self.config.get('checkpoint_dir', './checkpoints'),
        )

        # Early Stopping
        self.early_stopping = EarlyStopping(
            patience=self.config.get('patience', 10),
            monitor='val_loss',
            mode='min',
        )

        # Callbacks
        self.callbacks = callbacks or self._default_callbacks()

        # State
        self.current_epoch = 0
        self.global_step = 0
        self.should_stop = False
        self.model = model
        self.optimizer = self.optimizer
        self.scheduler = self.scheduler
        self.train_loader = None

    def _default_callbacks(self) -> List[Callback]:
        return [
            CheckpointCallback(self.checkpoint_manager, interval=self.config.get('checkpoint_interval', 1)),
            EarlyStoppingCallback(self.early_stopping),
            LearningRateMonitorCallback(self.engine.logger),
            ProgressBarCallback(),
            LoggerCallback(self.engine.logger),
        ]

    def fit(self, train_loader, val_loader=None, max_epochs: Optional[int] = None) -> Dict[str, Any]:
        epochs = max_epochs or self.config.get('max_epochs', 100)
        self.train_loader = train_loader

        self._dispatch('on_train_begin')

        for epoch in range(self.current_epoch, epochs):
            self.current_epoch = epoch
            self._dispatch('on_epoch_begin', epoch)

            # Train
            train_metrics = self._train_epoch(train_loader, epoch)

            # Validate
            val_metrics = {}
            if val_loader is not None:
                val_metrics = self._validate_epoch(val_loader, epoch)

            # Merge metrics
            all_metrics = {**train_metrics, **val_metrics}

            # Scheduler step for ReduceLROnPlateau
            if self.scheduler is not None and isinstance(self.scheduler, torch.optim.lr_scheduler.ReduceLROnPlateau):
                self.scheduler.step(all_metrics.get('val_loss', all_metrics.get('avg_loss', 0)))

            self._dispatch('on_epoch_end', epoch, all_metrics)

            if self.should_stop:
                break

        self._dispatch('on_train_end')

        return {
            'final_epoch': self.current_epoch,
            'history': dict(self.engine.logger.history),
            'best_val_loss': self.early_stopping.best_score,
        }

    def _train_epoch(self, train_loader, epoch: int) -> Dict[str, float]:
        self.engine.metrics.reset()
        self.engine.profiler.reset()
        self.engine.profiler.start_epoch()

        for batch_idx, batch in enumerate(train_loader):
            self._dispatch('on_batch_begin', batch_idx)
            step_metrics = self.engine.train_step(batch)
            self.engine.metrics.update_batch(
                step_metrics['loss'], step_metrics['learning_rate'],
                step_metrics['gradient_norm'], step_metrics['accuracy'],
            )
            self._dispatch('on_batch_end', batch_idx, step_metrics['loss'])

        self.engine.profiler.end_epoch(len(train_loader.dataset))
        epoch_metrics = self.engine.metrics.get_epoch_metrics()
        epoch_metrics['epoch_duration'] = self.engine.profiler.get_epoch_stats()['epoch_duration']
        epoch_metrics['throughput'] = self.engine.profiler.get_epoch_stats()['throughput_samples_per_sec']
        return epoch_metrics

    @torch.no_grad()
    def _validate_epoch(self, val_loader, epoch: int) -> Dict[str, float]:
        val_losses = []
        val_accs = []

        for batch in val_loader:
            step_metrics = self.engine.validation_step(batch)
            val_losses.append(step_metrics['val_loss'])
            val_accs.append(step_metrics['val_accuracy'])

        return {
            'val_loss': sum(val_losses) / len(val_losses) if val_losses else 0,
            'val_accuracy': sum(val_accs) / len(val_accs) if val_accs else 0,
        }

    def _dispatch(self, event: str, *args, **kwargs) -> None:
        for cb in self.callbacks:
            getattr(cb, event)(self, *args, **kwargs)

    def save_checkpoint(self, filepath: str) -> None:
        self.checkpoint_manager.save_epoch(
            self.model, self.optimizer, self.scheduler,
            self.current_epoch, {}, self.config.to_dict(),
        )

    def load_checkpoint(self, filepath: str) -> Dict[str, Any]:
        state = self.checkpoint_manager.load(filepath)
        self.model.load_state_dict(state['model_state_dict'])
        self.optimizer.load_state_dict(state['optimizer_state_dict'])
        if 'scheduler_state_dict' in state and self.scheduler is not None:
            self.scheduler.load_state_dict(state['scheduler_state_dict'])
        self.current_epoch = state.get('epoch', 0)
        return state

    def resume_training(self, filepath: str, train_loader, val_loader=None) -> Dict[str, Any]:
        self.load_checkpoint(filepath)
        return self.fit(train_loader, val_loader, max_epochs=self.config.get('max_epochs', 100))
