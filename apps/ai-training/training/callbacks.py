"""
Callbacks for SignBridge AI training engine.
Checkpoint, EarlyStopping, LearningRateMonitor, ProgressBar, Logger.
"""
import time
import sys
from typing import Dict, Any, Optional, List
from training.checkpoint import CheckpointManager
from training.early_stopping import EarlyStopping
from training.logger import TrainingLogger


class Callback:
    def on_train_begin(self, trainer) -> None: pass
    def on_train_end(self, trainer) -> None: pass
    def on_epoch_begin(self, trainer, epoch: int) -> None: pass
    def on_epoch_end(self, trainer, epoch: int, metrics: Dict[str, float]) -> None: pass
    def on_batch_begin(self, trainer, batch_idx: int) -> None: pass
    def on_batch_end(self, trainer, batch_idx: int, loss: float) -> None: None


class CheckpointCallback(Callback):
    def __init__(self, checkpoint_manager: CheckpointManager, interval: int = 1, save_best: bool = True):
        self.manager = checkpoint_manager
        self.interval = interval
        self.save_best = save_best
        self.best_val_loss = float('inf')

    def on_epoch_end(self, trainer, epoch: int, metrics: Dict[str, float]) -> None:
        if epoch % self.interval == 0:
            self.manager.save_epoch(
                trainer.model, trainer.optimizer, trainer.scheduler,
                epoch, metrics, getattr(trainer, 'config', None),
            )
        val_loss = metrics.get('val_loss', float('inf'))
        if self.save_best and val_loss < self.best_val_loss:
            self.best_val_loss = val_loss
            self.manager.save_epoch(
                trainer.model, trainer.optimizer, trainer.scheduler,
                epoch, metrics, getattr(trainer, 'config', None),
            )
            self.manager.save(
                trainer.model.state_dict(), 'signbridge_best.pt', is_best=True,
            )


class EarlyStoppingCallback(Callback):
    def __init__(self, early_stopping: EarlyStopping):
        self.early_stopping = early_stopping

    def on_epoch_end(self, trainer, epoch: int, metrics: Dict[str, float]) -> None:
        score = metrics.get('val_loss', metrics.get('val_accuracy', 0))
        if self.early_stopping(score, trainer.model):
            trainer.should_stop = True

    def on_train_end(self, trainer) -> None:
        self.early_stopping.restore(trainer.model)


class LearningRateMonitorCallback(Callback):
    def __init__(self, logger: TrainingLogger):
        self.logger = logger

    def on_batch_end(self, trainer, batch_idx: int, loss: float) -> None:
        lr = trainer.optimizer.param_groups[0]['lr']
        self.logger.log_scalar('learning_rate', lr, trainer.global_step)


class ProgressBarCallback(Callback):
    def __init__(self):
        self.epoch_start_time = 0

    def on_epoch_begin(self, trainer, epoch: int) -> None:
        self.epoch_start_time = time.time()
        total = len(trainer.train_loader) if hasattr(trainer, 'train_loader') else 0
        sys.stdout.write(f'\rEpoch {epoch}: [{total}/{total}]')

    def on_batch_end(self, trainer, batch_idx: int, loss: float) -> None:
        total = len(trainer.train_loader) if hasattr(trainer, 'train_loader') else 0
        pct = (batch_idx + 1) / total * 100 if total > 0 else 0
        elapsed = time.time() - self.epoch_start_time
        speed = (batch_idx + 1) / elapsed if elapsed > 0 else 0
        sys.stdout.write(f'\rEpoch {trainer.current_epoch}: [{batch_idx+1}/{total}] {pct:.1f}% loss={loss:.4f} speed={speed:.1f} batch/s')
        sys.stdout.flush()

    def on_epoch_end(self, trainer, epoch: int, metrics: Dict[str, float]) -> None:
        elapsed = time.time() - self.epoch_start_time
        val_loss = metrics.get('val_loss', 'N/A')
        sys.stdout.write(f'\rEpoch {epoch}: train_loss={metrics.get("avg_loss", "N/A"):.4f} val_loss={val_loss:.4f if isinstance(val_loss, float) else val_loss} time={elapsed:.1f}s\n')
        sys.stdout.flush()


class LoggerCallback(Callback):
    def __init__(self, logger: TrainingLogger):
        self.logger = logger

    def on_epoch_end(self, trainer, epoch: int, metrics: Dict[str, float]) -> None:
        self.logger.log_epoch(epoch, metrics)
        self.logger.log_gpu_memory(epoch)
        self.logger.save()
