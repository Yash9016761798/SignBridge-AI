"""
Model Training Script for SignBridge AI Training.

This script provides the training loop infrastructure for ISL gesture recognition.
Models are NOT built here — this only provides the training framework.

DO NOT run training automatically — this is infrastructure only.
"""

import sys
import time
import logging
from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np
import torch

sys.path.insert(0, str(Path(__file__).parent))

from utils import (
    load_config,
    get_project_root,
    get_device,
    set_seed,
    ensure_dir,
    setup_logging,
)

logger = logging.getLogger(__name__)


# =============================================================================
# TRAINING METRICS
# =============================================================================

class MetricsTracker:
    """Track training and validation metrics across epochs."""

    def __init__(self):
        self.history = {
            "train_loss": [],
            "train_accuracy": [],
            "val_loss": [],
            "val_accuracy": [],
            "learning_rate": [],
            "epoch_time": [],
        }
        self.best_val_accuracy = 0.0
        self.best_epoch = 0

    def update(self, epoch: int, metrics: Dict[str, float]) -> None:
        """Update metrics for an epoch."""
        for key, value in metrics.items():
            if key in self.history:
                self.history[key].append(value)

        val_acc = metrics.get("val_accuracy", 0.0)
        if val_acc > self.best_val_accuracy:
            self.best_val_accuracy = val_acc
            self.best_epoch = epoch

    def summary(self) -> Dict[str, Any]:
        """Return training summary."""
        return {
            "best_val_accuracy": self.best_val_accuracy,
            "best_epoch": self.best_epoch,
            "total_epochs": len(self.history["train_loss"]),
            "final_train_loss": self.history["train_loss"][-1] if self.history["train_loss"] else 0,
            "final_val_loss": self.history["val_loss"][-1] if self.history["val_loss"] else 0,
        }


# =============================================================================
# CHECKPOINTING
# =============================================================================

def save_checkpoint(
    model,
    optimizer,
    epoch: int,
    metrics: Dict[str, float],
    checkpoint_dir: str,
    filename: str = "checkpoint.pt",
) -> Path:
    """Save model checkpoint.

    Args:
        model: PyTorch model.
        optimizer: PyTorch optimizer.
        epoch: Current epoch number.
        metrics: Current metrics.
        checkpoint_dir: Directory to save checkpoint.
        filename: Checkpoint filename.

    Returns:
        Path to saved checkpoint.
    """
    import torch

    checkpoint_path = ensure_dir(Path(checkpoint_dir)) / filename
    torch.save({
        "epoch": epoch,
        "model_state_dict": model.state_dict(),
        "optimizer_state_dict": optimizer.state_dict(),
        "metrics": metrics,
    }, checkpoint_path)

    logger.info(f"Checkpoint saved: {checkpoint_path}")
    return checkpoint_path


def load_checkpoint(checkpoint_path: str, model, optimizer=None):
    """Load model checkpoint.

    Args:
        checkpoint_path: Path to checkpoint file.
        model: PyTorch model to load weights into.
        optimizer: Optional optimizer to restore state.

    Returns:
        Tuple of (epoch, metrics).
    """
    import torch

    checkpoint = torch.load(checkpoint_path, map_location="cpu")
    model.load_state_dict(checkpoint["model_state_dict"])

    if optimizer and "optimizer_state_dict" in checkpoint:
        optimizer.load_state_dict(checkpoint["optimizer_state_dict"])

    epoch = checkpoint.get("epoch", 0)
    metrics = checkpoint.get("metrics", {})

    logger.info(f"Checkpoint loaded: {checkpoint_path} (epoch {epoch})")
    return epoch, metrics


# =============================================================================
# TRAINING LOOP
# =============================================================================

class Trainer:
    """Training loop infrastructure for gesture recognition models.

    This class provides the training framework. The actual model forward pass
    and loss computation must be provided by the user.
    """

    def __init__(self, config: Dict):
        """Initialize trainer with configuration.

        Args:
            config: Training configuration dictionary.
        """
        self.config = config
        self.device = get_device(config.get("device", {}).get("type", "auto"))
        self.metrics = MetricsTracker()
        self.checkpoint_dir = ensure_dir(
            Path(config.get("general", {}).get("checkpoint_dir", "./models/checkpoints"))
        )

    def train_epoch(self, model, train_loader, optimizer, criterion, epoch: int) -> Dict[str, float]:
        """Run one training epoch.

        Args:
            model: PyTorch model.
            train_loader: Training data loader.
            optimizer: PyTorch optimizer.
            criterion: Loss function.
            epoch: Current epoch number.

        Returns:
            Dictionary of training metrics.
        """
        import torch

        model.train()
        total_loss = 0.0
        correct = 0
        total = 0

        for batch_idx, (data, targets) in enumerate(train_loader):
            data, targets = data.to(self.device), targets.to(self.device)

            optimizer.zero_grad()
            outputs = model(data)
            loss = criterion(outputs, targets)
            loss.backward()

            # Gradient clipping
            grad_norm = self.config.get("training", {}).get("gradient_clip_norm", 1.0)
            if grad_norm > 0:
                torch.nn.utils.clip_grad_norm_(model.parameters(), grad_norm)

            optimizer.step()

            total_loss += loss.item()
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()

        return {
            "train_loss": total_loss / len(train_loader),
            "train_accuracy": correct / total,
        }

    @torch.no_grad()
    def validate(self, model, val_loader, criterion) -> Dict[str, float]:
        """Run validation.

        Args:
            model: PyTorch model.
            val_loader: Validation data loader.
            criterion: Loss function.

        Returns:
            Dictionary of validation metrics.
        """
        import torch

        model.eval()
        total_loss = 0.0
        correct = 0
        total = 0

        for data, targets in val_loader:
            data, targets = data.to(self.device), targets.to(self.device)
            outputs = model(data)
            loss = criterion(outputs, targets)

            total_loss += loss.item()
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()

        return {
            "val_loss": total_loss / max(len(val_loader), 1),
            "val_accuracy": correct / max(total, 1),
        }

    def train(self, model, train_loader, val_loader, criterion, optimizer, scheduler=None):
        """Run full training loop.

        Args:
            model: PyTorch model.
            train_loader: Training data loader.
            val_loader: Validation data loader.
            criterion: Loss function.
            optimizer: PyTorch optimizer.
            scheduler: Optional learning rate scheduler.
        """
        epochs = self.config.get("training", {}).get("epochs", 50)
        save_every = self.config.get("general", {}).get("save_every_n_epochs", 5)

        logger.info(f"Starting training for {epochs} epochs")
        logger.info(f"Device: {self.device}")
        logger.info(f"Checkpoint dir: {self.checkpoint_dir}")

        model = model.to(self.device)

        for epoch in range(epochs):
            start_time = time.time()

            # Training
            train_metrics = self.train_epoch(model, train_loader, optimizer, criterion, epoch)

            # Validation
            val_metrics = self.validate(model, val_loader, criterion)

            # Scheduler step
            if scheduler:
                if hasattr(scheduler, "step"):
                    if isinstance(scheduler, torch.optim.lr_scheduler.ReduceLROnPlateau):
                        scheduler.step(val_metrics["val_loss"])
                    else:
                        scheduler.step()

            # Track metrics
            all_metrics = {**train_metrics, **val_metrics}
            all_metrics["learning_rate"] = optimizer.param_groups[0]["lr"]
            all_metrics["epoch_time"] = time.time() - start_time
            self.metrics.update(epoch, all_metrics)

            # Log
            logger.info(
                f"Epoch {epoch+1}/{epochs} | "
                f"Train Loss: {train_metrics['train_loss']:.4f} | "
                f"Train Acc: {train_metrics['train_accuracy']:.4f} | "
                f"Val Loss: {val_metrics['val_loss']:.4f} | "
                f"Val Acc: {val_metrics['val_accuracy']:.4f} | "
                f"Time: {all_metrics['epoch_time']:.1f}s"
            )

            # Checkpointing
            if (epoch + 1) % save_every == 0:
                save_checkpoint(
                    model, optimizer, epoch + 1, all_metrics,
                    str(self.checkpoint_dir), f"checkpoint_epoch_{epoch+1}.pt",
                )

        # Save best
        save_checkpoint(
            model, optimizer, self.metrics.best_epoch, {},
            str(self.checkpoint_dir), "best_model.pt",
        )

        logger.info(f"Training complete. Best val accuracy: {self.metrics.best_val_accuracy:.4f}")


# =============================================================================
# MAIN
# =============================================================================

def main():
    """Training entry point (infrastructure only — no model is trained)."""
    setup_logging(level="INFO")

    config = load_config("training")
    set_seed(config.get("general", {}).get("seed", 42))

    logger.info("Training infrastructure ready")
    logger.info(f"Epochs: {config.get('training', {}).get('epochs', 50)}")
    logger.info(f"Batch size: {config.get('dataloader', {}).get('batch_size', 32)}")
    logger.info(f"Learning rate: {config.get('optimizer', {}).get('learning_rate', 0.001)}")
    logger.info("Use notebook 04_model_training.ipynb to define model and train")


if __name__ == "__main__":
    main()
