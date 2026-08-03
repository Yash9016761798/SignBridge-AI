"""
Collate Function for SignBridge AI.
Handles dynamic padding and batch creation for training samples.
"""
import logging
from typing import List, Dict, Any, Optional
import numpy as np
from training.sample import TrainingSample

logger = logging.getLogger(__name__)


class CollateFn:
    """
    Collate function for creating batches from TrainingSamples.
    Supports dynamic padding and teacher forcing labels.
    """

    def __init__(
        self,
        pad_token_id: int = 0,
        bos_token_id: int = 1,
        eos_token_id: int = 2,
        dynamic_padding: bool = True,
    ):
        self.pad_token_id = pad_token_id
        self.bos_token_id = bos_token_id
        self.eos_token_id = eos_token_id
        self.dynamic_padding = dynamic_padding

    def __call__(self, batch: List[TrainingSample]) -> Dict[str, Any]:
        if not batch:
            return self._empty_batch()

        uids = [s.uid for s in batch]
        texts = [s.metadata.get('text', '') for s in batch]

        pose_tensors = [s.pose_tensor for s in batch]
        input_ids_list = [s.input_ids for s in batch]
        target_ids_list = [s.target_ids for s in batch]
        attention_masks = [s.attention_mask for s in batch]
        pose_masks = [s.pose_mask for s in batch]
        seq_lengths = [s.sequence_length for s in batch]

        if self.dynamic_padding:
            max_text_len = max(ids.shape[0] for ids in input_ids_list)
            max_text_len = min(max_text_len, 128)
        else:
            max_text_len = input_ids_list[0].shape[0]

        padded_input = []
        padded_target = []
        padded_text_mask = []
        for ids, tgt, mask in zip(input_ids_list, target_ids_list, attention_masks):
            if ids.shape[0] > max_text_len:
                ids = ids[:max_text_len]
                tgt = tgt[:max_text_len]
                mask = mask[:max_text_len]
            pad_len = max_text_len - ids.shape[0]
            if pad_len > 0:
                ids = np.pad(ids, (0, pad_len), constant_values=self.pad_token_id)
                tgt = np.pad(tgt, (0, pad_len), constant_values=self.pad_token_id)
                mask = np.pad(mask, (0, pad_len), constant_values=0)
            padded_input.append(ids)
            padded_target.append(tgt)
            padded_text_mask.append(mask)

        pose_batch = np.stack(pose_tensors)
        input_batch = np.stack(padded_input)
        target_batch = np.stack(padded_target)
        text_mask_batch = np.stack(padded_text_mask)
        pose_mask_batch = np.stack(pose_masks)
        seq_len_batch = np.array(seq_lengths, dtype=np.int64)

        return {
            'uid': uids,
            'text': texts,
            'pose_tensor': pose_batch,
            'input_ids': input_batch,
            'target_ids': target_batch,
            'attention_mask': text_mask_batch,
            'pose_mask': pose_mask_batch,
            'sequence_length': seq_len_batch,
        }

    def _empty_batch(self) -> Dict[str, Any]:
        return {
            'uid': [],
            'text': [],
            'pose_tensor': np.array([]),
            'input_ids': np.array([]),
            'target_ids': np.array([]),
            'attention_mask': np.array([]),
            'pose_mask': np.array([]),
            'sequence_length': np.array([]),
        }

    def get_batch_statistics(self, batch: Dict[str, Any]) -> Dict[str, Any]:
        pose = batch['pose_tensor']
        if pose.size == 0:
            return {'batch_size': 0}
        return {
            'batch_size': pose.shape[0],
            'pose_shape': pose.shape,
            'input_ids_shape': batch['input_ids'].shape,
            'target_ids_shape': batch['target_ids'].shape,
            'attention_mask_shape': batch['attention_mask'].shape,
            'pose_mask_shape': batch['pose_mask'].shape,
            'avg_text_length': float(batch['attention_mask'].sum(axis=1).mean()),
            'avg_pose_length': float(batch['sequence_length'].mean()),
        }
