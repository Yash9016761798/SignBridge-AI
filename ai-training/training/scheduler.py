"""
Learning rate schedulers for SignBridge AI.
CosineAnnealing, OneCycleLR, LinearWarmup, ReduceLROnPlateau.
"""
import torch.optim.lr_scheduler as lr_scheduler
from typing import Dict, Any, Optional


class SchedulerFactory:
    """Creates learning rate schedulers from configuration."""

    SUPPORTED = ['cosineannealing', 'onecyclelr', 'linearwarmup', 'reducelronplateau', 'none']

    @staticmethod
    def create(
        optimizer,
        scheduler_type: str = 'cosineannealing',
        **kwargs,
    ):
        scheduler_type = scheduler_type.lower().replace('_', '').replace('-', '')
        if scheduler_type in ('cosineannealing', 'cosine'):
            return lr_scheduler.CosineAnnealingLR(
                optimizer,
                T_max=kwargs.get('T_max', 100),
                eta_min=kwargs.get('eta_min', 1e-6),
                last_epoch=kwargs.get('last_epoch', -1),
            )
        elif scheduler_type in ('onecyclelr', 'onecycle'):
            return lr_scheduler.OneCycleLR(
                optimizer,
                max_lr=kwargs.get('max_lr', 0.001),
                epochs=kwargs.get('epochs', 100),
                steps_per_epoch=kwargs.get('steps_per_epoch', 1000),
                pct_start=kwargs.get('pct_start', 0.3),
                anneal_strategy=kwargs.get('anneal_strategy', 'cos'),
                div_factor=kwargs.get('div_factor', 10.0),
                final_div_factor=kwargs.get('final_div_factor', 100.0),
            )
        elif scheduler_type in ('linearwarmup', 'linearwarmuplr', 'warmuplinear'):
            warmup_steps = kwargs.get('warmup_steps', 4000)
            d_model = kwargs.get('d_model', 512)

            def lr_lambda(step):
                step = max(step, 1)
                return min(step ** (-0.5), step * warmup_steps ** (-1.5)) * d_model ** (-0.5)

            return lr_scheduler.LambdaLR(optimizer, lr_lambda)
        elif scheduler_type in ('reducelronplateau', 'plateau'):
            return lr_scheduler.ReduceLROnPlateau(
                optimizer,
                mode=kwargs.get('mode', 'min'),
                factor=kwargs.get('factor', 0.5),
                patience=kwargs.get('patience', 5),
                min_lr=kwargs.get('min_lr', 1e-6),
            )
        elif scheduler_type in ('none', 'constant'):
            return None
        else:
            raise ValueError(f'Unsupported scheduler: {scheduler_type}. Use one of: {SchedulerFactory.SUPPORTED}')

    @staticmethod
    def get_supported() -> list:
        return SchedulerFactory.SUPPORTED.copy()
