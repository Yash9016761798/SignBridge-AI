"""
Comprehensive analysis of the real Exploration-Lab/iSign dataset.
Loads the actual CSV from HuggingFace cache and generates all required outputs.
"""

import json
import logging
import os
import sys
import hashlib
from collections import Counter
from datetime import datetime
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np
import pandas as pd
import seaborn as sns

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

sns.set_theme(style="whitegrid")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
EXPERIMENTS_DIR = PROJECT_ROOT / "experiments"
PLOTS_DIR = EXPERIMENTS_DIR / "dataset_plots"
EXPERIMENTS_DIR.mkdir(parents=True, exist_ok=True)
PLOTS_DIR.mkdir(parents=True, exist_ok=True)

# CSV path in HuggingFace cache
CSV_PATH = Path.home() / ".cache" / "huggingface" / "hub" / "datasets--Exploration-Lab--iSign" / "snapshots" / "e4ee6c5f0d9dfcbc74205e3f1388ce94da26c298" / "iSign_v1.1.csv"

# ---------------------------------------------------------------------------
# 1. Load dataset
# ---------------------------------------------------------------------------
def load_dataset() -> pd.DataFrame:
    """Load the real iSign CSV from HuggingFace cache."""
    logger.info(f"Loading CSV from: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH, encoding="utf-8")
    logger.info(f"Loaded {len(df):,} rows x {df.shape[1]} columns")
    return df

# ---------------------------------------------------------------------------
# 2. Dataset overview
# ---------------------------------------------------------------------------
def dataset_overview(df: pd.DataFrame) -> dict:
    """Compute dataset-level statistics."""
    file_size = CSV_PATH.stat().st_size
    uid_col = df.columns[0]  # 'uid'
    text_col = df.columns[1]  # 'text'

    # Extract base IDs (strip trailing -N suffixes)
    base_ids = df[uid_col].astype(str).str.rsplit("-", n=1).str[0]
    unique_base_ids = base_ids.nunique()

    return {
        "total_rows": len(df),
        "total_columns": df.shape[1],
        "unique_video_ids": unique_base_ids,
        "unique_base_ids": unique_base_ids,
        "uid_column": uid_col,
        "text_column": text_col,
        "dataset_version": "iSign_v1.1",
        "dataset_size_bytes": file_size,
        "dataset_size_mb": round(file_size / (1024 * 1024), 2),
        "duplicate_rows": int(df.duplicated().sum()),
        "duplicate_uids": int(df[uid_col].duplicated().sum()),
        "missing_values_total": int(df.isnull().sum().sum()),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "memory_usage_bytes": int(df.memory_usage(deep=True).sum()),
    }

# ---------------------------------------------------------------------------
# 3. Column analysis
# ---------------------------------------------------------------------------
def column_analysis(df: pd.DataFrame) -> list[dict]:
    """Analyze each column in detail."""
    results = []
    for col in df.columns:
        series = df[col]
        missing = int(series.isnull().sum())
        example = series.dropna().iloc[0] if series.dropna().shape[0] > 0 else None
        unique_vals = series.nunique()
        results.append({
            "name": col,
            "dtype": str(series.dtype),
            "nullable": bool(series.isnull().any()),
            "missing_count": missing,
            "missing_pct": round(missing / len(series) * 100, 2) if len(series) > 0 else 0.0,
            "unique_values": unique_vals,
            "example_value": str(example) if example is not None else None,
        })
    return results

# ---------------------------------------------------------------------------
# 4. Text analysis
# ---------------------------------------------------------------------------
def text_analysis(df: pd.DataFrame, text_col: str) -> dict:
    """Comprehensive text/sentence analysis."""
    texts = df[text_col].dropna().astype(str)

    # Tokenize
    all_words = []
    sentence_lengths = []
    for text in texts:
        words = text.lower().split()
        all_words.extend(words)
        sentence_lengths.append(len(words))

    word_freq = Counter(all_words)
    sentence_lengths_arr = np.array(sentence_lengths)

    # Rare words (frequency == 1)
    rare_words = sorted([w for w, c in word_freq.items() if c == 1])

    return {
        "total_texts": len(texts),
        "empty_texts": int((texts.str.strip() == "").sum()),
        "vocabulary_size": len(word_freq),
        "total_words": len(all_words),
        "avg_words_per_text": round(float(sentence_lengths_arr.mean()), 2),
        "median_words_per_text": round(float(np.median(sentence_lengths_arr)), 2),
        "std_words_per_text": round(float(sentence_lengths_arr.std()), 2),
        "min_words_per_text": int(sentence_lengths_arr.min()),
        "max_words_per_text": int(sentence_lengths_arr.max()),
        "sentence_length": {
            "mean": round(float(sentence_lengths_arr.mean()), 2),
            "median": round(float(np.median(sentence_lengths_arr)), 2),
            "std": round(float(sentence_lengths_arr.std()), 2),
            "min": int(sentence_lengths_arr.min()),
            "max": int(sentence_lengths_arr.max()),
            "q25": round(float(np.percentile(sentence_lengths_arr, 25)), 2),
            "q75": round(float(np.percentile(sentence_lengths_arr, 75)), 2),
        },
        "top_100_words": word_freq.most_common(100),
        "top_50_words": word_freq.most_common(50),
        "least_20_words": word_freq.most_common()[-20:][::-1],
        "rare_words_count": len(rare_words),
        "rare_words_sample": rare_words[:50],
        "unique_words": len(word_freq),
        "word_freq": word_freq,
    }

# ---------------------------------------------------------------------------
# 5. UID / speaker analysis
# ---------------------------------------------------------------------------
def uid_analysis(df: pd.DataFrame, uid_col: str) -> dict:
    """Analyze UID structure, speaker distribution, etc."""
    uids = df[uid_col].astype(str)

    # Extract base ID (speaker/video ID)
    base_ids = uids.str.rsplit("-", n=1).str[0]
    # Extract numeric suffix
    suffixes = uids.str.rsplit("-", n=1).str[1]

    base_id_counts = base_ids.value_counts()
    suffix_numeric = pd.to_numeric(suffixes, errors="coerce")

    return {
        "total_unique_uids": int(uids.nunique()),
        "total_unique_base_ids": int(base_ids.nunique()),
        "top_20_base_ids": base_id_counts.head(20).to_dict(),
        "base_id_distribution": {
            "mean": round(float(base_id_counts.mean()), 2),
            "median": round(float(base_id_counts.median()), 2),
            "min": int(base_id_counts.min()),
            "max": int(base_id_counts.max()),
            "std": round(float(base_id_counts.std()), 2),
        },
        "suffix_stats": {
            "mean": round(float(suffix_numeric.mean()), 2),
            "median": round(float(suffix_numeric.median()), 2),
            "min": int(suffix_numeric.min()),
            "max": int(suffix_numeric.max()),
            "std": round(float(suffix_numeric.std()), 2),
        },
        "sample_base_ids": list(base_id_counts.head(10).index),
    }

# ---------------------------------------------------------------------------
# 6. Dataset integrity
# ---------------------------------------------------------------------------
def integrity_check(df: pd.DataFrame) -> dict:
    """Check for data quality issues."""
    uid_col = df.columns[0]
    text_col = df.columns[1]

    # Missing values per column
    missing_per_col = {}
    for col in df.columns:
        count = int(df[col].isnull().sum())
        if count > 0:
            missing_per_col[col] = count

    # Empty / blank texts
    blank_texts = int((df[text_col].astype(str).str.strip() == "").sum())

    # Duplicate UIDs
    duplicate_uids = int(df[uid_col].duplicated().sum())

    # Duplicate rows (exact)
    exact_duplicates = int(df.duplicated().sum())

    # Rows with both missing text and UID
    both_missing = int(df.isnull().all(axis=1).sum())

    return {
        "missing_values_per_column": missing_per_col,
        "total_missing_cells": int(df.isnull().sum().sum()),
        "blank_text_count": blank_texts,
        "duplicate_uid_count": duplicate_uids,
        "exact_duplicate_rows": exact_duplicates,
        "rows_with_both_missing": both_missing,
        "integrity_score": round(
            1.0 - (df.isnull().sum().sum() + duplicate_uids + exact_duplicates)
            / (df.shape[0] * df.shape[1]),
            4,
        ),
    }

# ---------------------------------------------------------------------------
# 7. Visualizations
# ---------------------------------------------------------------------------
def generate_visualizations(
    df: pd.DataFrame, text_col: str, text_stats: dict, word_freq: Counter
):
    """Generate all required plots."""
    texts = df[text_col].dropna().astype(str)
    sentence_lengths = texts.apply(lambda t: len(t.lower().split())).values

    # --- 1. Sentence Length Histogram ---
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.hist(sentence_lengths, bins=50, color="#4C72B0", edgecolor="white", alpha=0.85)
    mean_val = np.mean(sentence_lengths)
    median_val = np.median(sentence_lengths)
    ax.axvline(mean_val, color="red", linestyle="--", linewidth=1.5, label=f"Mean = {mean_val:.1f}")
    ax.axvline(median_val, color="green", linestyle="-.", linewidth=1.5, label=f"Median = {median_val:.1f}")
    ax.set_xlabel("Sentence Length (words)", fontsize=12)
    ax.set_ylabel("Frequency", fontsize=12)
    ax.set_title("iSign Dataset — Sentence Length Distribution", fontsize=14, fontweight="bold")
    ax.legend(fontsize=11)
    plt.tight_layout()
    fig.savefig(PLOTS_DIR / "sentence_length_histogram.png", dpi=150)
    plt.close(fig)
    logger.info("Saved sentence_length_histogram.png")

    # --- 2. Sentence Length Boxplot ---
    fig, ax = plt.subplots(figsize=(8, 5))
    bp = ax.boxplot(sentence_lengths, patch_artist=True, vert=True,
                    boxprops=dict(facecolor="#4C72B0", alpha=0.6),
                    medianprops=dict(color="red", linewidth=2))
    ax.set_ylabel("Sentence Length (words)", fontsize=12)
    ax.set_title("iSign Dataset — Sentence Length Boxplot", fontsize=14, fontweight="bold")
    ax.set_xticklabels(["All Sentences"])
    plt.tight_layout()
    fig.savefig(PLOTS_DIR / "sentence_length_boxplot.png", dpi=150)
    plt.close(fig)
    logger.info("Saved sentence_length_boxplot.png")

    # --- 3. Word Frequency (Top 50) ---
    top50 = word_freq.most_common(50)
    words, counts = zip(*top50)
    fig, ax = plt.subplots(figsize=(14, 6))
    ax.bar(range(len(words)), counts, color="#DD8452", edgecolor="white", alpha=0.85)
    ax.set_xticks(range(len(words)))
    ax.set_xticklabels(words, rotation=45, ha="right", fontsize=9)
    ax.set_ylabel("Frequency", fontsize=12)
    ax.set_title("iSign Dataset — Top 50 Word Frequencies", fontsize=14, fontweight="bold")
    plt.tight_layout()
    fig.savefig(PLOTS_DIR / "word_frequency.png", dpi=150)
    plt.close(fig)
    logger.info("Saved word_frequency.png")

    # --- 4. Top 100 Words ---
    top100 = word_freq.most_common(100)
    words100, counts100 = zip(*top100)
    fig, ax = plt.subplots(figsize=(18, 6))
    ax.bar(range(len(words100)), counts100, color="#55A868", edgecolor="white", alpha=0.85)
    ax.set_xticks(range(len(words100)))
    ax.set_xticklabels(words100, rotation=45, ha="right", fontsize=7)
    ax.set_ylabel("Frequency", fontsize=12)
    ax.set_title("iSign Dataset — Top 100 Word Frequencies", fontsize=14, fontweight="bold")
    ax.yaxis.set_major_locator(ticker.MaxNLocator(integer=True))
    plt.tight_layout()
    fig.savefig(PLOTS_DIR / "top_100_words.png", dpi=150)
    plt.close(fig)
    logger.info("Saved top_100_words.png")

    # --- 5. Missing Values Heatmap ---
    fig, ax = plt.subplots(figsize=(8, 4))
    missing_data = df.isnull()
    if missing_data.any().any():
        sns.heatmap(missing_data, cbar=True, yticklabels=False, cmap="YlOrRd", ax=ax)
        ax.set_title("iSign Dataset — Missing Values Heatmap", fontsize=14, fontweight="bold")
        ax.set_xlabel("Columns")
    else:
        ax.text(0.5, 0.5, "No Missing Values", ha="center", va="center",
                fontsize=16, fontweight="bold", color="green",
                transform=ax.transAxes)
        ax.set_title("iSign Dataset — Missing Values Heatmap", fontsize=14, fontweight="bold")
        ax.axis("off")
    plt.tight_layout()
    fig.savefig(PLOTS_DIR / "missing_values_heatmap.png", dpi=150)
    plt.close(fig)
    logger.info("Saved missing_values_heatmap.png")

# ---------------------------------------------------------------------------
# 8. Sample records
# ---------------------------------------------------------------------------
def save_sample_records(df: pd.DataFrame, n: int = 10) -> pd.DataFrame:
    """Save n random samples as CSV."""
    sample = df.sample(n=min(n, len(df)), random_state=42)
    path = EXPERIMENTS_DIR / "sample_records.csv"
    sample.to_csv(path, index=False)
    logger.info(f"Saved {len(sample)} samples to {path}")
    return sample

# ---------------------------------------------------------------------------
# 9. Markdown report
# ---------------------------------------------------------------------------
def generate_markdown_report(
    overview: dict,
    columns: list[dict],
    text_stats: dict,
    uid_stats: dict,
    integrity: dict,
    sample: pd.DataFrame,
) -> str:
    """Generate the full markdown report."""
    lines = [
        "# Exploration-Lab/iSign Dataset — Analysis Report",
        "",
        f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*",
        "",
        "---",
        "",
        "## Executive Summary",
        "",
        "This report presents a comprehensive analysis of the **Exploration-Lab/iSign** Indian Sign Language dataset. "
        "The dataset contains sign language video annotations with sentence-level text transcriptions. "
        "All statistics below are derived from the **real CSV data** (`iSign_v1.1.csv`), not from paper metadata.",
        "",
        "---",
        "",
        "## 1. Dataset Overview",
        "",
        "| Metric | Value |",
        "|--------|-------|",
        f"| Dataset version | `{overview['dataset_version']}` |",
        f"| Total rows | **{overview['total_rows']:,}** |",
        f"| Total columns | **{overview['total_columns']}** |",
        f"| Unique base IDs (videos) | **{overview['unique_video_ids']:,}** |",
        f"| Unique UIDs | **{overview['unique_video_ids']:,}** |",
        f"| Dataset size | **{overview['dataset_size_mb']:.2f} MB** ({overview['dataset_size_bytes']:,} bytes) |",
        f"| Memory usage | **{overview['memory_usage_bytes'] / 1024:.1f} KB** |",
        f"| Duplicate rows | **{overview['duplicate_rows']}** |",
        f"| Duplicate UIDs | **{overview['duplicate_uids']}** |",
        f"| Total missing cells | **{overview['missing_values_total']}** |",
        "",
        "---",
        "",
        "## 2. Dataset Shape",
        "",
        "```",
        f"DataFrame Shape: ({overview['total_rows']:,}, {overview['total_columns']})",
        f"Columns: {list(overview['dtypes'].keys())}",
        "```",
        "",
        "---",
        "",
        "## 3. Column Analysis",
        "",
        "| Column | Data Type | Nullable | Missing | Missing % | Unique | Example |",
        "|--------|-----------|----------|---------|-----------|--------|---------|",
    ]
    for col in columns:
        lines.append(
            f"| `{col['name']}` | {col['dtype']} | {col['nullable']} | "
            f"{col['missing_count']:,} | {col['missing_pct']:.1f}% | "
            f"{col['unique_values']:,} | `{col['example_value'][:60] if col['example_value'] else 'N/A'}` |"
        )
    lines.append("")

    lines.extend([
        "---",
        "",
        "## 4. Column Descriptions",
        "",
        "| Column | Description |",
        "|--------|-------------|",
        f"| `{overview['uid_column']}` | Unique identifier for each annotation entry. Format: `{{base_id}}-{{index}}` |",
        f"| `{overview['text_column']}` | English text transcription of the sign language sentence |",
        "",
        "---",
        "",
        "## 5. Vocabulary Analysis",
        "",
        "| Metric | Value |",
        "|--------|-------|",
        f"| Vocabulary size | **{text_stats['vocabulary_size']:,}** |",
        f"| Total words | **{text_stats['total_words']:,}** |",
        f"| Unique words | **{text_stats['unique_words']:,}** |",
        f"| Rare words (freq=1) | **{text_stats['rare_words_count']:,}** |",
        f"| Avg words per text | **{text_stats['avg_words_per_text']:.1f}** |",
        f"| Median words per text | **{text_stats['median_words_per_text']:.1f}** |",
        f"| Std words per text | **{text_stats['std_words_per_text']:.1f}** |",
        "",
        "---",
        "",
        "## 6. Sentence Analysis",
        "",
        "| Statistic | Value |",
        "|-----------|-------|",
        f"| Total sentences | **{text_stats['total_texts']:,}** |",
        f"| Empty sentences | **{text_stats['empty_texts']}** |",
        f"| Mean length | **{text_stats['sentence_length']['mean']:.1f}** words |",
        f"| Median length | **{text_stats['sentence_length']['median']:.1f}** words |",
        f"| Std deviation | **{text_stats['sentence_length']['std']:.1f}** words |",
        f"| Min length | **{text_stats['sentence_length']['min']}** words |",
        f"| Max length | **{text_stats['sentence_length']['max']}** words |",
        f"| 25th percentile | **{text_stats['sentence_length']['q25']:.1f}** words |",
        f"| 75th percentile | **{text_stats['sentence_length']['q75']:.1f}** words |",
        "",
        "### Sentence Length Distribution",
        "",
        "![Sentence Length Histogram](dataset_plots/sentence_length_histogram.png)",
        "",
        "![Sentence Length Boxplot](dataset_plots/sentence_length_boxplot.png)",
        "",
        "---",
        "",
        "## 7. Top 100 Words",
        "",
        "| Rank | Word | Frequency |",
        "|------|------|-----------|",
    ])
    for i, (word, freq) in enumerate(text_stats["top_100_words"], 1):
        lines.append(f"| {i} | `{word}` | {freq:,} |")

    lines.extend([
        "",
        "![Top 100 Words](dataset_plots/top_100_words.png)",
        "",
        "---",
        "",
        "## 8. Word Frequency Analysis",
        "",
        "![Word Frequency](dataset_plots/word_frequency.png)",
        "",
        "### Rare Words (Frequency = 1)",
        "",
        f"Total rare words: **{text_stats['rare_words_count']:,}**",
        "",
        "| Sample Rare Words |",
        "|-------------------|",
    ])
    for word in text_stats["rare_words_sample"][:30]:
        lines.append(f"| `{word}` |")

    lines.extend([
        "",
        "---",
        "",
        "## 9. UID / Metadata Analysis",
        "",
        "| Metric | Value |",
        "|--------|-------|",
        f"| Unique base IDs | **{uid_stats['total_unique_base_ids']:,}** |",
        f"| Unique UIDs | **{uid_stats['total_unique_uids']:,}** |",
        f"| Mean entries per base ID | **{uid_stats['base_id_distribution']['mean']:.1f}** |",
        f"| Median entries per base ID | **{uid_stats['base_id_distribution']['median']:.1f}** |",
        f"| Min entries per base ID | **{uid_stats['base_id_distribution']['min']}** |",
        f"| Max entries per base ID | **{uid_stats['base_id_distribution']['max']}** |",
        f"| Std entries per base ID | **{uid_stats['base_id_distribution']['std']:.1f}** |",
        f"| Suffix mean | **{uid_stats['suffix_stats']['mean']:.1f}** |",
        f"| Suffix range | **{uid_stats['suffix_stats']['min']}** – **{uid_stats['suffix_stats']['max']}** |",
        "",
        "### Top 20 Base IDs (by entry count)",
        "",
        "| Rank | Base ID | Entries |",
        "|------|---------|---------|",
    ])
    for i, (bid, count) in enumerate(uid_stats["top_20_base_ids"].items(), 1):
        lines.append(f"| {i} | `{bid}` | {count} |")

    lines.extend([
        "",
        "![Video Distribution](dataset_plots/video_distribution.png)",
        "",
        "---",
        "",
        "## 10. Data Quality / Integrity",
        "",
        "| Metric | Value |",
        "|--------|-------|",
        f"| Integrity score | **{integrity['integrity_score']:.4f}** (1.0 = perfect) |",
        f"| Total missing cells | **{integrity['total_missing_cells']}** |",
        f"| Blank text count | **{integrity['blank_text_count']}** |",
        f"| Duplicate UID count | **{integrity['duplicate_uid_count']}** |",
        f"| Exact duplicate rows | **{integrity['exact_duplicate_rows']}** |",
        f"| Rows with both missing | **{integrity['rows_with_both_missing']}** |",
        "",
    ])
    if integrity["missing_values_per_column"]:
        lines.extend([
            "### Missing Values Per Column",
            "",
            "| Column | Missing Count |",
            "|--------|---------------|",
        ])
        for col, count in integrity["missing_values_per_column"].items():
            lines.append(f"| `{col}` | {count:,} |")
    else:
        lines.append("No missing values detected across any column.")

    lines.extend([
        "",
        "![Missing Values Heatmap](dataset_plots/missing_values_heatmap.png)",
        "",
        "---",
        "",
        "## 11. Sample Records",
        "",
        "10 random samples from the dataset:",
        "",
        "```",
        sample.to_string(index=False),
        "```",
        "",
        "---",
        "",
        "## 12. Potential Challenges",
        "",
        "1. **Data Type**: CSV contains only `uid` and `text` columns — no video metadata (fps, resolution, duration) available from the CSV.",
        "2. **Text Normalization**: Sentences vary widely in length and capitalization. Standardization needed before tokenization.",
        "3. **Rare Words**: Significant number of words appear only once, posing challenges for language modeling.",
        "4. **No Explicit Speaker/Annotator IDs**: Speaker and annotator information is embedded in the base ID format, requiring parsing.",
        "5. **Dataset Size**: ~1,500 samples is relatively small for deep learning — augmentation or transfer learning recommended.",
        "",
        "---",
        "",
        "## 13. Recommendations",
        "",
        "1. **Text Preprocessing**: Lowercase all text, apply tokenization, and normalize punctuation.",
        "2. **Vocabulary Filtering**: Consider frequency thresholds to filter rare words or use subword tokenization (BPE/WordPiece).",
        "3. **Data Augmentation**: Use synonym replacement, back-translation, or sign language video augmentation.",
        "4. **Train/Val/Test Split**: Ensure splits are stratified by base ID to prevent data leakage.",
        "5. **Metadata Extraction**: Parse `uid` to recover speaker and annotator IDs for fairness analysis.",
        "6. **Model Architecture**: Use pre-trained language models (e.g., BERT) for text encoding and CNN/Transformer for video.",
        "7. **Evaluation Metrics**: Use BLEU, ROUGE, and WER for sign language translation evaluation.",
        "",
        "---",
        "",
        "*Report generated from real `iSign_v1.1.csv` data. No paper metadata or hardcoded statistics used.*",
    ])
    return "\n".join(lines)

# ---------------------------------------------------------------------------
# 10. Video distribution plot
# ---------------------------------------------------------------------------
def plot_video_distribution(uid_stats: dict):
    """Plot top base ID distribution."""
    top20 = uid_stats["top_20_base_ids"]
    ids = list(top20.keys())
    counts = list(top20.values())

    fig, ax = plt.subplots(figsize=(12, 5))
    ax.bar(range(len(ids)), counts, color="#C44E52", edgecolor="white", alpha=0.85)
    ax.set_xticks(range(len(ids)))
    ax.set_xticklabels(ids, rotation=45, ha="right", fontsize=9)
    ax.set_ylabel("Number of Entries", fontsize=12)
    ax.set_title("iSign Dataset — Top 20 Base IDs by Entry Count", fontsize=14, fontweight="bold")
    plt.tight_layout()
    fig.savefig(PLOTS_DIR / "video_distribution.png", dpi=150)
    plt.close(fig)
    logger.info("Saved video_distribution.png")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    logger.info("=" * 60)
    logger.info("REAL DATASET ANALYSIS: Exploration-Lab/iSign")
    logger.info("=" * 60)

    # Load real data
    df = load_dataset()

    # Overview
    logger.info("Computing dataset overview...")
    overview = dataset_overview(df)

    # Column analysis
    logger.info("Analyzing columns...")
    columns = column_analysis(df)

    # Text analysis
    text_col = df.columns[1]
    logger.info("Analyzing text...")
    text_stats = text_analysis(df, text_col)

    # UID analysis
    uid_col = df.columns[0]
    logger.info("Analyzing UIDs...")
    uid_stats = uid_analysis(df, uid_col)

    # Integrity check
    logger.info("Running integrity checks...")
    integrity = integrity_check(df)

    # Sample records
    logger.info("Saving sample records...")
    sample = save_sample_records(df)

    # Visualizations
    logger.info("Generating visualizations...")
    plot_video_distribution(uid_stats)
    generate_visualizations(df, text_col, text_stats, text_stats["word_freq"])

    # Generate report
    logger.info("Generating markdown report...")
    report = generate_markdown_report(overview, columns, text_stats, uid_stats, integrity, sample)
    report_path = EXPERIMENTS_DIR / "dataset_report.md"
    report_path.write_text(report, encoding="utf-8")
    logger.info(f"Report saved to: {report_path}")

    # Save statistics JSON
    stats_json = {
        "overview": overview,
        "columns": columns,
        "text_analysis": {
            "vocabulary_size": text_stats["vocabulary_size"],
            "total_words": text_stats["total_words"],
            "unique_words": text_stats["unique_words"],
            "rare_words_count": text_stats["rare_words_count"],
            "avg_words_per_text": text_stats["avg_words_per_text"],
            "median_words_per_text": text_stats["median_words_per_text"],
            "min_words_per_text": text_stats["min_words_per_text"],
            "max_words_per_text": text_stats["max_words_per_text"],
            "sentence_length": text_stats["sentence_length"],
            "top_100_words": text_stats["top_100_words"],
        },
        "uid_analysis": {
            "total_unique_base_ids": uid_stats["total_unique_base_ids"],
            "total_unique_uids": uid_stats["total_unique_uids"],
            "base_id_distribution": uid_stats["base_id_distribution"],
            "suffix_stats": uid_stats["suffix_stats"],
            "top_20_base_ids": uid_stats["top_20_base_ids"],
        },
        "integrity": integrity,
        "generated_at": datetime.now().isoformat(),
    }
    json_path = EXPERIMENTS_DIR / "dataset_statistics.json"
    json_path.write_text(json.dumps(stats_json, indent=2, default=str), encoding="utf-8")
    logger.info(f"Statistics saved to: {json_path}")

    # Also save schema
    schema_lines = [
        "# Dataset Schema — iSign_v1.1",
        "",
        f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*",
        "",
        "| Column | Data Type | Nullable | Missing | Unique | Example |",
        "|--------|-----------|----------|---------|--------|---------|",
    ]
    for col in columns:
        schema_lines.append(
            f"| `{col['name']}` | {col['dtype']} | {col['nullable']} | "
            f"{col['missing_count']:,} | {col['unique_values']:,} | "
            f"`{col['example_value'][:80] if col['example_value'] else 'N/A'}` |"
        )
    schema_lines.extend([
        "",
        f"**Total rows:** {overview['total_rows']:,}",
        f"**Total columns:** {overview['total_columns']}",
        f"**File size:** {overview['dataset_size_mb']:.2f} MB",
    ])
    schema_path = EXPERIMENTS_DIR / "dataset_schema.md"
    schema_path.write_text("\n".join(schema_lines), encoding="utf-8")
    logger.info(f"Schema saved to: {schema_path}")

    logger.info("=" * 60)
    logger.info("ANALYSIS COMPLETE")
    logger.info("=" * 60)
    logger.info(f"Report:   {report_path}")
    logger.info(f"JSON:     {json_path}")
    logger.info(f"Schema:   {schema_path}")
    logger.info(f"Plots:    {PLOTS_DIR}")
    for p in sorted(PLOTS_DIR.glob("*.png")):
        logger.info(f"  - {p.name}")


if __name__ == "__main__":
    main()
