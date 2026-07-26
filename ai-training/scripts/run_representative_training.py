"""
Run representative training for SignBridge AI.
Trains PoseTransformer on the representative dataset subset
using previously implemented training infrastructure.
"""
import sys
import os
import json
import csv
import yaml
import time
import math
import torch
import torch.nn as nn
import numpy as np
from pathlib import Path
from typing import Dict, List, Any, Optional

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from models.transformer import PoseTransformer
from training.seed import SeedManager
from training.optimizer import OptimizerFactory
from training.scheduler import SchedulerFactory
from training.checkpoint import CheckpointManager
from training.early_stopping import EarlyStopping
from training.config import TrainingConfig


class Vocabulary:
    """Simple vocabulary for the representative training pipeline."""

    def __init__(self):
        self.word2idx = {'<pad>': 0, '<sos>': 1, '<eos>': 2, '<unk>': 3}
        self.idx2word = {v: k for k, v in self.word2idx.items()}
        self.word_freq = {}
        self._next_idx = 4

    def build_from_texts(self, texts: List[str], min_freq: int = 1):
        freq = {}
        for text in texts:
            for word in text.lower().split():
                freq[word] = freq.get(word, 0) + 1
        for word, count in sorted(freq.items()):
            if count >= min_freq and word not in self.word2idx:
                self.word2idx[word] = self._next_idx
                self.idx2word[self._next_idx] = word
                self.word_freq[word] = count
                self._next_idx += 1

    def encode(self, text: str, max_length: int = 50) -> List[int]:
        tokens = [self.word2idx.get(w, self.word2idx['<unk>'])
                  for w in text.lower().split()[:max_length - 2]]
        return [self.word2idx['<sos>']] + tokens + [self.word2idx['<eos>']]

    def decode(self, indices: List[int], skip_special: bool = True) -> str:
        special = {self.word2idx['<pad>'], self.word2idx['<sos>'], self.word2idx['<eos>']}
        words = []
        for idx in indices:
            if skip_special and idx in special:
                continue
            words.append(self.idx2word.get(idx, '<unk>'))
        return ' '.join(words)

    def __len__(self):
        return len(self.word2idx)

    def to_dict(self):
        return {
            'word2idx': self.word2idx,
            'idx2word': {str(k): v for k, v in self.idx2word.items()},
            'word_freq': self.word_freq,
            'vocab_size': len(self.word2idx),
        }

    @classmethod
    def from_dict(cls, d: Dict) -> 'Vocabulary':
        v = cls()
        v.word2idx = d['word2idx']
        v.idx2word = {int(k): val for k, val in d['idx2word'].items()}
        v.word_freq = d.get('word_freq', {})
        v._next_idx = max(int(k) for k in v.idx2word.keys()) + 1
        return v


class MockPoseDataset:
    """Mock pose dataset for training with representative CSVs.

    Generates (B, T, L, F) pose tensors matching PoseTransformer input.
    """

    def __init__(self, csv_path: str, vocab: Vocabulary,
                 max_length: int = 50, num_landmarks: int = 33,
                 num_features: int = 5):
        self.max_length = max_length
        self.num_landmarks = num_landmarks
        self.num_features = num_features
        self.vocab = vocab
        self.samples = []

        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('text', '').strip():
                    self.samples.append(row)

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        row = self.samples[idx]
        text = row['text']
        tokens = self.vocab.encode(text, self.max_length)

        seq_len = min(len(tokens), self.max_length)
        T = seq_len
        L = self.num_landmarks
        F = self.num_features

        pose = np.random.randn(T, L, F).astype(np.float32)
        pose = np.clip(pose, -3.0, 3.0)

        pad_len = self.max_length - T
        if pad_len > 0:
            pose = np.pad(pose, ((0, pad_len), (0, 0), (0, 0)), mode='constant')

        pose_mask = np.ones(self.max_length, dtype=bool)
        pose_mask[:T] = False

        input_tokens = tokens + [0] * pad_len
        target_tokens = tokens[1:] + [0] * (pad_len + 1)
        target_tokens = target_tokens[:self.max_length]

        return {
            'pose': torch.tensor(pose, dtype=torch.float32),
            'pose_mask': torch.tensor(pose_mask, dtype=torch.bool),
            'input_ids': torch.tensor(input_tokens, dtype=torch.long),
            'target_ids': torch.tensor(target_tokens, dtype=torch.long),
        }


def collate_fn(batch: List[Dict[str, torch.Tensor]]) -> Dict[str, torch.Tensor]:
    return {
        'pose': torch.stack([b['pose'] for b in batch]),
        'pose_mask': torch.stack([b['pose_mask'] for b in batch]),
        'input_ids': torch.stack([b['input_ids'] for b in batch]),
        'target_ids': torch.stack([b['target_ids'] for b in batch]),
    }


class RepresentativeTrainer:
    """Full training loop for representative subset."""

    def __init__(self, config_path: str):
        with open(config_path, 'r', encoding='utf-8') as f:
            cfg = yaml.safe_load(f)
        self.config = cfg.get('representative_training', cfg)

        self.experiment_dir = Path(self.config['output']['experiment_dir'])
        self.checkpoint_dir = Path(self.config['checkpoint']['save_dir'])
        self.log_dir = Path(self.config['logging']['log_dir'])
        self.plots_dir = Path(self.config['output']['plots_dir'])

        for d in [self.experiment_dir, self.checkpoint_dir, self.log_dir, self.plots_dir]:
            d.mkdir(parents=True, exist_ok=True)

        SeedManager(seed=self.config['seed']).set_seed()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Device: {self.device}")

    def setup(self):
        model_cfg = self.config['model']

        self.model = PoseTransformer(
            vocab_size=model_cfg['vocab_size'],
            num_landmarks=33,
            num_features=5,
            d_model=model_cfg['d_model'],
            num_heads=model_cfg['nhead'],
            num_encoder_layers=model_cfg['num_encoder_layers'],
            num_decoder_layers=model_cfg['num_decoder_layers'],
            d_ff=model_cfg['dim_feedforward'],
            max_pose_length=model_cfg['max_seq_length'],
            max_text_length=model_cfg['max_seq_length'],
            dropout=model_cfg['dropout'],
            pad_token_id=0,
            bos_token_id=1,
            eos_token_id=2,
        ).to(self.device)

        params = self.model.get_num_parameters()
        print(f"Model parameters: {params['trainable']:,} trainable / {params['total']:,} total")

        self.criterion = nn.CrossEntropyLoss(
            ignore_index=0,
            label_smoothing=self.config['label_smoothing'],
        )

        self.optimizer = OptimizerFactory.create(
            self.model.parameters(),
            lr=self.config['learning_rate'],
            weight_decay=self.config['weight_decay'],
            optimizer_type=self.config['optimizer'],
        )

        self.scheduler = SchedulerFactory.create(
            self.optimizer,
            scheduler_type=self.config['scheduler'],
            max_epochs=self.config['max_epochs'],
            steps_per_epoch=1,
        )

        self.checkpoint_mgr = CheckpointManager(
            checkpoint_dir=str(self.checkpoint_dir),
            prefix='signbridge',
        )

        self.early_stop = EarlyStopping(
            patience=self.config['early_stopping']['patience'],
            min_delta=self.config['early_stopping']['min_delta'],
        )

        self.history = {
            'train_loss': [], 'val_loss': [],
            'train_acc': [], 'val_acc': [],
            'learning_rate': [], 'epoch': [],
            'val_perplexity': [],
        }

    def load_data(self):
        dataset_cfg_path = Path('configs/representative_dataset.yaml')
        if dataset_cfg_path.exists():
            with open(dataset_cfg_path, 'r', encoding='utf-8') as f:
                dcfg = yaml.safe_load(f)
            dcfg = dcfg.get('representative_dataset', dcfg)
        else:
            dcfg = {}

        csv_dir = Path(dcfg.get('output_dir', 'datasets/representative'))

        self.vocab = Vocabulary()
        train_csv = csv_dir / 'train.csv'
        texts = []
        if train_csv.exists():
            with open(train_csv, 'r', encoding='utf-8') as f:
                for row in csv.DictReader(f):
                    if row.get('text', '').strip():
                        texts.append(row['text'])
            self.vocab.build_from_texts(texts)

        model_cfg = self.config['model']
        model_cfg['vocab_size'] = len(self.vocab)
        self.config['model'] = model_cfg

        num_landmarks = 33
        num_features = 5

        self.train_loader = self._make_loader(
            csv_dir / 'train.csv', num_landmarks, num_features)
        self.val_loader = self._make_loader(
            csv_dir / 'validation.csv', num_landmarks, num_features)
        self.test_loader = self._make_loader(
            csv_dir / 'test.csv', num_landmarks, num_features)

        print(f"Train: {len(self.train_loader.dataset)} samples")
        print(f"Val: {len(self.val_loader.dataset)} samples")
        print(f"Test: {len(self.test_loader.dataset)} samples")
        print(f"Vocab size: {len(self.vocab)}")

    def _make_loader(self, csv_path, num_landmarks, num_features):
        from torch.utils.data import DataLoader
        ds = MockPoseDataset(
            str(csv_path), self.vocab,
            max_length=self.config['model']['max_seq_length'],
            num_landmarks=num_landmarks,
            num_features=num_features,
        )
        return DataLoader(ds, batch_size=self.config['batch_size'],
                          shuffle=True, collate_fn=collate_fn, drop_last=True)

    def train_epoch(self, epoch: int) -> Dict[str, float]:
        self.model.train()
        total_loss = 0.0
        correct = 0
        total = 0

        for batch_idx, batch in enumerate(self.train_loader):
            pose = batch['pose'].to(self.device)
            pose_mask = batch['pose_mask'].to(self.device)
            target_ids = batch['target_ids'].to(self.device)

            self.optimizer.zero_grad()
            output = self.model(pose, target_ids, pose_mask=pose_mask)
            logits = output['logits']
            loss = self.criterion(logits.reshape(-1, logits.size(-1)), target_ids.reshape(-1))

            loss.backward()

            if self.config['gradient_clip'] > 0:
                torch.nn.utils.clip_grad_norm_(
                    self.model.parameters(), self.config['gradient_clip'])

            self.optimizer.step()

            total_loss += loss.item()
            preds = logits.argmax(dim=-1)
            mask = target_ids != 0
            correct += ((preds == target_ids) & mask).sum().item()
            total += mask.sum().item()

        n_batches = max(len(self.train_loader), 1)
        return {
            'loss': total_loss / n_batches,
            'accuracy': correct / max(total, 1),
        }

    @torch.no_grad()
    def validate(self, loader=None) -> Dict[str, Any]:
        self.model.eval()
        if loader is None:
            loader = self.val_loader

        total_loss = 0.0
        correct = 0
        total = 0
        all_preds = []
        all_targets = []

        for batch in loader:
            pose = batch['pose'].to(self.device)
            pose_mask = batch['pose_mask'].to(self.device)
            target_ids = batch['target_ids'].to(self.device)

            output = self.model(pose, target_ids, pose_mask=pose_mask)
            logits = output['logits']
            loss = self.criterion(logits.reshape(-1, logits.size(-1)), target_ids.reshape(-1))

            total_loss += loss.item()
            preds = logits.argmax(dim=-1)
            mask = target_ids != 0
            correct += ((preds == target_ids) & mask).sum().item()
            total += mask.sum().item()

            for p, t in zip(preds.cpu().tolist(), target_ids.cpu().tolist()):
                all_preds.append(self.vocab.decode(p))
                all_targets.append(self.vocab.decode(t))

        n_batches = max(len(loader), 1)
        avg_loss = total_loss / n_batches
        return {
            'loss': avg_loss,
            'accuracy': correct / max(total, 1),
            'perplexity': math.exp(min(avg_loss, 20)),
            'predictions': all_preds,
            'targets': all_targets,
        }

    def run(self):
        print("=" * 60)
        print("Starting Representative Training")
        print("=" * 60)

        self.load_data()
        self.setup()

        best_val_loss = float('inf')
        start_time = time.time()

        for epoch in range(1, self.config['max_epochs'] + 1):
            epoch_start = time.time()

            train_metrics = self.train_epoch(epoch)
            val_metrics = self.validate()

            epoch_time = time.time() - epoch_start
            lr = self.optimizer.param_groups[0]['lr']

            self.history['epoch'].append(epoch)
            self.history['train_loss'].append(train_metrics['loss'])
            self.history['val_loss'].append(val_metrics['loss'])
            self.history['train_acc'].append(train_metrics['accuracy'])
            self.history['val_acc'].append(val_metrics['accuracy'])
            self.history['learning_rate'].append(lr)
            self.history['val_perplexity'].append(val_metrics['perplexity'])

            print(f"Epoch {epoch}/{self.config['max_epochs']} "
                  f"[{epoch_time:.1f}s] "
                  f"train_loss={train_metrics['loss']:.4f} "
                  f"val_loss={val_metrics['loss']:.4f} "
                  f"val_acc={val_metrics['accuracy']:.4f} "
                  f"val_ppl={val_metrics['perplexity']:.2f} "
                  f"lr={lr:.6f}")

            is_best = val_metrics['loss'] < best_val_loss
            if is_best:
                best_val_loss = val_metrics['loss']
                self.checkpoint_mgr.save({
                    'epoch': epoch,
                    'model_state_dict': self.model.state_dict(),
                    'optimizer_state_dict': self.optimizer.state_dict(),
                    'val_loss': val_metrics['loss'],
                    'val_accuracy': val_metrics['accuracy'],
                    'val_perplexity': val_metrics['perplexity'],
                    'config': self.config,
                    'vocab': self.vocab.to_dict(),
                }, filename='best.pt', is_best=True)

            self.checkpoint_mgr.save({
                'epoch': epoch,
                'model_state_dict': self.model.state_dict(),
                'optimizer_state_dict': self.optimizer.state_dict(),
                'val_loss': val_metrics['loss'],
            }, filename='latest.pt', is_best=False)

            self.early_stop(val_metrics['loss'], self.model)
            if self.early_stop.should_stop:
                print(f"\nEarly stopping at epoch {epoch}")
                break

            if self.scheduler is not None:
                self.scheduler.step()

        total_time = time.time() - start_time
        self._save_history()
        self._save_metrics(total_time, best_val_loss)
        self._save_vocab()

        print(f"\nTraining complete. Total time: {total_time:.1f}s")
        print(f"Best val loss: {best_val_loss:.4f}")
        return self.history

    def _save_history(self):
        csv_path = self.experiment_dir / 'history.csv'
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=list(self.history.keys()))
            writer.writeheader()
            for i in range(len(self.history['epoch'])):
                row = {k: self.history[k][i] for k in self.history}
                writer.writerow(row)
        print(f"Saved history to {csv_path}")

    def _save_metrics(self, total_time: float, best_val_loss: float):
        metrics = {
            'total_training_time': total_time,
            'best_val_loss': best_val_loss,
            'best_epoch': self.history['epoch'][
                self.history['val_loss'].index(min(self.history['val_loss']))
            ],
            'final_train_loss': self.history['train_loss'][-1],
            'final_val_loss': self.history['val_loss'][-1],
            'final_val_accuracy': self.history['val_acc'][-1],
            'final_val_perplexity': self.history['val_perplexity'][-1],
            'epochs_trained': len(self.history['epoch']),
            'config': self.config,
        }
        path = self.experiment_dir / 'metrics.json'
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(metrics, f, indent=2, default=str)
        print(f"Saved metrics to {path}")

    def _save_vocab(self):
        path = self.experiment_dir / 'vocabulary.json'
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(self.vocab.to_dict(), f, indent=2)
        print(f"Saved vocabulary to {path}")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Run representative training")
    parser.add_argument('--config', default='configs/representative_training.yaml')
    args = parser.parse_args()

    trainer = RepresentativeTrainer(args.config)
    trainer.run()


if __name__ == '__main__':
    main()
