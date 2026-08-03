"""
Mixed Precision Training for SignBridge AI.
Automatic Mixed Precision with gradient scaling.
"""
import torch
from typing import Optional


class MixedPrecisionManager:
    """Manages automatic mixed precision training."""

    def __init__(self, enabled: bool = True, loss_scale: str = 'dynamic', init_scale: float = 2.0**16):
        self.enabled = enabled
        self.device_type = 'cuda' if torch.cuda.is_available() else 'cpu'
        if enabled and self.device_type == 'cuda':
            self.scaler = torch.amp.GradScaler('cuda')
        else:
            self.scaler = None
        self.init_scale = init_scale

    def scale_loss(self, loss: torch.Tensor) -> torch.Tensor:
        return self.scaler.scale(loss) if self.scaler else loss

    def backward(self, loss: torch.Tensor) -> None:
        scaled_loss = self.scale_loss(loss)
        scaled_loss.backward()

    def step(self, optimizer) -> None:
        if self.scaler:
            self.scaler.step(optimizer)
            self.scaler.update()
        else:
            optimizer.step()

    def clip_grad_norm(self, model, max_norm: float) -> float:
        if self.scaler:
            self.scaler.unscale_(optimizer=None)
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm)
        return torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm).item()

    def get_scale(self) -> float:
        return self.scaler.get_scale() if self.scaler else 1.0

    def __enter__(self):
        use_amp = self.enabled and self.device_type == 'cuda'
        return torch.amp.autocast(device_type=self.device_type, enabled=use_amp)

    def __exit__(self, *args):
        pass
