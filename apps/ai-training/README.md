# SignBridge AI Training Workspace

Independent workspace for dataset analysis, preprocessing, model training, evaluation, and export.

**This is NOT the production inference service.** Production code lives in `apps/ai-service/`.

---

## Project Structure

```
ai-training/
├── notebooks/                    # Jupyter notebooks (interactive workflow)
│   ├── 01_dataset_analysis.ipynb
│   ├── 02_pose_analysis.ipynb
│   ├── 03_preprocessing.ipynb
│   ├── 04_model_training.ipynb
│   ├── 05_model_evaluation.ipynb
│   └── 06_export_model.ipynb
│
├── configs/                      # YAML configuration files
│   ├── dataset.yaml              # Dataset source, preprocessing, classes
│   ├── training.yaml             # Model, optimizer, scheduler, loss
│   └── model.yaml                # Export formats, metadata, integration
│
├── datasets/                     # Dataset storage (gitignored)
│   ├── README.md
│   └── sample/
│
├── scripts/                      # Python modules
│   ├── utils.py                  # Config loading, device detection, seeding
│   ├── analyze_dataset.py        # Dataset analysis and reporting
│   ├── preprocess.py             # Frame extraction, normalization, splits
│   ├── extract_landmarks.py      # MediaPipe landmark extraction
│   ├── train.py                  # Training loop, checkpointing, metrics
│   ├── evaluate.py               # Metrics, confusion matrix, visualization
│   └── export_model.py           # ONNX, TFLite, TorchScript export
│
├── models/                       # Model artifacts (gitignored)
│   ├── checkpoints/
│   ├── exported/
│   └── logs/
│
├── experiments/                  # Experiment logs (gitignored)
│
├── requirements.txt
├── README.md
└── .gitignore
```

---

## Installation

### Local Setup

```bash
cd ai-training
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Google Colab

```python
!git clone <repo-url>
%cd SignBridge-AI/ai-training
!pip install -r requirements.txt
```

---

## Configuration

All settings are in `configs/`. Override locally with `configs/local.yaml` (gitignored).

### Dataset (`configs/dataset.yaml`)

```yaml
source:
  type: 'huggingface' # "huggingface" | "local" | "gdrive"
  huggingface:
    repo_id: 'Exploration-Lab/iSign'
    streaming: true
```

### Training (`configs/training.yaml`)

```yaml
training:
  epochs: 50
optimizer:
  type: 'adamw'
  learning_rate: 0.001
dataloader:
  batch_size: 32
```

### Model Export (`configs/model.yaml`)

```yaml
export:
  formats: ['onnx', 'tflite', 'torchscript']
```

---

## Usage

### Workflow

Follow notebooks in order:

1. **01_dataset_analysis** - Understand the data
2. **02_pose_analysis** - Test MediaPipe landmarks
3. **03_preprocessing** - Extract and normalize data
4. **04_model_training** - Define and train model
5. **05_model_evaluation** - Evaluate performance
6. **06_export_model** - Export for production

### Running Scripts

```bash
python scripts/analyze_dataset.py
python scripts/preprocess.py
python scripts/extract_landmarks.py
python scripts/train.py
python scripts/evaluate.py
python scripts/export_model.py
```

---

## Dataset: Exploration-Lab/iSign

### HuggingFace Streaming (Recommended)

No download needed. Set in `configs/dataset.yaml`:

```yaml
source:
  type: 'huggingface'
  huggingface:
    repo_id: 'Exploration-Lab/iSign'
    streaming: true
```

### Local Dataset

1. Download from HuggingFace
2. Extract to `datasets/isign/`
3. Set `source.type: "local"` in config

### Google Drive (Colab)

1. Upload dataset to Google Drive
2. Mount in Colab:
   ```python
   from google.colab import drive
   drive.mount('/content/drive')
   ```
3. Set `source.type: "gdrive"` in config

---

## Export & Integration

### Exported Formats

| Format      | File                       | Use Case                |
| ----------- | -------------------------- | ----------------------- |
| ONNX        | `isl_gesture_model.onnx`   | Production (ai-service) |
| TFLite      | `isl_gesture_model.tflite` | Mobile/Edge             |
| TorchScript | `isl_gesture_model.pt`     | PyTorch deployment      |

### Deploy to ai-service

1. Export model (notebook 06)
2. Copy `.onnx` file to `apps/ai-service/models/`
3. Update `apps/ai-service/app/services/prediction.py`:
   - Load ONNX model with `onnxruntime`
   - Replace mock predictions with real inference
4. Test with `POST /api/v1/ai/predict`

---

## Key Rules

- **DO NOT** train automatically — this is infrastructure only
- **DO NOT** assume local dataset files exist
- **DO NOT** hardcode paths — always use configuration
- **DO NOT** modify `apps/web`, `apps/backend`, `apps/mobile`, `apps/ai-service`

---

## Next Phase

**Dataset Analysis** - Load the Exploration-Lab/iSign dataset and run notebook 01.
