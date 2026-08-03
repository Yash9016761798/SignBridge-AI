"""
Unified Dataset for SignBridge AI.
Merges pose pipeline and tokenizer into a single dataset.
"""
import json
import logging
from pathlib import Path
from typing import List, Dict, Optional, Any

import numpy as np
import pandas as pd

from training.sample import TrainingSample
from tokenizer.tokenizer import Tokenizer
from pose import PoseReader, PoseNormalizer, SequenceBuilder, PoseSequence

logger = logging.getLogger(__name__)


class SignBridgeDataset:
    """
    Unified dataset merging pose and text data.
    """

    def __init__(
        self,
        csv_path: str,
        pose_dir: str,
        tokenizer: Tokenizer,
        pose_normalizer=None,
        sequence_builder=None,
        max_text_length: int = 50,
        max_pose_length: int = 64,
    ):
        self.csv_path = csv_path
        self.pose_dir = Path(pose_dir)
        self.tokenizer = tokenizer
        self.pose_normalizer = pose_normalizer or PoseNormalizer()
        self.sequence_builder = sequence_builder or SequenceBuilder({'max_length': max_pose_length})
        self.max_text_length = max_text_length
        self.max_pose_length = max_pose_length

        self.reader = PoseReader()
        self.df = pd.read_csv(csv_path)
        self.df['base_id'] = self.df['uid'].astype(str).str.rsplit('-', n=1).str[0]
        self.samples = self._build_index()
        logger.info(f'Dataset loaded: {len(self.samples)} samples from {csv_path}')

    def _build_index(self) -> List[Dict[str, Any]]:
        index = []
        for base_id, group in self.df.groupby('base_id'):
            pose_path = self.pose_dir / f'{base_id}.json'
            if not pose_path.exists():
                continue
            for _, row in group.iterrows():
                index.append({
                    'uid': str(row['uid']),
                    'text': str(row['text']),
                    'base_id': base_id,
                    'pose_path': str(pose_path),
                })
        return index

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> TrainingSample:
        info = self.samples[idx]

        pose_seq = self.reader.read(info['pose_path'])
        norm_seq = self.pose_normalizer.normalize(pose_seq)
        pose_result = self.sequence_builder.build(norm_seq)
        pose_tensor = pose_result['pose_tensor']
        pose_mask = pose_result['attention_mask']
        seq_len = int(pose_result['sequence_length'])

        text = info['text']
        input_ids = self.tokenizer.encode(text, add_special=True, max_length=self.max_text_length)
        target_ids = input_ids[1:] + [0] * (self.max_text_length - len(input_ids) + 1)
        target_ids = target_ids[:self.max_text_length]
        text_mask = [1] * len(input_ids) + [0] * (self.max_text_length - len(input_ids))
        text_mask = text_mask[:self.max_text_length]

        input_ids = np.array(input_ids, dtype=np.int64)
        target_ids = np.array(target_ids, dtype=np.int64)
        text_mask = np.array(text_mask, dtype=np.int64)

        if len(input_ids) < self.max_text_length:
            pad_len = self.max_text_length - len(input_ids)
            input_ids = np.pad(input_ids, (0, pad_len), constant_values=0)
            target_ids = np.pad(target_ids, (0, pad_len), constant_values=0)
            text_mask = np.pad(text_mask, (0, pad_len), constant_values=0)

        return TrainingSample(
            uid=info['uid'],
            pose_tensor=pose_tensor,
            input_ids=input_ids,
            target_ids=target_ids,
            attention_mask=text_mask,
            pose_mask=pose_mask,
            sequence_length=seq_len,
            metadata={'text': text, 'base_id': info['base_id']},
        )

    def get_split(self, split: str = 'train', ratios=(0.8, 0.1, 0.1), seed=42):
        rng = np.random.RandomState(seed)
        indices = np.arange(len(self))
        rng.shuffle(indices)
        n = len(indices)
        train_end = int(n * ratios[0])
        val_end = train_end + int(n * ratios[1])
        if split == 'train':
            return SubsetDataset(self, indices[:train_end])
        elif split == 'val':
            return SubsetDataset(self, indices[train_end:val_end])
        else:
            return SubsetDataset(self, indices[val_end:])

    def get_statistics(self) -> Dict[str, Any]:
        text_lengths = [len(s['text'].split()) for s in self.samples]
        return {
            'num_samples': len(self),
            'avg_text_length': np.mean(text_lengths),
            'max_text_length': max(text_lengths),
            'min_text_length': min(text_lengths),
            'max_pose_length': self.max_pose_length,
            'max_text_length_config': self.max_text_length,
        }


class SubsetDataset:
    """Wrapper for dataset subsets."""

    def __init__(self, dataset: SignBridgeDataset, indices: np.ndarray):
        self.dataset = dataset
        self.indices = indices

    def __len__(self) -> int:
        return len(self.indices)

    def __getitem__(self, idx: int) -> TrainingSample:
        return self.dataset[self.indices[idx]]

    def get_statistics(self) -> Dict[str, Any]:
        text_lengths = [self.dataset.samples[i]['text'].split().__len__() for i in self.indices]
        return {
            'num_samples': len(self),
            'avg_text_length': np.mean(text_lengths) if text_lengths else 0,
        }
