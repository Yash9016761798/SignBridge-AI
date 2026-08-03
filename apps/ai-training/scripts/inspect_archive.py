"""
Phase 9.1: Dataset Archive Inspection

Inspects the Exploration-Lab/iSign dataset structure on HuggingFace
without downloading any large archives. Generates reports and recommendations.

Usage:
    python scripts/inspect_archive.py
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
EXPERIMENTS_DIR = PROJECT_ROOT / "experiments"
EXPERIMENTS_DIR.mkdir(parents=True, exist_ok=True)

REPO_ID = "Exploration-Lab/iSign"
REPO_TYPE = "dataset"


def list_all_files() -> list[dict]:
    """List all files in the HuggingFace repo with metadata."""
    from huggingface_hub import list_repo_tree

    logger.info(f"Listing files in {REPO_ID}...")
    items = list(list_repo_tree(REPO_ID, repo_type=REPO_TYPE, recursive=False))

    files = []
    for item in items:
        size = getattr(item, "size", None)
        lfs = getattr(item, "lfs", None)
        files.append({
            "name": item.path,
            "size_bytes": size,
            "size_gb": round(size / (1024**3), 3) if size and size > 1024**3 else None,
            "size_mb": round(size / (1024**2), 2) if size and size <= 1024**3 else None,
            "is_lfs": lfs is not None,
            "type": _classify_file(item.path),
        })

    logger.info(f"Found {len(files)} files")
    return files


def _classify_file(name: str) -> str:
    """Classify file by type."""
    name_lower = name.lower()
    if name_lower.endswith(".csv"):
        return "csv"
    if name_lower.endswith(".md"):
        return "readme"
    if name_lower.endswith(".json"):
        return "json"
    if name_lower.endswith(".jsonl"):
        return "jsonl"
    if "video" in name_lower and "part" in name_lower:
        return "video_archive_part"
    if "pose" in name_lower and "part" in name_lower:
        return "pose_archive_part"
    if name_lower.endswith((".zip", ".tar", ".gz", ".rar", ".7z")):
        return "archive"
    if name_lower.startswith(".git"):
        return "git_config"
    return "other"


def analyze_structure(files: list[dict]) -> dict:
    """Analyze the dataset structure and determine download strategy."""
    video_parts = [f for f in files if f["type"] == "video_archive_part"]
    pose_parts = [f for f in files if f["type"] == "pose_archive_part"]
    csv_files = [f for f in files if f["type"] == "csv"]
    readme_files = [f for f in files if f["type"] == "readme"]

    total_video_size = sum(f["size_bytes"] or 0 for f in video_parts)
    total_pose_size = sum(f["size_bytes"] or 0 for f in pose_parts)

    # Determine if archives are split
    video_split = len(video_parts) > 1
    pose_split = len(pose_parts) > 1

    # Check if individual files exist (not inside archives)
    individual_videos = any(
        f["name"].endswith((".mp4", ".avi", ".mov", ".mkv"))
        and f["type"] not in ("video_archive_part", "pose_archive_part")
        for f in files
    )

    # Determine if selective download is possible
    # Selective download is possible if:
    # 1. Files are stored individually (not in archives), OR
    # 2. Archives can be partially extracted (not possible with split zips)
    selective_download_possible = individual_videos

    analysis = {
        "repo_id": REPO_ID,
        "total_files": len(files),
        "video_archive_parts": {
            "count": len(video_parts),
            "files": [f["name"] for f in video_parts],
            "total_size_gb": round(total_video_size / (1024**3), 2),
            "is_split": video_split,
        },
        "pose_archive_parts": {
            "count": len(pose_parts),
            "files": [f["name"] for f in pose_parts],
            "total_size_gb": round(total_pose_size / (1024**3), 2),
            "is_split": pose_split,
        },
        "csv_files": {
            "count": len(csv_files),
            "files": [f["name"] for f in csv_files],
        },
        "readme_files": {
            "count": len(readme_files),
            "files": [f["name"] for f in readme_files],
        },
        "individual_videos_exist": individual_videos,
        "selective_download_possible": selective_download_possible,
        "recommendation": "Option_A" if selective_download_possible else "Option_B",
        "recommendation_reason": (
            "Videos are stored as individual files and can be downloaded selectively."
            if individual_videos
            else "Videos are stored inside split ZIP archives. "
            "Individual videos cannot be extracted without downloading and concatenating "
            "the entire archive (~54GB for videos, ~159GB for poses). "
            "Partial extraction from split ZIP files is NOT supported."
        ),
    }

    return analysis


def generate_archive_structure_md(analysis: dict, files: list[dict]) -> str:
    """Generate the archive_structure.md report."""
    lines = [
        "# iSign Dataset — Archive Structure Inspection",
        "",
        f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*",
        "",
        "---",
        "",
        "## Executive Summary",
        "",
        f"This report inspects the **{analysis['repo_id']}** dataset repository on HuggingFace "
        "to determine the optimal download strategy for selective video/pose extraction.",
        "",
        f"**Total files in repo:** {analysis['total_files']}",
        "",
        "---",
        "",
        "## 1. Complete File Listing",
        "",
        "| # | Filename | Size | Type | LFS |",
        "|---|----------|------|------|-----|",
    ]

    for i, f in enumerate(files, 1):
        size_str = (
            f"{f['size_gb']:.2f} GB" if f["size_gb"]
            else f"{f['size_mb']:.2f} MB" if f["size_mb"]
            else "N/A"
        )
        lines.append(
            f"| {i} | `{f['name']}` | {size_str} | {f['type']} | {'Yes' if f['is_lfs'] else 'No'} |"
        )

    lines.extend([
        "",
        "---",
        "",
        "## 2. Archive Analysis",
        "",
        "### Video Archives",
        "",
        "| Property | Value |",
        "|----------|-------|",
        f"| Number of parts | **{analysis['video_archive_parts']['count']}** |",
        f"| Total size | **{analysis['video_archive_parts']['total_size_gb']:.2f} GB** |",
        f"| Split across parts | **{'Yes' if analysis['video_archive_parts']['is_split'] else 'No'}** |",
        "",
        "**Part files:**",
        "",
    ])
    for f in analysis["video_archive_parts"]["files"]:
        lines.append(f"- `{f}`")

    lines.extend([
        "",
        "### Pose Archives",
        "",
        "| Property | Value |",
        "|----------|-------|",
        f"| Number of parts | **{analysis['pose_archive_parts']['count']}** |",
        f"| Total size | **{analysis['pose_archive_parts']['total_size_gb']:.2f} GB** |",
        f"| Split across parts | **{'Yes' if analysis['pose_archive_parts']['is_split'] else 'No'}** |",
        "",
        "**Part files:**",
        "",
    ])
    for f in analysis["pose_archive_parts"]["files"]:
        lines.append(f"- `{f}`")

    lines.extend([
        "",
        "### CSV Files",
        "",
    ])
    for f in analysis["csv_files"]["files"]:
        lines.append(f"- `{f}`")

    lines.extend([
        "",
        "### README / Config Files",
        "",
    ])
    for f in analysis["readme_files"]["files"]:
        lines.append(f"- `{f}`")

    lines.extend([
        "",
        "---",
        "",
        "## 3. Structure Diagram",
        "",
        "```",
        "Exploration-Lab/iSign (HuggingFace Dataset)",
        "├── .gitattributes                    (LFS tracking rules)",
        "├── README.md                         (Dataset documentation)",
        "├── iSign_v1.1.csv                    (Main annotations - 9.35 MB)",
        "├── word-description-dataset_v1.1.csv (Word descriptions - 0.06 MB)",
        "├── word-presence-dataset_v1.1.csv    (Word presence - 0.13 MB)",
        "│",
        "├── iSign-videos_v1.1_part_aa         (Video archive part 1 - 30.00 GB)",
        "├── iSign-videos_v1.1_part_ab         (Video archive part 2 - 23.92 GB)",
        "│   └── [Combined: iSign-videos_v1.1.zip]",
        "│       └── Contains: individual .mp4 video files",
        "│",
        "├── iSign-poses_v1.1_part_aa          (Pose archive part 1 - 45.00 GB)",
        "├── iSign-poses_v1.1_part_ab          (Pose archive part 2 - 45.00 GB)",
        "├── iSign-poses_v1.1_part_ac          (Pose archive part 3 - 45.00 GB)",
        "└── iSign-poses_v1.1_part_ad          (Pose archive part 4 - 23.54 GB)",
        "    └── [Combined: iSign-poses_v1.1.zip]",
        "        └── Contains: individual .pose files",
        "```",
        "",
        "---",
        "",
        "## 4. Key Findings",
        "",
        "### Are videos stored individually?",
        f"- **{('Yes' if analysis['individual_videos_exist'] else 'No')}** — "
        f"{'Videos are stored as individual .mp4 files inside split ZIP archives.' if not analysis['individual_videos_exist'] else 'Videos are accessible as individual files.'}",
        "",
        "### Are videos inside ZIP archives?",
        f"- **Yes** — Videos are packaged in `iSign-videos_v1.1.zip` (split into 2 parts).",
        "",
        "### Are archives split?",
        f"- **Yes** — Both video and pose archives are split into multiple parts:",
        f"  - Videos: {analysis['video_archive_parts']['count']} parts ({analysis['video_archive_parts']['total_size_gb']:.2f} GB total)",
        f"  - Poses: {analysis['pose_archive_parts']['count']} parts ({analysis['pose_archive_parts']['total_size_gb']:.2f} GB total)",
        "",
        "### Can individual videos be downloaded?",
        f"- **{'Yes' if analysis['individual_videos_exist'] else 'No'}** — "
        f"{'Individual files are accessible.' if analysis['individual_videos_exist'] else 'Individual videos cannot be downloaded without the full archive.'}",
        "",
        "### Can partial extraction be performed?",
        f"- **{'Yes' if analysis['individual_videos_exist'] else 'No'}** — "
        f"{'Partial extraction is supported.' if analysis['individual_videos_exist'] else 'Split ZIP files require full concatenation before any extraction. Partial extraction is NOT possible.'}",
        "",
        "---",
        "",
        "## 5. Download Strategy Analysis",
        "",
        "### Approach 1: Full Archive Download + Extract",
        "",
        "```bash",
        "# Step 1: Download all video parts",
        "huggingface-cli download Exploration-Lab/iSign iSign-videos_v1.1_part_aa iSign-videos_v1.1_part_ab --repo-type dataset",
        "",
        "# Step 2: Concatenate parts",
        "cat iSign-videos_v1.1_part_aa iSign-videos_v1.1_part_ab > iSign-videos_v1.1.zip",
        "",
        "# Step 3: Extract specific videos",
        "unzip iSign-videos_v1.1.zip 'videos/ABC123.mp4' -d ./output/",
        "```",
        "",
        "**Pros:** Guarantees access to all videos",
        "**Cons:** Requires ~54GB disk space for videos, ~159GB for poses",
        "",
        "### Approach 2: Selective Download (if available)",
        "",
        "```bash",
        "# Download only specific files",
        "huggingface-cli download Exploration-Lab/iSign specific_video.mp4 --repo-type dataset",
        "```",
        "",
        f"**Status:** {'Available' if analysis['individual_videos_exist'] else 'NOT Available'}",
        "",
        "---",
        "",
        "## 6. Recommendation",
        "",
        f"### **{analysis['recommendation']}**: {'Selective download is possible' if analysis['recommendation'] == 'Option_A' else 'Entire archive is required'}",
        "",
        f"> {analysis['recommendation_reason']}",
        "",
        "### Recommended Workflow",
        "",
        "1. **Metadata first:** Download only `iSign_v1.1.csv` (9.35 MB) — already cached locally.",
        "2. **Select samples:** Choose N unique video IDs from CSV.",
        "3. **Download archives:** Download all video parts when disk space permits.",
        "4. **Concatenate:** Combine parts into single ZIP.",
        "5. **Extract selectively:** Unzip only the needed video files.",
        "6. **Clean up:** Remove the combined ZIP to free disk space.",
        "",
        "### Disk Space Requirements",
        "",
        "| Resource | Size | Required for extraction |",
        "|----------|------|------------------------|",
        "| Video parts | 53.92 GB | Yes (must concatenate first) |",
        "| Pose parts | 158.54 GB | Yes (must concatenate first) |",
        "| Combined video ZIP | ~54 GB | Temporary (can delete after extraction) |",
        "| Combined pose ZIP | ~159 GB | Temporary (can delete after extraction) |",
        "",
        "---",
        "",
        f"*Inspected {analysis['total_files']} files in {REPO_ID} on {datetime.now().strftime('%Y-%m-%d')}*",
    ])

    return "\n".join(lines)


def main():
    logger.info("=" * 60)
    logger.info("DATASET ARCHIVE INSPECTION")
    logger.info("=" * 60)

    # List all files
    files = list_all_files()

    # Analyze structure
    analysis = analyze_structure(files)

    # Generate archive_structure.md
    md_content = generate_archive_structure_md(analysis, files)
    md_path = EXPERIMENTS_DIR / "archive_structure.md"
    md_path.write_text(md_content, encoding="utf-8")
    logger.info(f"Saved: {md_path}")

    # Generate archive_files.json
    json_data = {
        "inspection_date": datetime.now().isoformat(),
        "repo_id": REPO_ID,
        "files": files,
        "analysis": analysis,
    }
    json_path = EXPERIMENTS_DIR / "archive_files.json"
    json_path.write_text(json.dumps(json_data, indent=2, default=str), encoding="utf-8")
    logger.info(f"Saved: {json_path}")

    # Print summary
    logger.info("=" * 60)
    logger.info("INSPECTION COMPLETE")
    logger.info("=" * 60)
    logger.info(f"Total files: {analysis['total_files']}")
    logger.info(f"Video parts: {analysis['video_archive_parts']['count']} ({analysis['video_archive_parts']['total_size_gb']:.2f} GB)")
    logger.info(f"Pose parts: {analysis['pose_archive_parts']['count']} ({analysis['pose_archive_parts']['total_size_gb']:.2f} GB)")
    logger.info(f"CSV files: {analysis['csv_files']['count']}")
    logger.info(f"Recommendation: {analysis['recommendation']}")
    logger.info(f"Reason: {analysis['recommendation_reason']}")
    logger.info(f"Reports: {md_path}, {json_path}")


if __name__ == "__main__":
    main()
