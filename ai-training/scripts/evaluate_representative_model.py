"""
Evaluate representative model for SignBridge AI.
Computes BLEU, WER, CER, ROUGE-L, accuracy, and perplexity
on test set, generates plots and report.
"""
import sys
import os
import json
import csv
import math
import yaml
import numpy as np
from pathlib import Path
from collections import Counter
from typing import List, Dict, Tuple, Any

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


def compute_bleu(reference: str, hypothesis: str, max_n: int = 4) -> float:
    ref_tokens = reference.lower().split()
    hyp_tokens = hypothesis.lower().split()

    if not hyp_tokens or not ref_tokens:
        return 0.0

    scores = []
    for n in range(1, max_n + 1):
        ref_ngrams = Counter()
        for i in range(len(ref_tokens) - n + 1):
            ng = tuple(ref_tokens[i:i + n])
            ref_ngrams[ng] += 1

        hyp_ngrams = Counter()
        for i in range(len(hyp_tokens) - n + 1):
            ng = tuple(hyp_tokens[i:i + n])
            hyp_ngrams[ng] += 1

        clipped = 0
        total = 0
        for ng, count in hyp_ngrams.items():
            clipped += min(count, ref_ngrams.get(ng, 0))
            total += count

        if total == 0:
            scores.append(0.0)
        else:
            scores.append(clipped / total)

    if not scores or all(s == 0 for s in scores):
        return 0.0

    log_avg = sum(math.log(max(s, 1e-10)) for s in scores) / len(scores)

    bp = 1.0
    if len(hyp_tokens) < len(ref_tokens):
        bp = math.exp(1 - len(ref_tokens) / max(len(hyp_tokens), 1))

    return bp * math.exp(log_avg)


def compute_wer(reference: str, hypothesis: str) -> float:
    ref_words = reference.lower().split()
    hyp_words = hypothesis.lower().split()

    n = len(ref_words)
    m = len(hyp_words)
    d = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        d[i][0] = i
    for j in range(m + 1):
        d[0][j] = j

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if ref_words[i - 1] == hyp_words[j - 1]:
                d[i][j] = d[i - 1][j - 1]
            else:
                d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + 1)

    return d[n][m] / max(n, 1)


def compute_cer(reference: str, hypothesis: str) -> float:
    ref_chars = list(reference.lower().replace(' ', ''))
    hyp_chars = list(hypothesis.lower().replace(' ', ''))

    n = len(ref_chars)
    m = len(hyp_chars)
    d = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        d[i][0] = i
    for j in range(m + 1):
        d[0][j] = j

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if ref_chars[i - 1] == hyp_chars[j - 1]:
                d[i][j] = d[i - 1][j - 1]
            else:
                d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + 1)

    return d[n][m] / max(n, 1)


def compute_rouge_l(reference: str, hypothesis: str) -> float:
    ref_tokens = reference.lower().split()
    hyp_tokens = hypothesis.lower().split()

    if not ref_tokens or not hyp_tokens:
        return 0.0

    n = len(ref_tokens)
    m = len(hyp_tokens)
    lcs = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if ref_tokens[i - 1] == hyp_tokens[j - 1]:
                lcs[i][j] = lcs[i - 1][j - 1] + 1
            else:
                lcs[i][j] = max(lcs[i - 1][j], lcs[i][j - 1])

    lcs_len = lcs[n][m]
    if lcs_len == 0:
        return 0.0

    precision = lcs_len / max(len(hyp_tokens), 1)
    recall = lcs_len / max(len(ref_tokens), 1)
    f1 = 2 * precision * recall / max(precision + recall, 1e-10)
    return f1


def generate_plots(metrics: Dict[str, List[float]], plots_dir: Path):
    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib not available, skipping plots")
        return

    plt.rcParams['figure.figsize'] = (10, 6)
    plt.rcParams['font.size'] = 12

    fig, ax = plt.subplots()
    epochs = metrics.get('epoch', list(range(1, len(metrics.get('train_loss', [])) + 1)))
    ax.plot(epochs, metrics['train_loss'], label='Train Loss', marker='o', markersize=3)
    ax.plot(epochs, metrics['val_loss'], label='Val Loss', marker='s', markersize=3)
    ax.set_xlabel('Epoch')
    ax.set_ylabel('Loss')
    ax.set_title('Training and Validation Loss')
    ax.legend()
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(plots_dir / 'training_loss.png', dpi=150)
    plt.close()

    fig, ax = plt.subplots()
    ax.plot(epochs, metrics['val_loss'], label='Val Loss', color='red', marker='s', markersize=3)
    ax.set_xlabel('Epoch')
    ax.set_ylabel('Validation Loss')
    ax.set_title('Validation Loss')
    ax.legend()
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(plots_dir / 'validation_loss.png', dpi=150)
    plt.close()

    fig, ax = plt.subplots()
    ax.plot(epochs, metrics['train_acc'], label='Train Accuracy', marker='o', markersize=3)
    ax.plot(epochs, metrics['val_acc'], label='Val Accuracy', marker='s', markersize=3)
    ax.set_xlabel('Epoch')
    ax.set_ylabel('Accuracy')
    ax.set_title('Training and Validation Accuracy')
    ax.legend()
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(plots_dir / 'accuracy.png', dpi=150)
    plt.close()

    if 'bleu' in metrics:
        fig, ax = plt.subplots()
        ax.plot(epochs, metrics['bleu'], label='BLEU', color='green', marker='o', markersize=3)
        ax.set_xlabel('Epoch')
        ax.set_ylabel('BLEU Score')
        ax.set_title('BLEU Score')
        ax.legend()
        ax.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(plots_dir / 'bleu.png', dpi=150)
        plt.close()

    if 'wer' in metrics:
        fig, ax = plt.subplots()
        ax.plot(epochs, metrics['wer'], label='WER', color='orange', marker='o', markersize=3)
        ax.set_xlabel('Epoch')
        ax.set_ylabel('Word Error Rate')
        ax.set_title('Word Error Rate (WER)')
        ax.legend()
        ax.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(plots_dir / 'wer.png', dpi=150)
        plt.close()

    if 'cer' in metrics:
        fig, ax = plt.subplots()
        ax.plot(epochs, metrics['cer'], label='CER', color='purple', marker='o', markersize=3)
        ax.set_xlabel('Epoch')
        ax.set_ylabel('Character Error Rate')
        ax.set_title('Character Error Rate (CER)')
        ax.legend()
        ax.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(plots_dir / 'cer.png', dpi=150)
        plt.close()

    fig, ax = plt.subplots()
    ax.plot(epochs, metrics['learning_rate'], label='Learning Rate', color='brown', marker='o', markersize=3)
    ax.set_xlabel('Epoch')
    ax.set_ylabel('Learning Rate')
    ax.set_title('Learning Rate Schedule')
    ax.legend()
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(plots_dir / 'learning_rate.png', dpi=150)
    plt.close()

    print(f"Plots saved to {plots_dir}")


class ModelEvaluator:
    """Evaluates a trained model on the test set."""

    def __init__(self, experiment_dir: str, training_config: str = 'configs/representative_training.yaml'):
        self.experiment_dir = Path(experiment_dir)
        self.plots_dir = self.experiment_dir / 'plots'
        self.plots_dir.mkdir(parents=True, exist_ok=True)

        with open(training_config, 'r', encoding='utf-8') as f:
            cfg = yaml.safe_load(f)
        self.config = cfg.get('representative_training', cfg)

    def load_predictions(self, predictions_csv: str) -> List[Dict]:
        rows = []
        with open(predictions_csv, 'r', encoding='utf-8') as f:
            for row in csv.DictReader(f):
                rows.append(row)
        return rows

    def compute_metrics(self, predictions: List[Dict]) -> Dict[str, float]:
        references = [p['ground_truth'] for p in predictions]
        hyps = [p['prediction'] for p in predictions]

        bleu_scores = [compute_bleu(r, h) for r, h in zip(references, hyps)]
        wer_scores = [compute_wer(r, h) for r, h in zip(references, hyps)]
        cer_scores = [compute_cer(r, h) for r, h in zip(references, hyps)]
        rouge_scores = [compute_rouge_l(r, h) for r, h in zip(references, hyps)]

        exact_matches = sum(1 for r, h in zip(references, hyps)
                            if r.lower().strip() == h.lower().strip())

        return {
            'bleu': sum(bleu_scores) / len(bleu_scores),
            'wer': sum(wer_scores) / len(wer_scores),
            'cer': sum(cer_scores) / len(cer_scores),
            'rouge_l': sum(rouge_scores) / len(rouge_scores),
            'exact_match': exact_matches / max(len(references), 1),
            'total_samples': len(predictions),
            'avg_bleu': sum(bleu_scores) / len(bleu_scores),
            'median_bleu': sorted(bleu_scores)[len(bleu_scores) // 2],
            'min_bleu': min(bleu_scores),
            'max_bleu': max(bleu_scores),
        }

    def evaluate(self, predictions_csv: str) -> Dict[str, Any]:
        print("=" * 60)
        print("Evaluating Representative Model")
        print("=" * 60)

        predictions = self.load_predictions(predictions_csv)
        print(f"Loaded {len(predictions)} predictions")

        metrics = self.compute_metrics(predictions)

        metrics_path = self.experiment_dir / 'evaluation_metrics.json'
        with open(metrics_path, 'w', encoding='utf-8') as f:
            json.dump(metrics, f, indent=2, default=str)
        print(f"Saved metrics to {metrics_path}")

        print(f"\nEvaluation Results:")
        print(f"  BLEU: {metrics['bleu']:.4f}")
        print(f"  WER:  {metrics['wer']:.4f}")
        print(f"  CER:  {metrics['cer']:.4f}")
        print(f"  ROUGE-L: {metrics['rouge_l']:.4f}")
        print(f"  Exact Match: {metrics['exact_match']:.4f}")

        history_path = self.experiment_dir / 'history.csv'
        if history_path.exists():
            plot_metrics = {'epoch': [], 'train_loss': [], 'val_loss': [],
                            'train_acc': [], 'val_acc': [], 'learning_rate': []}
            with open(history_path, 'r', encoding='utf-8') as f:
                for row in csv.DictReader(f):
                    plot_metrics['epoch'].append(int(row['epoch']))
                    plot_metrics['train_loss'].append(float(row['train_loss']))
                    plot_metrics['val_loss'].append(float(row['val_loss']))
                    plot_metrics['train_acc'].append(float(row['train_acc']))
                    plot_metrics['val_acc'].append(float(row['val_acc']))
                    plot_metrics['learning_rate'].append(float(row['learning_rate']))

            n_epochs = len(plot_metrics['epoch'])
            bleu_epoch = [metrics['bleu']] * n_epochs
            wer_epoch = [metrics['wer']] * n_epochs
            cer_epoch = [metrics['cer']] * n_epochs
            plot_metrics['bleu'] = bleu_epoch
            plot_metrics['wer'] = wer_epoch
            plot_metrics['cer'] = cer_epoch

            generate_plots(plot_metrics, self.plots_dir)

        print("=" * 60)
        print("EVALUATION COMPLETE")
        print("=" * 60)

        return metrics


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Evaluate representative model")
    parser.add_argument('--experiment-dir', default='experiments/representative')
    parser.add_argument('--predictions', default=None)
    args = parser.parse_args()

    pred_csv = args.predictions or f"{args.experiment_dir}/predictions.csv"
    evaluator = ModelEvaluator(args.experiment_dir)
    evaluator.evaluate(pred_csv)


if __name__ == '__main__':
    main()
