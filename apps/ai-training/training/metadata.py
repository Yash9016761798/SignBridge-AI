"""
Metadata Handler for SignBridge AI.
Generates and manages dataset statistics and metadata.
"""
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np

logger = logging.getLogger(__name__)


class MetadataHandler:
    """Generates and saves dataset metadata and statistics."""

    def __init__(self, output_dir: str = './experiments'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def compute_dataset_statistics(self, dataset) -> Dict[str, Any]:
        text_lengths = []
        for i in range(len(dataset)):
            info = dataset.samples[i] if hasattr(dataset, 'samples') else {}
            text = info.get('text', '') if info else ''
            text_lengths.append(len(text.split()))

        return {
            'num_samples': len(dataset),
            'text_stats': {
                'avg_length': float(np.mean(text_lengths)) if text_lengths else 0,
                'max_length': int(max(text_lengths)) if text_lengths else 0,
                'min_length': int(min(text_lengths)) if text_lengths else 0,
                'std_length': float(np.std(text_lengths)) if text_lengths else 0,
            },
            'config': {
                'max_pose_length': getattr(dataset, 'max_pose_length', 64),
                'max_text_length': getattr(dataset, 'max_text_length', 50),
            }
        }

    def compute_batch_statistics(self, batch: Dict[str, Any]) -> Dict[str, Any]:
        pose = batch['pose_tensor']
        if pose.size == 0:
            return {'batch_size': 0}
        return {
            'batch_size': int(pose.shape[0]),
            'pose_shape': list(pose.shape),
            'input_ids_shape': list(batch['input_ids'].shape),
            'target_ids_shape': list(batch['target_ids'].shape),
            'attention_mask_shape': list(batch['attention_mask'].shape),
            'pose_mask_shape': list(batch['pose_mask'].shape),
            'avg_text_tokens': float(batch['attention_mask'].sum(axis=1).mean()),
            'avg_pose_frames': float(batch['sequence_length'].mean()),
        }

    def validate_batch(self, batch: Dict[str, Any]) -> Dict[str, Any]:
        errors = []
        warnings = []
        B = batch['pose_tensor'].shape[0]
        if batch['input_ids'].shape[0] != B:
            errors.append('Batch size mismatch between pose and input_ids')
        if batch['target_ids'].shape != batch['input_ids'].shape:
            errors.append('target_ids shape mismatch with input_ids')
        if batch['attention_mask'].shape != batch['input_ids'].shape:
            errors.append('attention_mask shape mismatch with input_ids')
        if batch['pose_mask'].shape[0] != B:
            errors.append('pose_mask batch size mismatch')
        return {'is_valid': len(errors) == 0, 'errors': errors, 'warnings': warnings}

    def save_statistics(self, stats: Dict[str, Any], filename: str = 'dataset_statistics.json'):
        path = self.output_dir / filename
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, default=str)
        logger.info(f'Statistics saved to {path}')

    def save_sample_batch(self, batch: Dict[str, Any], filename: str = 'sample_batch.json'):
        serializable = {}
        for k, v in batch.items():
            if isinstance(v, np.ndarray):
                serializable[k] = {'shape': list(v.shape), 'dtype': str(v.dtype)}
            elif isinstance(v, list):
                serializable[k] = {'length': len(v), 'sample': v[:2] if v else []}
            else:
                serializable[k] = v
        path = self.output_dir / filename
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(serializable, f, indent=2, default=str)
        logger.info(f'Sample batch saved to {path}')
