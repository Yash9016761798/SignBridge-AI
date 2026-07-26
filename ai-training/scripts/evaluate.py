"""
Model Evaluation Script for SignBridge AI Training.

This script provides evaluation infrastructure: metrics computation,
confusion matrix generation, classification reports, and visualization.

DO NOT run evaluation automatically — this is infrastructure only.
"""

import sys
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))

from utils import load_config, get_project_root, ensure_dir, setup_logging

logger = logging.getLogger(__name__)


# =============================================================================
# METRICS
# =============================================================================

def compute_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    num_classes: int,
) -> Dict[str, float]:
    """Compute classification metrics.

    Args:
        y_true: True labels.
        y_pred: Predicted labels.
        num_classes: Number of classes.

    Returns:
        Dictionary of metrics.
    """
    from sklearn.metrics import (
        accuracy_score,
        precision_score,
        recall_score,
        f1_score,
        top_k_accuracy_score,
    )

    metrics = {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision_macro": precision_score(y_true, y_pred, average="macro", zero_division=0),
        "recall_macro": recall_score(y_true, y_pred, average="macro", zero_division=0),
        "f1_macro": f1_score(y_true, y_pred, average="macro", zero_division=0),
        "precision_weighted": precision_score(y_true, y_pred, average="weighted", zero_division=0),
        "recall_weighted": recall_score(y_true, y_pred, average="weighted", zero_division=0),
        "f1_weighted": f1_score(y_true, y_pred, average="weighted", zero_division=0),
    }

    # Top-K accuracy (for k=3 and k=5 if applicable)
    if num_classes >= 3:
        metrics["top3_accuracy"] = top_k_accuracy_score(y_true, y_pred, k=3, labels=range(num_classes))
    if num_classes >= 5:
        metrics["top5_accuracy"] = top_k_accuracy_score(y_true, y_pred, k=5, labels=range(num_classes))

    return metrics


def compute_confusion_matrix(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    num_classes: int,
) -> np.ndarray:
    """Compute confusion matrix.

    Args:
        y_true: True labels.
        y_pred: Predicted labels.
        num_classes: Number of classes.

    Returns:
        Confusion matrix of shape (num_classes, num_classes).
    """
    from sklearn.metrics import confusion_matrix
    return confusion_matrix(y_true, y_pred, labels=range(num_classes))


# =============================================================================
# VISUALIZATION
# =============================================================================

def plot_confusion_matrix(
    cm: np.ndarray,
    class_names: List[str],
    output_path: Optional[Path] = None,
    figsize: Tuple[int, int] = (12, 10),
) -> None:
    """Plot and save confusion matrix.

    Args:
        cm: Confusion matrix.
        class_names: List of class names.
        output_path: Path to save the plot.
        figsize: Figure size.
    """
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import seaborn as sns

    fig, ax = plt.subplots(figsize=figsize)
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=class_names,
        yticklabels=class_names,
        ax=ax,
    )
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")
    ax.set_title("Confusion Matrix")

    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(output_path, dpi=150, bbox_inches="tight")
        logger.info(f"Confusion matrix saved to {output_path}")

    plt.close()


def plot_training_curves(
    history: Dict[str, List[float]],
    output_path: Optional[Path] = None,
) -> None:
    """Plot training and validation curves.

    Args:
        history: Training history dictionary.
        output_path: Path to save the plot.
    """
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Loss
    axes[0].plot(history.get("train_loss", []), label="Train Loss")
    axes[0].plot(history.get("val_loss", []), label="Val Loss")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Loss")
    axes[0].set_title("Loss Curves")
    axes[0].legend()

    # Accuracy
    axes[1].plot(history.get("train_accuracy", []), label="Train Accuracy")
    axes[1].plot(history.get("val_accuracy", []), label="Val Accuracy")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Accuracy")
    axes[1].set_title("Accuracy Curves")
    axes[1].legend()

    plt.tight_layout()

    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(output_path, dpi=150, bbox_inches="tight")
        logger.info(f"Training curves saved to {output_path}")

    plt.close()


# =============================================================================
# EVALUATION REPORT
# =============================================================================

def generate_evaluation_report(
    metrics: Dict[str, float],
    class_names: List[str],
    output_path: Optional[Path] = None,
) -> str:
    """Generate human-readable evaluation report.

    Args:
        metrics: Computed metrics dictionary.
        class_names: List of class names.
        output_path: Optional path to save report.

    Returns:
        Report as string.
    """
    lines = [
        "=" * 60,
        "MODEL EVALUATION REPORT",
        "=" * 60,
        "",
        "METRICS:",
    ]

    for name, value in sorted(metrics.items()):
        lines.append(f"  {name:25s} {value:.4f}")

    lines.extend(["", "=" * 60])

    report = "\n".join(lines)

    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(report, encoding="utf-8")
        logger.info(f"Evaluation report saved to {output_path}")

    return report


# =============================================================================
# MAIN
# =============================================================================

def main():
    """Evaluation entry point (infrastructure only — no model is evaluated)."""
    setup_logging(level="INFO")

    logger.info("Evaluation infrastructure ready")
    logger.info("Metrics: accuracy, precision, recall, F1, top-K accuracy")
    logger.info("Visualizations: confusion matrix, training curves")
    logger.info("Use notebook 05_model_evaluation.ipynb for interactive evaluation")


if __name__ == "__main__":
    main()
