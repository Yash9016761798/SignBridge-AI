"""
Verify Representative Training Pipeline for SignBridge AI.
Checks every stage: dataset creation, sampling, training, evaluation,
plots, reports, predictions. Returns PASS only on full completion.
"""
import sys
import os
import json
import csv
import yaml
from pathlib import Path
from typing import List, Tuple

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


class PipelineVerifier:
    """Verifies the complete representative training pipeline."""

    def __init__(self):
        self.results: List[Tuple[str, bool, str]] = []
        self.base_dir = Path(__file__).resolve().parent.parent
        self.dataset_dir = self.base_dir / 'datasets' / 'representative'
        self.experiment_dir = self.base_dir / 'experiments' / 'representative'

    def check(self, name: str, condition: bool, detail: str):
        status = "PASS" if condition else "FAIL"
        self.results.append((name, condition, detail))
        print(f"  [{status}] {name}: {detail}")

    def verify_dataset_creation(self):
        print("\n1. Dataset Creation")
        print("-" * 40)

        self.check(
            "train.csv exists",
            (self.dataset_dir / 'train.csv').exists(),
            f"path={self.dataset_dir / 'train.csv'}"
        )
        self.check(
            "validation.csv exists",
            (self.dataset_dir / 'validation.csv').exists(),
            f"path={self.dataset_dir / 'validation.csv'}"
        )
        self.check(
            "test.csv exists",
            (self.dataset_dir / 'test.csv').exists(),
            f"path={self.dataset_dir / 'test.csv'}"
        )
        self.check(
            "metadata.json exists",
            (self.dataset_dir / 'metadata.json').exists(),
            f"path={self.dataset_dir / 'metadata.json'}"
        )

    def verify_sampling(self):
        print("\n2. Sampling Verification")
        print("-" * 40)

        meta_path = self.dataset_dir / 'metadata.json'
        if not meta_path.exists():
            self.check("metadata readable", False, "metadata.json not found")
            return

        with open(meta_path, 'r', encoding='utf-8') as f:
            meta = json.load(f)

        total = meta.get('total_sampled', 0)
        self.check(
            "target size reached",
            total >= 100,
            f"total={total}, expected>=100 (10K+ with full iSign CSV)"
        )

        train_size = meta.get('train_size', 0)
        val_size = meta.get('validation_size', 0)
        test_size = meta.get('test_size', 0)

        self.check(
            "train/val/test sizes valid",
            train_size > 0 and val_size > 0 and test_size > 0,
            f"train={train_size}, val={val_size}, test={test_size}"
        )

        train_ratio = meta.get('train_ratio', 0)
        val_ratio = meta.get('validation_ratio', 0)
        test_ratio = meta.get('test_ratio', 0)

        self.check(
            "ratios sum to 1.0",
            abs(train_ratio + val_ratio + test_ratio - 1.0) < 0.01,
            f"train={train_ratio}, val={val_ratio}, test={test_ratio}"
        )

        vocab = meta.get('unique_vocab', 0)
        self.check(
            "vocabulary diversity",
            vocab > 100,
            f"unique_vocab={vocab}"
        )

        sent_stats = meta.get('sentence_stats', {})
        self.check(
            "sentence stats present",
            'overall' in sent_stats and 'train' in sent_stats,
            f"keys={list(sent_stats.keys())}"
        )

    def verify_csv_format(self):
        print("\n3. CSV Format Verification")
        print("-" * 40)

        for split in ['train.csv', 'validation.csv', 'test.csv']:
            csv_path = self.dataset_dir / split
            if not csv_path.exists():
                self.check(f"{split} readable", False, "file not found")
                continue

            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                rows = list(reader)

            has_uid = all('uid' in r for r in rows)
            has_text = all('text' in r for r in rows)
            non_empty = all(r.get('text', '').strip() for r in rows)

            self.check(
                f"{split} has uid column",
                has_uid,
                f"rows={len(rows)}"
            )
            self.check(
                f"{split} has text column",
                has_text,
                f"rows={len(rows)}"
            )
            self.check(
                f"{split} text non-empty",
                non_empty,
                f"empty_rows={sum(1 for r in rows if not r.get('text', '').strip())}"
            )

    def verify_training(self):
        print("\n4. Training Verification")
        print("-" * 40)

        exp = self.experiment_dir
        self.check(
            "experiment dir exists",
            exp.exists(),
            f"path={exp}"
        )

        ckpt_dir = exp / 'checkpoints'
        self.check(
            "checkpoint dir exists",
            ckpt_dir.exists(),
            f"path={ckpt_dir}"
        )

        best_pt = ckpt_dir / 'best.pt'
        self.check(
            "best.pt checkpoint exists",
            best_pt.exists(),
            f"size={best_pt.stat().st_size if best_pt.exists() else 0} bytes"
        )

        latest_pt = ckpt_dir / 'latest.pt'
        self.check(
            "latest.pt checkpoint exists",
            latest_pt.exists(),
            f"size={latest_pt.stat().st_size if latest_pt.exists() else 0} bytes"
        )

        history_csv = exp / 'history.csv'
        self.check(
            "history.csv exists",
            history_csv.exists(),
            f"path={history_csv}"
        )

        if history_csv.exists():
            with open(history_csv, 'r', encoding='utf-8') as f:
                rows = list(csv.DictReader(f))
            self.check(
                "history has epochs",
                len(rows) > 0,
                f"epochs={len(rows)}"
            )

            has_loss = 'train_loss' in rows[0] and 'val_loss' in rows[0]
            self.check(
                "history has loss columns",
                has_loss,
                f"columns={list(rows[0].keys())}"
            )

        metrics_json = exp / 'metrics.json'
        self.check(
            "metrics.json exists",
            metrics_json.exists(),
            f"path={metrics_json}"
        )

        if metrics_json.exists():
            with open(metrics_json, 'r', encoding='utf-8') as f:
                metrics = json.load(f)
            self.check(
                "metrics has best_val_loss",
                'best_val_loss' in metrics,
                f"keys={list(metrics.keys())}"
            )
            self.check(
                "metrics has training time",
                'total_training_time' in metrics,
                f"time={metrics.get('total_training_time', 0):.1f}s"
            )

    def verify_evaluation(self):
        print("\n5. Evaluation Verification")
        print("-" * 40)

        eval_json = self.experiment_dir / 'evaluation_metrics.json'
        self.check(
            "evaluation_metrics.json exists",
            eval_json.exists(),
            f"path={eval_json}"
        )

        if eval_json.exists():
            with open(eval_json, 'r', encoding='utf-8') as f:
                metrics = json.load(f)

            for metric in ['bleu', 'wer', 'cer', 'rouge_l', 'exact_match']:
                self.check(
                    f"metric {metric} present",
                    metric in metrics,
                    f"{metric}={metrics.get(metric, 'N/A')}"
                )

            self.check(
                "total_samples > 0",
                metrics.get('total_samples', 0) > 0,
                f"total={metrics.get('total_samples', 0)}"
            )

    def verify_plots(self):
        print("\n6. Plots Verification")
        print("-" * 40)

        plots_dir = self.experiment_dir / 'plots'
        self.check(
            "plots dir exists",
            plots_dir.exists(),
            f"path={plots_dir}"
        )

        expected_plots = [
            'training_loss.png', 'validation_loss.png', 'accuracy.png',
            'learning_rate.png', 'bleu.png', 'wer.png', 'cer.png'
        ]

        for plot in expected_plots:
            plot_path = plots_dir / plot
            self.check(
                f"{plot} exists",
                plot_path.exists(),
                f"size={plot_path.stat().st_size if plot_path.exists() else 0} bytes"
            )

    def verify_predictions(self):
        print("\n7. Predictions Verification")
        print("-" * 40)

        pred_csv = self.experiment_dir / 'predictions.csv'
        self.check(
            "predictions.csv exists",
            pred_csv.exists(),
            f"path={pred_csv}"
        )

        if pred_csv.exists():
            with open(pred_csv, 'r', encoding='utf-8') as f:
                rows = list(csv.DictReader(f))

            required_cols = ['uid', 'ground_truth', 'prediction', 'bleu', 'wer', 'cer']
            has_cols = all(col in rows[0] for col in required_cols)
            self.check(
                "predictions has required columns",
                has_cols,
                f"columns={list(rows[0].keys())}"
            )

            self.check(
                "predictions has rows",
                len(rows) > 0,
                f"rows={len(rows)}"
            )

            bleu_vals = [float(r['bleu']) for r in rows]
            self.check(
                "BLEU scores in valid range",
                all(0 <= v <= 1 for v in bleu_vals),
                f"min={min(bleu_vals):.4f}, max={max(bleu_vals):.4f}"
            )

    def verify_report(self):
        print("\n8. Report Verification")
        print("-" * 40)

        report_md = self.experiment_dir / 'report.md'
        self.check(
            "report.md exists",
            report_md.exists(),
            f"path={report_md}"
        )

        if report_md.exists():
            content = report_md.read_text(encoding='utf-8')
            self.check(
                "report has content",
                len(content) > 500,
                f"length={len(content)} chars"
            )

            required_sections = [
                'Dataset Statistics', 'Training Summary',
                'Evaluation Metrics', 'Sample Predictions'
            ]
            for section in required_sections:
                self.check(
                    f"report has '{section}'",
                    section.lower() in content.lower(),
                    f"found={section.lower() in content.lower()}"
                )

    def verify_scripts(self):
        print("\n9. Scripts Verification")
        print("-" * 40)

        scripts = [
            'build_representative_dataset.py',
            'run_representative_training.py',
            'evaluate_representative_model.py',
            'generate_predictions.py',
        ]

        scripts_dir = self.base_dir / 'scripts'
        for script in scripts:
            script_path = scripts_dir / script
            self.check(
                f"{script} exists",
                script_path.exists(),
                f"path={script_path}"
            )

    def verify_configs(self):
        print("\n10. Configs Verification")
        print("-" * 40)

        configs = [
            'representative_dataset.yaml',
            'representative_training.yaml',
        ]

        configs_dir = self.base_dir / 'configs'
        for cfg in configs:
            cfg_path = configs_dir / cfg
            self.check(
                f"{cfg} exists",
                cfg_path.exists(),
                f"path={cfg_path}"
            )

            if cfg_path.exists():
                with open(cfg_path, 'r', encoding='utf-8') as f:
                    data = yaml.safe_load(f)
                self.check(
                    f"{cfg} is valid YAML",
                    data is not None,
                    f"keys={list(data.keys()) if data else 'None'}"
                )

    def run_all(self) -> bool:
        print("=" * 60)
        print("REPRESENTATIVE PIPELINE VERIFICATION")
        print("=" * 60)

        self.verify_scripts()
        self.verify_configs()
        self.verify_dataset_creation()
        self.verify_sampling()
        self.verify_csv_format()
        self.verify_training()
        self.verify_evaluation()
        self.verify_plots()
        self.verify_predictions()
        self.verify_report()

        passed = sum(1 for _, ok, _ in self.results if ok)
        failed = sum(1 for _, ok, _ in self.results if not ok)
        total = len(self.results)

        print("\n" + "=" * 60)
        print(f"RESULTS: {passed}/{total} passed, {failed} failed")
        print("=" * 60)

        if failed > 0:
            print("\nFailed checks:")
            for name, ok, detail in self.results:
                if not ok:
                    print(f"  [FAIL] {name}: {detail}")

        overall = "PASS" if failed == 0 else "FAIL"
        print(f"\nOverall: {overall}")

        return failed == 0


def main():
    verifier = PipelineVerifier()
    success = verifier.run_all()
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
