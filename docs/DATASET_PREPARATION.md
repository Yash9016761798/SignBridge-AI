# Dataset Preparation Guide
SignBridge AI — Phase 15A

## Overview

Prepare the Exploration-Lab/iSign dataset for training on Google Colab.

## Dataset Info

| Property | Value |
|----------|-------|
| Source | Exploration-Lab/iSign (HuggingFace) |
| Total Rows | 127,237 |
| Unique Videos | 6,058 |
| CSV Columns | uid, text |
| Vocab Size | 68,241 |
| Pose Format | .npy (MediaPipe landmarks) |
| Video Format | .mp4 |

## Directory Structure

```
MyDrive/SignBridgeAI/dataset/
├── iSign_v1.1.csv           # Main CSV
├── data/
│   ├── video/               # Video RAR archives
│   │   ├── video.mp4.part1.rar
│   │   └── ...
│   └── pose/                # Pose RAR archives
│       ├── pose.mp4.part1.rar
│       └── ...
├── videos/                  # Extracted videos
├── poses/                   # Extracted pose .npy files
└── cache/
    └── dataset_index.json   # UID -> path mapping
```

## Files Created

### Scripts

| Script | Purpose |
|--------|---------|
| `scripts/download_isign.py` | Download from HuggingFace |
| `scripts/extract_archives.py` | Extract RAR archives |
| `scripts/verify_dataset.py` | Verify integrity |
| `scripts/build_dataset_index.py` | Build UID index |

### Notebooks

| Notebook | Purpose |
|----------|---------|
| `colab/01_mount_drive.ipynb` | Mount Google Drive |
| `colab/02_download_dataset.ipynb` | Download dataset |
| `colab/03_extract_dataset.ipynb` | Extract archives |
| `colab/04_verify_dataset.ipynb` | Verify dataset |
| `colab/05_build_index.ipynb` | Build index |

### Config

| File | Purpose |
|------|---------|
| `configs/dataset_paths.yaml` | All dataset paths |

## Verification Checklist

- [ ] CSV downloaded and readable
- [ ] All video archives downloaded (6 parts)
- [ ] All pose archives downloaded (12 parts)
- [ ] Videos extracted successfully
- [ ] Poses extracted successfully
- [ ] UIDs match between CSV and pose files
- [ ] dataset_index.json generated
- [ ] No corrupt files

## dataset_index.json Format

```json
{
  "version": "1.0",
  "dataset": "Exploration-Lab/iSign",
  "total_entries": 127237,
  "found_poses": 6058,
  "found_videos": 0,
  "entries": [
    {
      "uid": "video_001_frame_001",
      "text": "hello world",
      "pose_path": "/content/drive/.../poses/video_001_frame_001.npy",
      "video_path": ""
    }
  ]
}
```

## Post-Preparation

After dataset preparation:

1. Verify all steps passed
2. Check storage usage
3. Copy `dataset_index.json` to local machine for training
4. Proceed to Phase 16: Full Training

## Running Locally

```bash
# Download
python scripts/download_isign.py configs/dataset_paths.yaml

# Extract
python scripts/extract_archives.py configs/dataset_paths.yaml

# Verify
python scripts/verify_dataset.py configs/dataset_paths.yaml

# Build index
python scripts/build_dataset_index.py configs/dataset_paths.yaml
```
