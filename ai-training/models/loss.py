"""
Cross-Entropy Loss with Label Smoothing for SignBridge AI.
Handles padding token ignore and label smoothing.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional


class LabelSmoothingLoss(nn.Module):
    """
    Cross-entropy loss with label smoothing and padding ignore.
    """

    def __init__(self, vocab_size: int, pad_token_id: int = 0, smoothing: float = 0.1, reduction: str = 'mean'):
        super().__init__()
        self.vocab_size = vocab_size
        self.pad_token_id = pad_token_id
        self.smoothing = smoothing
        self.reduction = reduction
        self.confidence = 1.0 - smoothing

    def forward(self, logits: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        """
        Args:
            logits: (B, T, V) raw model output
            target: (B, T) token ids
        Returns:
            scalar loss
        """
        B, T, V = logits.shape
        logits = logits.contiguous().view(-1, V)
        target = target.contiguous().view(-1)

        log_probs = F.log_softmax(logits, dim=-1)
        smooth_loss = -log_probs.sum(dim=-1)

        nll_loss = F.nll_loss(log_probs, target, ignore_index=self.pad_token_id, reduction='none')
        smooth_loss = smooth_loss / V

        loss = self.confidence * nll_loss + self.smoothing * smooth_loss

        if self.reduction == 'mean':
            mask = (target != self.pad_token_id).float()
            loss = (loss * mask).sum() / mask.sum().clamp(min=1.0)
        elif self.reduction == 'sum':
            loss = loss.sum()

        return loss


class SignBridgeLoss(nn.Module):
    """
    Combined loss for SignBridge training.
    Wraps LabelSmoothingLoss with padding handling.
    """

    def __init__(self, vocab_size: int, pad_token_id: int = 0, smoothing: float = 0.1):
        super().__init__()
        self.criterion = LabelSmoothingLoss(vocab_size, pad_token_id, smoothing)
        self.pad_token_id = pad_token_id

    def forward(self, logits: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        return self.criterion(logits, target)

    def compute_accuracy(self, logits: torch.Tensor, target: torch.Tensor) -> float:
        """Computes token-level accuracy ignoring padding."""
        preds = logits.argmax(dim=-1)
        mask = target != self.pad_token_id
        correct = (preds == target) & mask
        return correct.sum().float() / mask.sum().float()
