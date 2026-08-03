"""
Build Representative Dataset for SignBridge AI.
Performs stratified sampling from iSign_v1.1.csv to create a
10K-20K sample dataset preserving sentence length distribution,
vocabulary diversity, and frequency patterns.
"""
import sys
import os
import json
import csv
import math
import yaml
import random
import argparse
from pathlib import Path
from collections import Counter, defaultdict
from typing import List, Dict, Tuple, Any

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


class RepresentativeDatasetBuilder:
    """Builds a representative subset of iSign via stratified sampling."""

    def __init__(self, config_path: str):
        with open(config_path, 'r', encoding='utf-8') as f:
            cfg = yaml.safe_load(f)
        self.config = cfg.get('representative_dataset', cfg)

        self.source_csv = self.config['source_csv']
        self.output_dir = Path(self.config['output_dir'])
        self.seed = self.config.get('seed', 42)
        self.target_size = self.config.get('target_size', 15000)
        self.train_ratio = self.config.get('train_ratio', 0.8)
        self.validation_ratio = self.config.get('validation_ratio', 0.1)
        self.test_ratio = self.config.get('test_ratio', 0.1)

        strat = self.config.get('stratification', {})
        self.primary_key = strat.get('primary', 'sentence_length')
        self.secondary_key = strat.get('secondary', 'word_count')

        self.length_bins = self.config.get('sentence_length_bins', [
            [1, 5], [6, 10], [11, 15], [16, 20], [21, 50]
        ])
        self.min_per_bin = self.config.get('min_samples_per_bin', 100)
        self.max_per_bin = self.config.get('max_samples_per_bin', 5000)
        self.fallback = self.config.get('fallback_strategy', 'uniform')

        random.seed(self.seed)

    def load_csv(self) -> List[Dict[str, str]]:
        csv_path = Path(self.source_csv)
        if not csv_path.exists():
            print(f"Source CSV not found at {csv_path}, downloading from HuggingFace...")
            self._download_csv(csv_path)

        rows = []
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('text', '').strip():
                    rows.append(row)
        print(f"Loaded {len(rows)} rows from {csv_path}")
        return rows

    def _download_csv(self, dest_path: Path):
        import urllib.request
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        url = "https://huggingface.co/datasets/Exploration-Lab/iSign/resolve/main/iSign_v1.1.csv"
        print(f"Downloading from {url}...")
        try:
            urllib.request.urlretrieve(url, str(dest_path))
            print(f"Downloaded to {dest_path}")
        except Exception as e:
            print(f"Download failed: {e}")
            print("Falling back to dev manifest...")
            self._fallback_to_dev(dest_path)

    def _fallback_to_dev(self, dest_path: Path):
        dev_manifest = Path('datasets/dev/manifest.csv')
        if dev_manifest.exists():
            import shutil
            shutil.copy(str(dev_manifest), str(dest_path))
            print(f"Copied dev manifest to {dest_path}")
        else:
            raise FileNotFoundError(
                f"Cannot find source CSV or dev manifest. "
                f"Please place iSign_v1.1.csv at {dest_path}"
            )

    def analyze(self, rows: List[Dict[str, str]]) -> Dict[str, Any]:
        lengths = [len(r['text'].split()) for r in rows]
        word_freq = Counter()
        for r in rows:
            word_freq.update(r['text'].lower().split())

        vocab = set(word_freq.keys())
        stats = {
            'total_rows': len(rows),
            'unique_vocab': len(vocab),
            'total_tokens': sum(word_freq.values()),
            'avg_sentence_length': sum(lengths) / len(lengths),
            'min_sentence_length': min(lengths),
            'max_sentence_length': max(lengths),
            'median_sentence_length': sorted(lengths)[len(lengths) // 2],
            'top_20_words': word_freq.most_common(20),
            'sentence_length_distribution': {},
        }

        bin_counts = Counter()
        for length in lengths:
            placed = False
            for lo, hi in self.length_bins:
                if lo <= length <= hi:
                    bin_counts[f"{lo}-{hi}"] += 1
                    placed = True
                    break
            if not placed:
                bin_counts[f">{self.length_bins[-1][1]}"] += 1

        stats['sentence_length_distribution'] = dict(bin_counts)
        stats['length_bin_counts'] = dict(bin_counts)
        stats['word_frequency'] = dict(word_freq.most_common(200))

        return stats

    def _get_bin_key(self, text: str) -> str:
        wc = len(text.split())
        for lo, hi in self.length_bins:
            if lo <= wc <= hi:
                return f"{lo}-{hi}"
        return f">{self.length_bins[-1][1]}"

    def stratified_sample(self, rows: List[Dict[str, str]],
                          stats: Dict[str, Any]) -> List[Dict[str, str]]:
        bin_rows = defaultdict(list)
        for r in rows:
            key = self._get_bin_key(r['text'])
            bin_rows[key].append(r)

        total = min(self.target_size, len(rows))
        sampled = []

        for bin_key, bin_row_list in bin_rows.items():
            proportion = len(bin_row_list) / len(rows)
            n = int(total * proportion)
            n = min(n, len(bin_row_list))
            n = max(1, n)
            sampled.extend(random.sample(bin_row_list, n))

        if len(sampled) < total:
            remaining = [r for r in rows if r not in sampled]
            needed = total - len(sampled)
            if remaining:
                sampled.extend(random.sample(remaining, min(needed, len(remaining))))

        if len(sampled) > total:
            sampled = random.sample(sampled, total)

        random.shuffle(sampled)
        print(f"Sampled {len(sampled)} rows from {len(rows)} total")
        return sampled

    def split(self, sampled: List[Dict[str, str]]) -> Tuple[
        List[Dict[str, str]], List[Dict[str, str]], List[Dict[str, str]]
    ]:
        n = len(sampled)
        n_train = int(n * self.train_ratio)
        n_val = int(n * self.validation_ratio)

        train = sampled[:n_train]
        val = sampled[n_train:n_train + n_val]
        test = sampled[n_train + n_val:]

        print(f"Split: train={len(train)}, val={len(val)}, test={len(test)}")
        return train, val, test

    def save_split(self, split_rows: List[Dict[str, str]], filename: str):
        path = self.output_dir / filename
        with open(path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['uid', 'text'])
            writer.writeheader()
            writer.writerows(split_rows)
        print(f"Saved {len(split_rows)} rows to {path}")

    def build_metadata(self, stats: Dict[str, Any],
                        train: List, val: List, test: List) -> Dict[str, Any]:
        all_words = []
        for r in train + val + test:
            all_words.extend(r['text'].lower().split())
        word_freq = Counter(all_words)
        freq_dist = Counter()
        for w, c in word_freq.items():
            if c == 1:
                freq_dist['hapax_legomena'] += 1
            elif c <= 5:
                freq_dist['low_freq'] += 1
            elif c <= 20:
                freq_dist['mid_freq'] += 1
            else:
                freq_dist['high_freq'] += 1

        all_lengths = [len(r['text'].split()) for r in train + val + test]
        train_lengths = [len(r['text'].split()) for r in train]
        val_lengths = [len(r['text'].split()) for r in val]
        test_lengths = [len(r['text'].split()) for r in test]

        return {
            'version': '1.0',
            'source': 'Exploration-Lab/iSign',
            'seed': self.seed,
            'total_sampled': len(train) + len(val) + len(test),
            'train_size': len(train),
            'validation_size': len(val),
            'test_size': len(test),
            'train_ratio': self.train_ratio,
            'validation_ratio': self.validation_ratio,
            'test_ratio': self.test_ratio,
            'unique_vocab': len(set(w for r in train + val + test for w in r['text'].lower().split())),
            'total_tokens': len(all_words),
            'sentence_stats': {
                'overall': {
                    'mean': sum(all_lengths) / len(all_lengths),
                    'min': min(all_lengths),
                    'max': max(all_lengths),
                    'median': sorted(all_lengths)[len(all_lengths) // 2],
                },
                'train': {
                    'mean': sum(train_lengths) / max(len(train_lengths), 1),
                    'min': min(train_lengths) if train_lengths else 0,
                    'max': max(train_lengths) if train_lengths else 0,
                },
                'validation': {
                    'mean': sum(val_lengths) / max(len(val_lengths), 1),
                    'min': min(val_lengths) if val_lengths else 0,
                    'max': max(val_lengths) if val_lengths else 0,
                },
                'test': {
                    'mean': sum(test_lengths) / max(len(test_lengths), 1),
                    'min': min(test_lengths) if test_lengths else 0,
                    'max': max(test_lengths) if test_lengths else 0,
                },
            },
            'vocabulary_stats': {
                'total_words': len(word_freq),
                'hapax_legomena': freq_dist['hapax_legomena'],
                'low_freq': freq_dist['low_freq'],
                'mid_freq': freq_dist['mid_freq'],
                'high_freq': freq_dist['high_freq'],
                'top_50_words': word_freq.most_common(50),
            },
            'stratification': {
                'primary': self.primary_key,
                'secondary': self.secondary_key,
                'bins': self.length_bins,
                'min_per_bin': self.min_per_bin,
                'max_per_bin': self.max_per_bin,
            },
            'analysis_stats': stats,
        }

    def build(self):
        print("=" * 60)
        print("Building Representative Dataset")
        print("=" * 60)

        self.output_dir.mkdir(parents=True, exist_ok=True)

        rows = self.load_csv()
        stats = self.analyze(rows)
        sampled = self.stratified_sample(rows, stats)
        train, val, test = self.split(sampled)

        self.save_split(train, 'train.csv')
        self.save_split(val, 'validation.csv')
        self.save_split(test, 'test.csv')

        metadata = self.build_metadata(stats, train, val, test)
        meta_path = self.output_dir / 'metadata.json'
        with open(meta_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, default=str)
        print(f"Saved metadata to {meta_path}")

        print("=" * 60)
        print("Dataset Statistics")
        print(f"  Total sampled: {metadata['total_sampled']}")
        print(f"  Train: {metadata['train_size']}")
        print(f"  Validation: {metadata['validation_size']}")
        print(f"  Test: {metadata['test_size']}")
        print(f"  Unique vocab: {metadata['unique_vocab']}")
        print(f"  Mean sentence length: {metadata['sentence_stats']['overall']['mean']:.1f}")
        print("=" * 60)
        print("BUILD COMPLETE")


def main():
    parser = argparse.ArgumentParser(description="Build representative dataset")
    parser.add_argument('--config', default='configs/representative_dataset.yaml')
    args = parser.parse_args()

    builder = RepresentativeDatasetBuilder(args.config)
    builder.build()


if __name__ == '__main__':
    main()
