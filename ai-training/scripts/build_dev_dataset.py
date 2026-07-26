"""
Phase 9: Build Development Dataset from Exploration-Lab/iSign

Creates a small development dataset by:
1. Reading iSign_v1.1.csv
2. Randomly selecting N unique video IDs
3. Downloading ONLY the required videos and pose files
4. Storing everything in datasets/dev/
5. Generating manifest.csv, statistics.json, and README.md

Usage:
    python scripts/build_dev_dataset.py
    python scripts/build_dev_dataset.py --config configs/dev_dataset.yaml
    python scripts/build_dev_dataset.py --sample-size 25
    python scripts/build_dev_dataset.py --sample-size 100 --seed 123
"""

import argparse
import json
import logging
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Optional

import pandas as pd
import yaml

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CONFIG = PROJECT_ROOT / "configs" / "dev_dataset.yaml"

# HuggingFace cache path
HF_CACHE = Path(r"C:\Users\Gaurav Gopal Gosavi\.cache\huggingface\hub")
HF_SNAPSHOT = HF_CACHE / "datasets--Exploration-Lab--iSign" / "snapshots" / "e4ee6c5f0d9dfcbc74205e3f1388ce94da26c298"


def load_config(config_path: Optional[Path] = None, sample_size: Optional[int] = None, seed: Optional[int] = None) -> dict:
    """Load configuration from YAML file with CLI overrides."""
    config_path = config_path or DEFAULT_CONFIG
    logger.info(f"Loading config from: {config_path}")

    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    # CLI overrides
    if sample_size is not None:
        config["sample_size"] = sample_size
    if seed is not None:
        config["random_seed"] = seed

    logger.info(f"Sample size: {config['sample_size']}, Seed: {config['random_seed']}")
    return config


def load_csv(config: dict) -> pd.DataFrame:
    """Load the iSign CSV from local cache."""
    csv_path = Path(config["source"]["local_csv_path"])
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    logger.info(f"Loading CSV from: {csv_path}")
    df = pd.read_csv(csv_path, encoding="utf-8")
    logger.info(f"Loaded {len(df):,} rows, columns: {list(df.columns)}")
    return df


def select_samples(df: pd.DataFrame, config: dict) -> pd.DataFrame:
    """Randomly select N unique video IDs and return all rows for those IDs."""
    uid_col = config["source"]["uid_column"]
    n_samples = config["sample_size"]
    seed = config["random_seed"]

    # Extract base IDs (strip trailing -N suffix)
    df["_base_id"] = df[uid_col].astype(str).str.rsplit("-", n=1).str[0]
    unique_base_ids = df["_base_id"].unique()

    logger.info(f"Total unique base IDs: {len(unique_base_ids)}")
    logger.info(f"Selecting {n_samples} unique base IDs with seed={seed}")

    # Random selection
    rng = np.random.RandomState(seed)
    selected_ids = rng.choice(unique_base_ids, size=min(n_samples, len(unique_base_ids)), replace=False)
    logger.info(f"Selected {len(selected_ids)} unique base IDs")

    # Filter DataFrame
    selected_df = df[df["_base_id"].isin(selected_ids)].copy()
    selected_df.drop(columns=["_base_id"], inplace=True)
    logger.info(f"Selected {len(selected_df)} rows across {len(selected_ids)} videos")

    return selected_df, list(selected_ids)


# numpy import needed for RandomState
import numpy as np


def create_output_dirs(config: dict) -> Path:
    """Create output directory structure."""
    root = Path(config["output"]["root_dir"])
    dirs = [
        root,
        root / config["output"]["videos_dir"],
        root / config["output"]["poses_dir"],
        root / config["output"]["metadata_dir"],
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created directory: {d}")
    return root


def save_metadata(selected_df: pd.DataFrame, selected_ids: list, config: dict) -> Path:
    """Save metadata CSV and selected IDs."""
    root = Path(config["output"]["root_dir"])
    meta_dir = root / config["output"]["metadata_dir"]

    # Save full metadata
    manifest_path = root / config["output"]["manifest_csv"]
    selected_df.to_csv(manifest_path, index=False)
    logger.info(f"Saved manifest: {manifest_path}")

    # Save selected IDs list
    ids_path = meta_dir / "selected_video_ids.json"
    with open(ids_path, "w", encoding="utf-8") as f:
        json.dump({
            "sample_size": config["sample_size"],
            "random_seed": config["random_seed"],
            "unique_video_ids": selected_ids,
            "total_rows": len(selected_df),
            "generated_at": datetime.now().isoformat(),
        }, f, indent=2)
    logger.info(f"Saved selected IDs: {ids_path}")

    # Save subset CSV per video
    uid_col = config["source"]["uid_column"]
    text_col = config["source"]["text_column"]
    for base_id in selected_ids:
        video_rows = selected_df[selected_df[uid_col].str.startswith(base_id)]
        if not video_rows.empty:
            video_meta_path = meta_dir / f"{base_id}.csv"
            video_rows.to_csv(video_meta_path, index=False)

    logger.info(f"Saved per-video metadata for {len(selected_ids)} videos")
    return manifest_path


def download_hf_file(repo_id: str, filename: str, repo_type: str = "dataset") -> Path:
    """Download a file from HuggingFace Hub."""
    from huggingface_hub import hf_hub_download

    logger.info(f"Downloading: {filename} from {repo_id}")
    path = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        repo_type=repo_type,
    )
    logger.info(f"Downloaded to: {path}")
    return Path(path)


def concatenate_parts(part_files: list, output_zip: Path, repo_id: str, repo_type: str) -> Path:
    """Download part files and concatenate into a single zip."""
    if output_zip.exists():
        logger.info(f"Combined zip already exists: {output_zip}")
        return output_zip

    logger.info(f"Concatenating {len(part_files)} parts into: {output_zip}")

    with open(output_zip, "wb") as outfile:
        for i, part_name in enumerate(part_files):
            logger.info(f"  Downloading part {i+1}/{len(part_files)}: {part_name}")
            part_path = download_hf_file(repo_id, part_name, repo_type)

            with open(part_path, "rb") as infile:
                shutil.copyfileobj(infile, outfile)

            logger.info(f"  Appended part {i+1}: {part_path}")

    logger.info(f"Combined zip created: {output_zip} ({output_zip.stat().st_size / (1024**3):.2f} GB)")
    return output_zip


def extract_files_from_zip(
    zip_path: Path,
    selected_ids: list,
    output_dir: Path,
    file_extension: str,
    zip_inner_prefix: str = "",
) -> dict:
    """Extract specific files from a zip archive.

    Returns dict mapping base_id -> extracted file path.
    """
    extracted = {}
    not_found = []

    logger.info(f"Opening zip: {zip_path}")
    logger.info(f"Looking for {len(selected_ids)} files with extension: {file_extension}")

    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            # List all files in zip
            all_files = zf.namelist()
            logger.info(f"Total files in zip: {len(all_files)}")

            # Build lookup: base_id -> zip entry
            # Video files are typically named like: {base_id}.mp4 or videos/{base_id}.mp4
            zip_lookup = {}
            for entry in all_files:
                entry_name = Path(entry).name
                entry_stem = Path(entry_name).stem
                zip_lookup[entry_stem] = entry

            # Extract selected files
            for base_id in selected_ids:
                # Try different naming patterns
                possible_names = [
                    f"{base_id}{file_extension}",
                    f"{base_id}{file_extension}".replace("-", "_"),
                    f"{base_id}{file_extension}".replace("_", "-"),
                ]

                found = False
                for name in possible_names:
                    stem = Path(name).stem
                    if stem in zip_lookup:
                        zip_entry = zip_lookup[stem]
                        out_path = output_dir / Path(zip_entry).name

                        if not out_path.exists():
                            logger.info(f"  Extracting: {zip_entry} -> {out_path}")
                            with zf.open(zip_entry) as src, open(out_path, "wb") as dst:
                                dst.write(src.read())
                        else:
                            logger.info(f"  Already exists: {out_path}")

                        extracted[base_id] = out_path
                        found = True
                        break

                if not found:
                    not_found.append(base_id)
                    logger.warning(f"  Not found in zip: {base_id}")

    except zipfile.BadZipFile as e:
        logger.error(f"Bad zip file: {zip_path} - {e}")
        raise

    logger.info(f"Extracted: {len(extracted)}, Not found: {len(not_found)}")
    if not_found:
        logger.warning(f"Missing files for base IDs: {not_found[:10]}...")

    return {"extracted": extracted, "not_found": not_found}


def download_and_extract_videos(selected_ids: list, config: dict) -> dict:
    """Download video parts, concatenate, and extract selected videos."""
    repo_id = config["source"]["repo_id"]
    repo_type = config["source"]["repo_type"]
    video_config = config["videos"]

    output_root = Path(config["output"]["root_dir"])
    videos_dir = output_root / config["output"]["videos_dir"]

    # Create temp dir for combined zip
    temp_dir = output_root / "_temp"
    temp_dir.mkdir(exist_ok=True)
    combined_zip = temp_dir / video_config["combined_zip"]

    # Concatenate parts
    concatenate_parts(
        video_config["part_files"],
        combined_zip,
        repo_id,
        repo_type,
    )

    # Extract videos
    result = extract_files_from_zip(
        combined_zip,
        selected_ids,
        videos_dir,
        video_config["video_extension"],
        video_config.get("zip_inner_prefix", ""),
    )

    # Cleanup
    if config.get("cleanup", {}).get("remove_combined_zip", True):
        if combined_zip.exists():
            combined_zip.unlink()
            logger.info(f"Removed combined zip: {combined_zip}")

    if config.get("cleanup", {}).get("remove_part_files", True):
        # Part files are in HF cache, we don't delete those
        pass

    # Remove temp dir
    if temp_dir.exists():
        try:
            temp_dir.rmdir()
        except OSError:
            pass

    return result


def download_and_extract_poses(selected_ids: list, config: dict) -> dict:
    """Download pose parts, concatenate, and extract selected pose files."""
    if not config.get("poses", {}).get("enabled", True):
        logger.info("Pose download disabled in config")
        return {"extracted": {}, "not_found": []}

    repo_id = config["source"]["repo_id"]
    repo_type = config["source"]["repo_type"]
    pose_config = config["poses"]

    output_root = Path(config["output"]["root_dir"])
    poses_dir = output_root / config["output"]["poses_dir"]

    # Create temp dir for combined zip
    temp_dir = output_root / "_temp"
    temp_dir.mkdir(exist_ok=True)
    combined_zip = temp_dir / pose_config["combined_zip"]

    # Concatenate parts
    concatenate_parts(
        pose_config["part_files"],
        combined_zip,
        repo_id,
        repo_type,
    )

    # Extract poses
    result = extract_files_from_zip(
        combined_zip,
        selected_ids,
        poses_dir,
        pose_config["pose_extension"],
        pose_config.get("zip_inner_prefix", ""),
    )

    # Cleanup
    if config.get("cleanup", {}).get("remove_combined_zip", True):
        if combined_zip.exists():
            combined_zip.unlink()
            logger.info(f"Removed combined zip: {combined_zip}")

    # Remove temp dir
    if temp_dir.exists():
        try:
            temp_dir.rmdir()
        except OSError:
            pass

    return result


def verify_dataset(
    selected_ids: list,
    video_result: dict,
    pose_result: dict,
    config: dict,
) -> dict:
    """Verify that every selected sample has required files."""
    output_root = Path(config["output"]["root_dir"])
    videos_dir = output_root / config["output"]["videos_dir"]
    poses_dir = output_root / config["output"]["poses_dir"]
    video_ext = config["videos"]["video_extension"]
    pose_ext = config["poses"]["pose_extension"]

    verification = {
        "total_selected": len(selected_ids),
        "videos_found": 0,
        "videos_missing": [],
        "poses_found": 0,
        "poses_missing": [],
        "all_valid": True,
    }

    # Check videos
    if config.get("verification", {}).get("check_videos", True):
        for base_id in selected_ids:
            video_path = videos_dir / f"{base_id}{video_ext}"
            if video_path.exists():
                verification["videos_found"] += 1
            else:
                verification["videos_missing"].append(base_id)

        if verification["videos_missing"]:
            verification["all_valid"] = False
            logger.warning(f"Missing {len(verification['videos_missing'])} video files")

    # Check poses
    if config.get("verification", {}).get("check_poses", True) and config.get("poses", {}).get("enabled", True):
        for base_id in selected_ids:
            pose_path = poses_dir / f"{base_id}{pose_ext}"
            if pose_path.exists():
                verification["poses_found"] += 1
            else:
                verification["poses_missing"].append(base_id)

        if verification["poses_missing"]:
            verification["all_valid"] = False
            logger.warning(f"Missing {len(verification['poses_missing'])} pose files")

    # Summary
    logger.info(f"Verification: {verification['videos_found']}/{len(selected_ids)} videos")
    logger.info(f"Verification: {verification['poses_found']}/{len(selected_ids)} poses")

    if verification["all_valid"]:
        logger.info("All samples verified successfully!")
    else:
        logger.warning("Some samples failed verification")

    return verification


def compute_statistics(
    selected_df: pd.DataFrame,
    selected_ids: list,
    video_result: dict,
    pose_result: dict,
    verification: dict,
    config: dict,
) -> dict:
    """Compute statistics for the dev dataset."""
    uid_col = config["source"]["uid_column"]
    text_col = config["source"]["text_column"]

    # Text statistics
    texts = selected_df[text_col].dropna().astype(str)
    all_words = []
    for text in texts:
        all_words.extend(text.lower().split())

    word_freq = Counter(all_words)
    sentence_lengths = texts.apply(lambda t: len(t.lower().split())).values

    stats = {
        "dataset": {
            "name": "iSign Development Dataset",
            "version": "iSign_v1.1",
            "sample_size": config["sample_size"],
            "random_seed": config["random_seed"],
            "total_rows": len(selected_df),
            "unique_video_ids": len(selected_ids),
            "generated_at": datetime.now().isoformat(),
        },
        "text_analysis": {
            "total_texts": len(texts),
            "vocabulary_size": len(word_freq),
            "total_words": len(all_words),
            "avg_sentence_length": round(float(sentence_lengths.mean()), 2),
            "median_sentence_length": round(float(np.median(sentence_lengths)), 2),
            "min_sentence_length": int(sentence_lengths.min()),
            "max_sentence_length": int(sentence_lengths.max()),
            "std_sentence_length": round(float(sentence_lengths.std()), 2),
            "top_50_words": word_freq.most_common(50),
        },
        "video_download": {
            "attempted": len(selected_ids),
            "extracted": len(video_result.get("extracted", {})),
            "not_found": len(video_result.get("not_found", [])),
        },
        "pose_download": {
            "attempted": len(selected_ids),
            "extracted": len(pose_result.get("extracted", {})),
            "not_found": len(pose_result.get("not_found", [])),
        },
        "verification": verification,
    }

    return stats


def save_statistics(stats: dict, config: dict) -> Path:
    """Save statistics as JSON."""
    output_root = Path(config["output"]["root_dir"])
    stats_path = output_root / config["output"]["statistics_json"]

    with open(stats_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, default=str)

    logger.info(f"Saved statistics: {stats_path}")
    return stats_path


def save_readme(stats: dict, config: dict, verification: dict) -> Path:
    """Generate and save README.md."""
    output_root = Path(config["output"]["root_dir"])
    readme_path = output_root / config["output"]["readme_md"]

    ds = stats["dataset"]
    ta = stats["text_analysis"]
    vd = stats["video_download"]
    pd_stats = stats["pose_download"]

    lines = [
        "# iSign Development Dataset",
        "",
        f"*Generated: {ds['generated_at']}*",
        "",
        "---",
        "",
        "## Overview",
        "",
        "This is a small development dataset created from the **Exploration-Lab/iSign** "
        "Indian Sign Language dataset for rapid prototyping and testing.",
        "",
        f"- **Sample Size:** {ds['sample_size']} unique video IDs",
        f"- **Random Seed:** {ds['random_seed']}",
        f"- **Total Rows:** {ds['total_rows']:,}",
        f"- **Unique Videos:** {ds['unique_video_ids']}",
        "",
        "---",
        "",
        "## Directory Structure",
        "",
        "```",
        "datasets/dev/",
        "├── manifest.csv          # Full metadata for selected samples",
        "├── statistics.json       # Dataset statistics",
        "├── README.md             # This file",
        "├── videos/               # Video files (.mp4)",
        "│   ├── {base_id_1}.mp4",
        "│   ├── {base_id_2}.mp4",
        "│   └── ...",
        "├── poses/                # Pose files (.pose)",
        "│   ├── {base_id_1}.pose",
        "│   ├── {base_id_2}.pose",
        "│   └── ...",
        "└── metadata/             # Per-video metadata",
        "    ├── selected_video_ids.json",
        "    ├── {base_id_1}.csv",
        "    ├── {base_id_2}.csv",
        "    └── ...",
        "```",
        "",
        "---",
        "",
        "## Text Statistics",
        "",
        "| Metric | Value |",
        "|--------|-------|",
        f"| Total texts | **{ta['total_texts']:,}** |",
        f"| Vocabulary size | **{ta['vocabulary_size']:,}** |",
        f"| Total words | **{ta['total_words']:,}** |",
        f"| Avg sentence length | **{ta['avg_sentence_length']:.1f}** words |",
        f"| Median sentence length | **{ta['median_sentence_length']:.1f}** words |",
        f"| Min sentence length | **{ta['min_sentence_length']}** words |",
        f"| Max sentence length | **{ta['max_sentence_length']}** words |",
        f"| Std sentence length | **{ta['std_sentence_length']:.1f}** words |",
        "",
        "### Top 20 Words",
        "",
        "| Rank | Word | Frequency |",
        "|------|------|-----------|",
    ]
    for i, (word, freq) in enumerate(ta["top_50_words"][:20], 1):
        lines.append(f"| {i} | `{word}` | {freq:,} |")

    lines.extend([
        "",
        "---",
        "",
        "## Download Statistics",
        "",
        "| Resource | Attempted | Extracted | Not Found |",
        "|----------|-----------|-----------|-----------|",
        f"| Videos | {vd['attempted']} | {vd['extracted']} | {vd['not_found']} |",
        f"| Poses | {pd_stats['attempted']} | {pd_stats['extracted']} | {pd_stats['not_found']} |",
        "",
        "---",
        "",
        "## Verification",
        "",
        f"- **Videos verified:** {verification['videos_found']}/{verification['total_selected']}",
        f"- **Poses verified:** {verification['poses_found']}/{verification['total_selected']}",
        f"- **All valid:** {'Yes' if verification['all_valid'] else 'No'}",
        "",
    ])

    if verification.get("videos_missing"):
        lines.extend([
            "### Missing Videos",
            "",
            ", ".join(f"`{v}`" for v in verification["videos_missing"][:20]),
            "",
        ])

    if verification.get("poses_missing"):
        lines.extend([
            "### Missing Poses",
            "",
            ", ".join(f"`{p}`" for p in verification["poses_missing"][:20]),
            "",
        ])

    lines.extend([
        "---",
        "",
        "## Usage",
        "",
        "```python",
        "import pandas as pd",
        "",
        "# Load manifest",
        "manifest = pd.read_csv('datasets/dev/manifest.csv')",
        "",
        "# Access videos",
        "for _, row in manifest.iterrows():",
        "    video_path = f\"datasets/dev/videos/{row['uid'].rsplit('-', 1)[0]}.mp4\"",
        "    # Process video...",
        "```",
        "",
        "---",
        "",
        f"*Source: Exploration-Lab/iSign v1.1 | Generated from real CSV data*",
    ])

    with open(readme_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    logger.info(f"Saved README: {readme_path}")
    return readme_path


def main():
    parser = argparse.ArgumentParser(description="Build development dataset from iSign")
    parser.add_argument("--config", type=Path, default=None, help="Path to config YAML")
    parser.add_argument("--sample-size", type=int, default=None, help="Number of samples (25, 50, 100, 250, 500)")
    parser.add_argument("--seed", type=int, default=None, help="Random seed")
    parser.add_argument("--skip-downloads", action="store_true", help="Skip video/pose downloads (metadata only)")
    args = parser.parse_args()

    logger.info("=" * 60)
    logger.info("BUILD DEVELOPMENT DATASET")
    logger.info("=" * 60)

    # Load config
    config = load_config(args.config, args.sample_size, args.seed)

    # Load CSV
    df = load_csv(config)

    # Select samples
    selected_df, selected_ids = select_samples(df, config)

    # Create output directories
    root = create_output_dirs(config)

    # Save metadata
    save_metadata(selected_df, selected_ids, config)

    # Download and extract videos
    if not args.skip_downloads:
        logger.info("=" * 40)
        logger.info("DOWNLOADING VIDEOS")
        logger.info("=" * 40)
        video_result = download_and_extract_videos(selected_ids, config)
    else:
        logger.info("Skipping video downloads (--skip-downloads)")
        video_result = {"extracted": {}, "not_found": selected_ids}

    # Download and extract poses
    if not args.skip_downloads:
        logger.info("=" * 40)
        logger.info("DOWNLOADING POSES")
        logger.info("=" * 40)
        pose_result = download_and_extract_poses(selected_ids, config)
    else:
        logger.info("Skipping pose downloads (--skip-downloads)")
        pose_result = {"extracted": {}, "not_found": selected_ids}

    # Verify
    logger.info("=" * 40)
    logger.info("VERIFYING DATASET")
    logger.info("=" * 40)
    verification = verify_dataset(selected_ids, video_result, pose_result, config)

    # Compute statistics
    stats = compute_statistics(selected_df, selected_ids, video_result, pose_result, verification, config)

    # Save outputs
    save_statistics(stats, config)
    save_readme(stats, config, verification)

    logger.info("=" * 60)
    logger.info("BUILD COMPLETE")
    logger.info("=" * 60)
    logger.info(f"Output directory: {root}")
    logger.info(f"Videos: {verification['videos_found']}/{len(selected_ids)}")
    logger.info(f"Poses: {verification['poses_found']}/{len(selected_ids)}")
    logger.info(f"Metadata rows: {len(selected_df)}")

    return 0 if verification["all_valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
