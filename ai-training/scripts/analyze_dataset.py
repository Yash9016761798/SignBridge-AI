"""
Dataset Analysis Script for SignBridge AI Training.

This script performs comprehensive analysis of the ISL gesture dataset.
It generates reports on class distribution, video quality, frame counts,
and data integrity issues.

DO NOT assume local files exist. Dataset source is always from configuration.
"""

import sys
import logging
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np
import pandas as pd

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from utils import load_config, get_project_root, resolve_dataset_path, setup_logging

logger = logging.getLogger(__name__)


# =============================================================================
# ANALYSIS FUNCTIONS
# =============================================================================

def analyze_dataset_structure(dataset_source: str, config: Dict) -> Dict:
    """Analyze the overall structure of the dataset.

    Args:
        dataset_source: "huggingface", "local", or "gdrive".
        config: Dataset configuration.

    Returns:
        Dictionary with analysis results.
    """
    results = {
        "source_type": dataset_source,
        "total_samples": 0,
        "num_classes": 0,
        "class_distribution": {},
        "avg_frames_per_video": 0.0,
        "min_frames": 0,
        "max_frames": 0,
        "frame_resolution": None,
        "issues": [],
    }

    if dataset_source == "huggingface":
        results = analyze_huggingface_dataset(config, results)
    elif dataset_source in ("local", "gdrive"):
        results = analyze_local_dataset(config, results)
    else:
        results["issues"].append(f"Unknown source type: {dataset_source}")

    return results


def analyze_huggingface_dataset(config: Dict, results: Dict) -> Dict:
    """Analyze HuggingFace dataset (Exploration-Lab/iSign).

    Note: This performs streaming analysis — downloads are minimal.
    """
    logger.info("Analyzing HuggingFace dataset (streaming)...")

    try:
        from datasets import load_dataset

        hf_config = config["source"]["huggingface"]
        dataset = load_dataset(
            hf_config["repo_id"],
            split=hf_config.get("split", "train"),
            streaming=True,
            trust_remote_code=hf_config.get("trust_remote_code", True),
        )

        # Stream through dataset to collect stats
        labels = []
        frame_counts = []
        sample_count = 0

        for i, sample in enumerate(dataset):
            sample_count += 1

            # Collect label
            label = sample.get("label") or sample.get("class") or sample.get("gesture")
            if label is not None:
                labels.append(str(label))

            # Count frames if video data is available
            video = sample.get("video") or sample.get("pixel_values")
            if video is not None:
                if hasattr(video, "shape"):
                    frame_counts.append(video.shape[0] if len(video.shape) > 3 else 1)
                elif isinstance(video, list):
                    frame_counts.append(len(video))

            if sample_count >= 1000:
                logger.info("Sampled 1000 samples for analysis (streaming mode)")
                break

        results["total_samples"] = sample_count
        if labels:
            results["num_classes"] = len(set(labels))
            results["class_distribution"] = dict(pd.Series(labels).value_counts())
        if frame_counts:
            results["avg_frames_per_video"] = float(np.mean(frame_counts))
            results["min_frames"] = int(np.min(frame_counts))
            results["max_frames"] = int(np.max(frame_counts))

        logger.info(f"HuggingFace analysis complete: {sample_count} samples, {results['num_classes']} classes")

    except Exception as e:
        results["issues"].append(f"HuggingFace analysis error: {str(e)}")
        logger.error(f"Failed to analyze HuggingFace dataset: {e}")

    return results


def analyze_local_dataset(config: Dict, results: Dict) -> Dict:
    """Analyze locally stored dataset.

    Expects directory structure:
    root/
        class1/
            video1.mp4
            video2.mp4
        class2/
            video3.mp4
    """
    logger.info("Analyzing local dataset...")

    root_dir = resolve_dataset_path(config)
    if root_dir is None or not root_dir.exists():
        results["issues"].append(f"Local dataset directory not found: {root_dir}")
        return results

    try:
        import cv2

        video_extensions = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
        classes = {}
        frame_counts = []
        resolutions = set()

        for class_dir in sorted(root_dir.iterdir()):
            if not class_dir.is_dir():
                continue

            class_name = class_dir.name
            video_files = [
                f for f in class_dir.iterdir()
                if f.is_file() and f.suffix.lower() in video_extensions
            ]
            classes[class_name] = len(video_files)

            for video_path in video_files[:10]:  # Sample first 10 per class
                try:
                    cap = cv2.VideoCapture(str(video_path))
                    if cap.isOpened():
                        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                        frame_counts.append(frame_count)
                        resolutions.add((width, height))
                    cap.release()
                except Exception:
                    continue

        results["total_samples"] = sum(classes.values())
        results["num_classes"] = len(classes)
        results["class_distribution"] = classes
        if frame_counts:
            results["avg_frames_per_video"] = float(np.mean(frame_counts))
            results["min_frames"] = int(np.min(frame_counts))
            results["max_frames"] = int(np.max(frame_counts))
        if resolutions:
            results["frame_resolution"] = list(resolutions)

        logger.info(f"Local analysis complete: {results['total_samples']} samples, {results['num_classes']} classes")

    except ImportError:
        results["issues"].append("opencv-python not installed (required for local video analysis)")
    except Exception as e:
        results["issues"].append(f"Local analysis error: {str(e)}")

    return results


def check_data_integrity(results: Dict, config: Dict) -> List[str]:
    """Check for common data quality issues.

    Args:
        results: Analysis results dictionary.
        config: Dataset configuration.

    Returns:
        List of issues found.
    """
    issues = []

    min_samples = config.get("classes", {}).get("min_samples_per_class", 10)
    for cls, count in results.get("class_distribution", {}).items():
        if count < min_samples:
            issues.append(f"Class '{cls}' has only {count} samples (min: {min_samples})")

    if results.get("avg_frames_per_video", 0) == 0:
        issues.append("No frame information available")

    return issues


def generate_analysis_report(results: Dict, output_path: Optional[Path] = None) -> str:
    """Generate a human-readable analysis report.

    Args:
        results: Analysis results dictionary.
        output_path: Optional path to save the report.

    Returns:
        Report as string.
    """
    lines = [
        "=" * 60,
        "DATASET ANALYSIS REPORT",
        "=" * 60,
        f"Source Type:     {results['source_type']}",
        f"Total Samples:   {results['total_samples']}",
        f"Num Classes:     {results['num_classes']}",
        f"Avg Frames/Video: {results['avg_frames_per_video']:.1f}",
        f"Min Frames:      {results['min_frames']}",
        f"Max Frames:      {results['max_frames']}",
        "",
        "CLASS DISTRIBUTION:",
    ]

    for cls, count in sorted(results.get("class_distribution", {}).items(), key=lambda x: -x[1]):
        lines.append(f"  {cls:30s} {count:6d}")

    if results.get("issues"):
        lines.extend(["", "ISSUES FOUND:"])
        for issue in results["issues"]:
            lines.append(f"  - {issue}")

    lines.append("=" * 60)

    report = "\n".join(lines)

    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(report, encoding="utf-8")
        logger.info(f"Report saved to {output_path}")

    return report


# =============================================================================
# MAIN
# =============================================================================

def main():
    """Run dataset analysis from CLI."""
    setup_logging(level="INFO")

    config = load_config("dataset")
    source_type = config["source"]["type"]

    logger.info(f"Starting dataset analysis (source: {source_type})")

    results = analyze_dataset_structure(source_type, config)

    integrity_issues = check_data_integrity(results, config)
    results["issues"].extend(integrity_issues)

    report = generate_analysis_report(results)
    print(report)

    # Save report
    output_path = get_project_root() / "experiments" / "dataset_analysis.txt"
    generate_analysis_report(results, output_path)

    return results


if __name__ == "__main__":
    main()
