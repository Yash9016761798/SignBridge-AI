"""
Checkpoint Manager for SignBridge AI.
Saves and loads model checkpoints with full training state.
"""
import os
import torch
import json
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime


class CheckpointManager:
    """Manages model checkpoints."""

    def __init__(self, checkpoint_dir: str = './checkpoints', prefix: str = 'signbridge'):
        self.checkpoint_dir = Path(checkpoint_dir)
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        self.prefix = prefix

    def save(
        self,
        state: Dict[str, Any],
        filename: str,
        is_best: bool = False,
    ) -> str:
        path = self.checkpoint_dir / filename
        torch.save(state, path)
        if is_best:
            best_path = self.checkpoint_dir / f'{self.prefix}_best.pt'
            torch.save(state, best_path)
        return str(path)

    def save_epoch(
        self,
        model,
        optimizer,
        scheduler,
        epoch: int,
        metrics: Dict[str, float],
        config: Optional[Dict] = None,
    ) -> str:
        state = {
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'metrics': metrics,
            'timestamp': datetime.now().isoformat(),
        }
        if scheduler is not None:
            state['scheduler_state_dict'] = scheduler.state_dict()
        if config is not None:
            state['config'] = config

        path = self.save(state, f'{self.prefix}_epoch_{epoch}.pt')
        self.save(state, f'{self.prefix}_latest.pt')
        return path

    def load(self, filepath: str) -> Dict[str, Any]:
        return torch.load(filepath, map_location='cpu')

    def load_latest(self) -> Optional[Dict[str, Any]]:
        path = self.checkpoint_dir / f'{self.prefix}_latest.pt'
        if path.exists():
            return self.load(str(path))
        return None

    def load_best(self) -> Optional[Dict[str, Any]]:
        path = self.checkpoint_dir / f'{self.prefix}_best.pt'
        if path.exists():
            return self.load(str(path))
        return None

    def list_checkpoints(self):
        return sorted(self.checkpoint_dir.glob(f'{self.prefix}_*.pt'))

    def clean_old(self, keep_last: int = 5):
        checkpoints = sorted(
            [f for f in self.checkpoint_dir.glob(f'{self.prefix}_epoch_*.pt')],
            key=lambda x: x.stat().st_mtime,
            reverse=True,
        )
        for ckpt in checkpoints[keep_last:]:
            ckpt.unlink()
