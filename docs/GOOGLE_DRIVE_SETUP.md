# Google Drive Setup Guide
SignBridge AI — Phase 15A

## Prerequisites

1. Google Account with Google Drive
2. Google Colab Pro (recommended for GPU + storage)
3. Hugging Face account (for gated iSign dataset)

## Step 1: Create Google Drive Folders

Run `colab/01_mount_drive.ipynb` to create:

```
MyDrive/SignBridgeAI/
├── dataset/
│   ├── videos/
│   ├── poses/
│   └── cache/
├── checkpoints/
├── logs/
├── exports/
├── tensorboard/
├── experiments/
└── weights/
```

## Step 2: Set Up Hugging Face Token

1. Go to https://huggingface.co/settings/tokens
2. Create a new token (read access)
3. In Google Colab:
   - Go to Settings (gear icon) > Secrets
   - Add new secret:
     - Key: `HF_TOKEN`
     - Value: your token

## Step 3: Run Notebooks in Order

| Order | Notebook | Purpose |
|-------|----------|---------|
| 1 | `01_mount_drive.ipynb` | Mount drive, create dirs |
| 2 | `02_download_dataset.ipynb` | Download from HuggingFace |
| 3 | `03_extract_dataset.ipynb` | Extract RAR archives |
| 4 | `04_verify_dataset.ipynb` | Verify integrity |
| 5 | `05_build_index.ipynb` | Generate dataset_index.json |

## Storage Requirements

| Component | Size |
|-----------|------|
| Video archives | ~54 GB |
| Pose archives | ~159 GB |
| Extracted videos | ~54 GB |
| Extracted poses | ~159 GB |
| **Total** | **~426 GB** |

**Recommendation:** Use Google Colab Pro with high-RAM runtime.

## Troubleshooting

### Drive Mount Fails
- Ensure you're logged into the correct Google account
- Try: Runtime > Disconnect and delete runtime, then reconnect

### HuggingFace Download Fails
- Verify HF_TOKEN is set correctly
- Ensure you have access to the gated repo
- Try: `!huggingface-cli login` in a code cell

### Storage Quota Exceeded
- Check Drive storage: https://drive.google.com/settings/storage
- Delete unnecessary files or upgrade storage

### Extraction Hangs
- RAR extraction can be slow on large archives
- Use Colab Pro for better performance
- Check progress in the output cells
