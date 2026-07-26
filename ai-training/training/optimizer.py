"""
Optimizer factory for SignBridge AI.
Supports Adam, AdamW, SGD, RMSProp with configurable parameters.
"""
import torch.optim as optim
from typing import Dict, Any, Optional


class OptimizerFactory:
    """Creates optimizers from configuration."""

    SUPPORTED = ['adam', 'adamw', 'sgd', 'rmsprop']

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}

    @staticmethod
    def create(
        model_parameters,
        optimizer_type: str = 'adamw',
        lr: float = 0.0001,
        weight_decay: float = 0.0001,
        **kwargs,
    ) -> optim.Optimizer:
        optimizer_type = optimizer_type.lower()
        if optimizer_type == 'adam':
            return optim.Adam(
                model_parameters, lr=lr, weight_decay=weight_decay,
                betas=kwargs.get('betas', (0.9, 0.999)),
                eps=kwargs.get('eps', 1e-8),
            )
        elif optimizer_type == 'adamw':
            return optim.AdamW(
                model_parameters, lr=lr, weight_decay=weight_decay,
                betas=kwargs.get('betas', (0.9, 0.999)),
                eps=kwargs.get('eps', 1e-8),
            )
        elif optimizer_type == 'sgd':
            return optim.SGD(
                model_parameters, lr=lr, weight_decay=weight_decay,
                momentum=kwargs.get('momentum', 0.9),
                nesterov=kwargs.get('nesterov', True),
            )
        elif optimizer_type == 'rmsprop':
            return optim.RMSprop(
                model_parameters, lr=lr, weight_decay=weight_decay,
                momentum=kwargs.get('momentum', 0.9),
                alpha=kwargs.get('alpha', 0.99),
            )
        else:
            raise ValueError(f'Unsupported optimizer: {optimizer_type}. Use one of: {OptimizerFactory.SUPPORTED}')

    @staticmethod
    def get_supported() -> list:
        return OptimizerFactory.SUPPORTED.copy()
