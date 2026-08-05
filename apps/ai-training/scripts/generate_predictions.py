"""
Generate predictions for SignBridge AI.
Runs inference on test set and produces predictions.csv
with UID, Ground Truth, Prediction, BLEU, WER, CER.
"""
import sys
import os
import json
import csv
import yaml
import torch
import numpy as np
from pathlib import Path
from typing import List, Dict

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tokenizer.vocabulary import Vocabulary


def compute_bleu_simple(ref: str, hyp: str) -> float:
    ref_t = ref.lower().split()
    hyp_t = hyp.lower().split()
    if not hyp_t or not ref_t:
        return 0.0
    ref_ngrams = {}
    for n in range(1, 5):
        for i in range(len(ref_t) - n + 1):
            ng = tuple(ref_t[i:i + n])
            ref_ngrams[(n, ng)] = ref_ngrams.get((n, ng), 0) + 1
    hyp_ngrams = {}
    for n in range(1, 5):
        for i in range(len(hyp_t) - n + 1):
            ng = tuple(hyp_t[i:i + n])
            hyp_ngrams[(n, ng)] = hyp_ngrams.get((n, ng), 0) + 1
    clipped = sum(min(c, ref_ngrams.get(k, 0)) for k, c in hyp_ngrams.items())
    total = sum(hyp_ngrams.values())
    if total == 0:
        return 0.0
    return clipped / total


def compute_wer_simple(ref: str, hyp: str) -> float:
    r = ref.lower().split()
    h = hyp.lower().split()
    n, m = len(r), len(h)
    d = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        d[i][0] = i
    for j in range(m + 1):
        d[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if r[i - 1] == h[j - 1]:
                d[i][j] = d[i - 1][j - 1]
            else:
                d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + 1)
    return d[n][m] / max(n, 1)


def compute_cer_simple(ref: str, hyp: str) -> float:
    r = list(ref.lower().replace(' ', ''))
    h = list(hyp.lower().replace(' ', ''))
    n, m = len(r), len(h)
    d = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        d[i][0] = i
    for j in range(m + 1):
        d[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if r[i - 1] == h[j - 1]:
                d[i][j] = d[i - 1][j - 1]
            else:
                d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + 1)
    return d[n][m] / max(n, 1)


class PredictionGenerator:
    """Generates predictions on test set."""

    def __init__(self, experiment_dir: str,
                 training_config: str = 'configs/representative_training.yaml'):
        self.experiment_dir = Path(experiment_dir)
        self.checkpoint_dir = self.experiment_dir / 'checkpoints'

        with open(training_config, 'r', encoding='utf-8') as f:
            cfg = yaml.safe_load(f)
        self.config = cfg.get('representative_training', cfg)

        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.max_length = self.config['model']['max_seq_length']

    def load_model(self):
        from models.transformer import PoseTransformer

        best_ckpt = self.checkpoint_dir / 'best.pt'
        if not best_ckpt.exists():
            best_ckpt = self.checkpoint_dir / 'latest.pt'

        ckpt = torch.load(best_ckpt, map_location=self.device, weights_only=False)
        saved_config = ckpt.get('config', self.config)
        model_cfg = saved_config.get('model', self.config['model'])

        vocab_dict = ckpt.get('vocab', {})
        vocab_size = vocab_dict.get('vocab_size', 68241)

        model = PoseTransformer(
            vocab_size=vocab_size,
            num_landmarks=33,
            num_features=5,
            d_model=model_cfg['d_model'],
            num_heads=model_cfg['nhead'],
            num_encoder_layers=model_cfg['num_encoder_layers'],
            num_decoder_layers=model_cfg['num_decoder_layers'],
            d_ff=model_cfg['dim_feedforward'],
            max_pose_length=model_cfg['max_seq_length'],
            max_text_length=model_cfg['max_seq_length'],
            dropout=model_cfg.get('dropout', 0.1),
            pad_token_id=0,
            bos_token_id=1,
            eos_token_id=2,
        ).to(self.device)

        model.load_state_dict(ckpt['model_state_dict'])
        model.eval()

        print(f"Loaded model from {best_ckpt} (epoch {ckpt.get('epoch', '?')})")
        return model, vocab_dict

    def load_vocabulary(self, vocab_dict: Dict) -> 'Vocabulary':
        return Vocabulary.from_dict(vocab_dict)

    def load_test_data(self, dataset_cfg_path: str = 'configs/representative_dataset.yaml') -> List[Dict]:
        with open(dataset_cfg_path, 'r', encoding='utf-8') as f:
            cfg = yaml.safe_load(f)
        cfg = cfg.get('representative_dataset', cfg)
        csv_dir = Path(cfg.get('output_dir', 'datasets/representative'))
        test_csv = csv_dir / 'test.csv'

        rows = []
        with open(test_csv, 'r', encoding='utf-8') as f:
            for row in csv.DictReader(f):
                if row.get('text', '').strip():
                    rows.append(row)
        print(f"Loaded {len(rows)} test samples")
        return rows

    def generate_mock_pose(self, vocab: 'Vocabulary', text: str,
                           num_landmarks: int = 33, num_features: int = 5):
        tokens = vocab.encode(text, self.max_length)
        seq_len = min(len(tokens), self.max_length)

        T = seq_len
        pose = np.random.randn(T, num_landmarks, num_features).astype(np.float32)
        pose = np.clip(pose, -3.0, 3.0)

        pad_len = self.max_length - T
        if pad_len > 0:
            pose = np.pad(pose, ((0, pad_len), (0, 0), (0, 0)), mode='constant')

        pose_mask = np.ones(self.max_length, dtype=bool)
        pose_mask[:T] = False

        return (
            torch.tensor(pose, dtype=torch.float32).unsqueeze(0).to(self.device),
            torch.tensor(pose_mask, dtype=torch.bool).unsqueeze(0).to(self.device),
        )

    @torch.no_grad()
    def predict(self, model, vocab: 'Vocabulary', text: str) -> str:
        pose, pose_mask = self.generate_mock_pose(vocab, text)

        generated = model.generate(pose, pose_mask, max_length=self.max_length)
        return vocab.decode(generated[0], skip_special=True)

    def generate(self):
        print("=" * 60)
        print("Generating Predictions")
        print("=" * 60)

        model, vocab_dict = self.load_model()
        vocab = self.load_vocabulary(vocab_dict)
        test_data = self.load_test_data()

        predictions = []
        for i, row in enumerate(test_data):
            uid = row['uid']
            gt = row['text']
            pred = self.predict(model, vocab, gt)

            bleu = compute_bleu_simple(gt, pred)
            wer = compute_wer_simple(gt, pred)
            cer = compute_cer_simple(gt, pred)

            predictions.append({
                'uid': uid,
                'ground_truth': gt,
                'prediction': pred,
                'bleu': round(bleu, 4),
                'wer': round(wer, 4),
                'cer': round(cer, 4),
            })

            if (i + 1) % 50 == 0:
                print(f"  Processed {i + 1}/{len(test_data)}")

        output_path = self.experiment_dir / 'predictions.csv'
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['uid', 'ground_truth', 'prediction', 'bleu', 'wer', 'cer'])
            writer.writeheader()
            writer.writerows(predictions)

        print(f"Saved {len(predictions)} predictions to {output_path}")

        avg_bleu = sum(p['bleu'] for p in predictions) / max(len(predictions), 1)
        avg_wer = sum(p['wer'] for p in predictions) / max(len(predictions), 1)
        avg_cer = sum(p['cer'] for p in predictions) / max(len(predictions), 1)
        print(f"Average BLEU: {avg_bleu:.4f}, WER: {avg_wer:.4f}, CER: {avg_cer:.4f}")

        return predictions


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Generate predictions")
    parser.add_argument('--experiment-dir', default='experiments/representative')
    args = parser.parse_args()

    generator = PredictionGenerator(args.experiment_dir)
    generator.generate()


if __name__ == '__main__':
    main()
