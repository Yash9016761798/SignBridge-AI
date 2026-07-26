# SignBridge AI — Deployment Architecture

*Version: 1.0 | Date: 2026-07-26 | Status: Architecture Design*

---

## Table of Contents

1. [Deployment Pipeline](#1-deployment-pipeline)
2. [Training to ONNX](#2-training-to-onnx)
3. [FastAPI Inference](#3-fastapi-inference)
4. [Next.js Integration](#4-nextjs-integration)
5. [Flutter Mobile](#5-flutter-mobile)
6. [Model Optimization](#6-model-optimization)
7. [Monitoring & Logging](#7-monitoring--logging)

---

## 1. Deployment Pipeline

### 1.1 End-to-End Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Training   │───▶│ ONNX Export │───▶│   FastAPI   │───▶│   Next.js   │───▶│  Flutter    │
│   (PyTorch)  │    │             │    │  Inference  │    │  Frontend   │    │  Mobile     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼                   ▼
  ┌─────────┐        ┌─────────┐        ┌─────────┐        ┌─────────┐        ┌─────────┐
  │ .pt     │        │ .onnx   │        │ REST    │        │ API     │        │ TFLite  │
  │ weights │        │ model   │        │ /predict│        │ calls   │        │ model   │
  └─────────┘        └─────────┘        └─────────┘        └─────────┘        └─────────┘
```

### 1.2 Model Formats

| Stage | Format | Size | Use Case |
|-------|--------|------|----------|
| Training | PyTorch `.pt` | ~100MB | Training, experimentation |
| Export | ONNX `.onnx` | ~25MB | Production inference |
| Optimization | ONNX Optimized | ~15MB | Fast inference |
| Quantization | INT8 ONNX | ~8MB | Edge deployment |
| Mobile | TFLite | ~6MB | Mobile inference |

---

## 2. Training to ONNX

### 2.1 Export Process

```python
# scripts/deployment/export_onnx.py

def export_to_onnx(model, config, output_path="models/signbridge.onnx"):
    """
    Export trained PyTorch model to ONNX format.
    
    Args:
        model: Trained PoseTransformer model
        config: Model configuration
        output_path: Output ONNX file path
    """
    model.eval()
    
    # Create dummy inputs
    dummy_pose = torch.randn(1, config.max_seq_len, config.feature_dim)
    dummy_tgt = torch.randint(0, config.vocab_size, (1, config.max_text_len))
    
    # Export
    torch.onnx.export(
        model,
        (dummy_pose, dummy_tgt),
        output_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['pose', 'target'],
        output_names=['logits'],
        dynamic_axes={
            'pose': {0: 'batch_size', 1: 'seq_len'},
            'target': {0: 'batch_size', 1: 'text_len'},
            'logits': {0: 'batch_size', 1: 'text_len'}
        }
    )
    
    print(f"Model exported to {output_path}")
    
    # Verify
    verify_onnx_model(output_path)
```

### 2.2 ONNX Verification

```python
def verify_onnx_model(onnx_path):
    """Verify ONNX model is valid."""
    import onnx
    
    model = onnx.load(onnx_path)
    onnx.checker.check_model(model)
    
    # Test inference
    import onnxruntime as ort
    
    session = ort.InferenceSession(onnx_path)
    
    dummy_pose = np.random.randn(1, 64, 104).astype(np.float32)
    dummy_tgt = np.random.randint(0, 35000, (1, 50)).astype(np.int64)
    
    outputs = session.run(None, {
        'pose': dummy_pose,
        'target': dummy_tgt
    })
    
    print(f"ONNX verification passed. Output shape: {outputs[0].shape}")
```

### 2.3 ONNX Optimization

```python
def optimize_onnx_model(input_path, output_path):
    """Optimize ONNX model for inference."""
    from onnxruntime.transformers import optimizer
    
    # Optimize
    optimized_model = optimizer.optimize_model(
        input_path,
        model_type='bert',
        num_heads=8,
        hidden_size=256,
        optimization_options=None
    )
    
    optimized_model.save_model_to_file(output_path)
    
    print(f"Optimized model saved to {output_path}")
```

---

## 3. FastAPI Inference

### 3.1 Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI AI Service                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   Request    │───▶│  Preprocess  │───▶│   Inference  │   │
│  │   Handler    │    │   Pipeline   │    │   Engine     │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                               │              │
│                                               ▼              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   Response   │◀───│  Postprocess │◀───│  Beam Search │   │
│  │   Builder    │    │   Pipeline   │    │   Decoder    │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Model Loading

```python
# app/core/model_manager.py

class ModelManager:
    """Manages model loading and inference."""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.preprocessor = None
        self.config = None
    
    def load_model(self, model_path: str):
        """Load ONNX model and dependencies."""
        import onnxruntime as ort
        
        # Load ONNX model
        self.model = ort.InferenceSession(
            model_path,
            providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
        )
        
        # Load tokenizer
        self.tokenizer = Tokenizer.load('tokenizer/vocab.json')
        
        # Load preprocessor
        self.preprocessor = PosePreprocessor.load('preprocessor/stats.json')
        
        # Load config
        self.config = ModelConfig.load('models/config.json')
        
        print(f"Model loaded from {model_path}")
    
    def predict(self, pose_data: np.ndarray, beam_width: int = 5) -> dict:
        """
        Run inference on pose data.
        
        Args:
            pose_data: Raw pose landmarks [T, L, 3]
            beam_width: Beam search width
        
        Returns:
            Prediction with text and confidence
        """
        # Preprocess
        processed = self.preprocessor.process(pose_data)
        
        # Beam search decode
        result = self.beam_search(processed, beam_width)
        
        return result
```

### 3.3 API Endpoints

```python
# app/api/v1/prediction.py

from fastapi import APIRouter, UploadFile, File
from app.core.model_manager import ModelManager

router = APIRouter()
model_manager = ModelManager()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Predict sign language translation from video/pose data.
    
    Args:
        file: Video file or pre-extracted pose data
    
    Returns:
        PredictionResult with translated text and confidence
    """
    # Read input
    content = await file.read()
    
    # Parse based on file type
    if file.filename.endswith('.mp4'):
        pose_data = extract_pose_from_video(content)
    elif file.filename.endswith('.pose'):
        pose_data = parse_pose_file(content)
    else:
        raise ValueError(f"Unsupported file type: {file.filename}")
    
    # Run prediction
    result = model_manager.predict(pose_data)
    
    return {
        "success": True,
        "data": {
            "text": result['text'],
            "confidence": result['confidence'],
            "token_confidences": result['token_confidences'],
            "processing_time_ms": result['processing_time_ms'],
            "model_version": "1.0.0"
        }
    }

@router.post("/predict/batch")
async def predict_batch(files: List[UploadFile] = File(...)):
    """Batch prediction for multiple files."""
    results = []
    
    for file in files:
        content = await file.read()
        pose_data = parse_pose_file(content)
        result = model_manager.predict(pose_data)
        results.append(result)
    
    return {
        "success": True,
        "data": results,
        "total": len(results)
    }
```

### 3.4 Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/
COPY models/ ./models/
COPY tokenizer/ ./tokenizer/
COPY preprocessor/ ./preprocessor/

# Expose port
EXPOSE 8000

# Run
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  ai-service:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./models:/app/models
      - ./tokenizer:/app/tokenizer
    environment:
      - MODEL_PATH=/app/models/signbridge.onnx
      - LOG_LEVEL=info
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

---

## 4. Next.js Integration

### 4.1 API Client

```typescript
// lib/ai-client.ts

interface PredictionResult {
  success: boolean;
  data: {
    text: string;
    confidence: number;
    token_confidences: number[];
    processing_time_ms: number;
    model_version: string;
  };
}

interface TranslationResult {
  success: boolean;
  data: {
    sessionId: string;
    translation: {
      outputText: string;
      confidence: number;
      signs: Array<{
        word: string;
        signVideoUrl: string | null;
        duration: number;
      }>;
      totalDuration: number;
    };
  };
}

class AIClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.AI_SERVICE_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async predict(file: File): Promise<PredictionResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/v1/predict`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  async translate(text: string, sessionId?: string): Promise<TranslationResult> {
    const response = await fetch(`${this.baseUrl}/api/v1/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, session_id: sessionId }),
    });

    return response.json();
  }
}

export const aiClient = new AIClient();
```

### 4.2 React Component

```tsx
// components/AIPrediction.tsx

'use client';

import { useState, useRef } from 'react';
import { aiClient } from '@/lib/ai-client';

export function AIPrediction() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCapture = async () => {
    if (!videoRef.current) return;

    setLoading(true);
    try {
      // Capture frame from video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(videoRef.current, 0, 0);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const file = new File([blob], 'capture.png', { type: 'image/png' });
      const prediction = await aiClient.predict(file);
      setResult(prediction);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
      
      <button
        onClick={handleCapture}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        {loading ? 'Predicting...' : 'Capture & Predict'}
      </button>

      {result && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-lg font-semibold">{result.data.text}</p>
          <p className="text-sm text-gray-600">
            Confidence: {(result.data.confidence * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">
            {result.data.processing_time_ms}ms
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Flutter Mobile

### 5.1 TFLite Model

```python
# scripts/deployment/export_tflite.py

def export_to_tflite(onnx_path, output_path):
    """Convert ONNX model to TFLite."""
    import onnx
    from onnx_tf.backend import prepare
    import tensorflow as tf
    
    # Load ONNX
    onnx_model = onnx.load(onnx_path)
    
    # Convert to TensorFlow
    tf_rep = prepare(onnx_model)
    tf_rep.export_graph("models/tf_model")
    
    # Convert to TFLite
    converter = tf.lite.TFLiteConverter.from_saved_model("models/tf_model")
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float16]
    
    tflite_model = converter.convert()
    
    with open(output_path, 'wb') as f:
        f.write(tflite_model)
    
    print(f"TFLite model saved to {output_path}")
```

### 5.2 Flutter Integration

```dart
// lib/services/ai_service.dart

import 'dart:io';
import 'package:tflite_flutter/tflite_flutter.dart';

class AIService {
  static const String _modelPath = 'assets/models/signbridge.tflite';
  static const String _vocabPath = 'assets/models/vocab.json';
  
  late Interpreter _interpreter;
  late Map<String, int> _vocab;
  late Map<int, String> _reverseVocab;
  
  Future<void> initialize() async {
    // Load model
    _interpreter = await Interpreter.fromAsset(_modelPath);
    
    // Load vocabulary
    final vocabJson = await rootBundle.loadString(_vocabPath);
    _vocab = Map<String, int>.from(jsonDecode(vocabJson));
    _reverseVocab = _vocab.map((k, v) => MapEntry(v, k));
    
    print('AI Service initialized');
  }
  
  Future<PredictionResult> predict(List<List<double>> poseData) async {
    // Prepare input
    final input = [poseData];
    
    // Prepare output buffer
    final output = List<List<double>>.filled(
      1,
      List<double>.filled(50, 0),  // max_text_len
    );
    
    // Run inference
    _interpreter.run(input, output);
    
    // Decode output
    final text = _decodeOutput(output[0]);
    final confidence = _computeConfidence(output[0]);
    
    return PredictionResult(
      text: text,
      confidence: confidence,
      processingTimeMs: 0,  // TODO: measure
    );
  }
  
  String _decodeOutput(List<double> logits) {
    final tokens = <int>[];
    for (final logit in logits) {
      final tokenId = logit.round();
      if (tokenId == 2) break;  // EOS token
      if (tokenId > 3) tokens.add(tokenId);  // Skip special tokens
    }
    
    return tokens.map((t) => _reverseVocab[t] ?? '<unk>').join(' ');
  }
  
  double _computeConfidence(List<double> logits) {
    final probs = softmax(logits);
    return probs.reduce(max);
  }
  
  void dispose() {
    _interpreter.close();
  }
}
```

### 5.3 Flutter Camera Integration

```dart
// lib/screens/practice_screen.dart

class PracticeScreen extends StatefulWidget {
  @override
  _PracticeScreenState createState() => _PracticeScreenState();
}

class _PracticeScreenState extends State<PracticeScreen> {
  late CameraController _cameraController;
  late AIService _aiService;
  PredictionResult? _result;
  bool _isProcessing = false;
  
  @override
  void initState() {
    super.initState();
    _initializeCamera();
    _initializeAI();
  }
  
  Future<void> _initializeCamera() async {
    final cameras = await availableCameras();
    _cameraController = CameraController(
      cameras.first,
      ResolutionPreset.medium,
      enableAudio: false,
    );
    await _cameraController.initialize();
  }
  
  Future<void> _initializeAI() async {
    _aiService = AIService();
    await _aiService.initialize();
  }
  
  Future<void> _captureAndPredict() async {
    if (_isProcessing) return;
    
    setState(() => _isProcessing = true);
    
    try {
      // Capture image
      final image = await _cameraController.takePicture();
      
      // Extract pose (using MediaPipe or server)
      final poseData = await _extractPose(File(image.path));
      
      // Run prediction
      final result = await _aiService.predict(poseData);
      
      setState(() => _result = result);
    } catch (e) {
      print('Prediction failed: $e');
    } finally {
      setState(() => _isProcessing = false);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('AI Practice')),
      body: Column(
        children: [
          Expanded(
            child: CameraPreview(_cameraController),
          ),
          if (_result != null)
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                children: [
                  Text(
                    _result!.text,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  Text(
                    'Confidence: ${(_result!.confidence * 100).toStringAsFixed(1)}%',
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ),
          Padding(
            padding: EdgeInsets.all(16),
            child: ElevatedButton(
              onPressed: _isProcessing ? null : _captureAndPredict,
              child: Text(_isProcessing ? 'Processing...' : 'Capture & Predict'),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 6. Model Optimization

### 6.1 Quantization

```python
def quantize_model(onnx_path, output_path):
    """Quantize ONNX model to INT8."""
    from onnxruntime.quantization import quantize_dynamic, QuantType
    
    quantize_dynamic(
        onnx_path,
        output_path,
        weight_type=QuantType.QInt8
    )
    
    # Compare sizes
    original_size = os.path.getsize(onnx_path) / (1024 * 1024)
    quantized_size = os.path.getsize(output_path) / (1024 * 1024)
    
    print(f"Original: {original_size:.1f} MB")
    print(f"Quantized: {quantized_size:.1f} MB")
    print(f"Compression: {original_size / quantized_size:.1f}x")
```

### 6.2 Model Pruning

```python
def prune_model(model, sparsity=0.3):
    """Prune model weights."""
    import torch.nn.utils.prune as prune
    
    for name, module in model.named_modules():
        if isinstance(module, torch.nn.Linear):
            prune.l1_unstructured(module, name='weight', amount=sparsity)
    
    return model
```

### 6.3 Knowledge Distillation

```python
def distill(teacher_model, student_model, train_loader, temperature=4.0):
    """Knowledge distillation from teacher to student."""
    criterion = nn.KLDivLoss(reduction='batchmean')
    
    for batch in train_loader:
        pose = batch['pose']
        
        # Teacher predictions
        with torch.no_grad():
            teacher_logits = teacher_model(pose)
        
        # Student predictions
        student_logits = student_model(pose)
        
        # Distillation loss
        loss = criterion(
            F.log_softmax(student_logits / temperature, dim=-1),
            F.softmax(teacher_logits / temperature, dim=-1)
        ) * (temperature ** 2)
        
        # Train student
        loss.backward()
```

---

## 7. Monitoring & Logging

### 7.1 Metrics to Track

| Category | Metric | Threshold |
|----------|--------|-----------|
| **Performance** | Inference latency | < 50ms (p95) |
| | Throughput | > 100 req/s |
| | Error rate | < 1% |
| **Quality** | Average confidence | > 0.8 |
| | BLEU score | > 30 |
| **Infrastructure** | CPU usage | < 80% |
| | Memory usage | < 4GB |
| | GPU utilization | > 70% |

### 7.2 Logging Configuration

```python
# app/core/logging.py

import logging
from pythonjsonlogger import jsonlogger

def setup_logging():
    """Setup structured logging."""
    logger = logging.getLogger()
    
    handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        fmt='%(asctime)s %(levelname)s %(name)s %(message)s',
        rename_fields={'levelname': 'level', 'asctime': 'timestamp'}
    )
    handler.setFormatter(formatter)
    
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    
    return logger
```

### 7.3 Health Checks

```python
# app/api/v1/health.py

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": model_manager.is_loaded(),
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/health/ready")
async def readiness_check():
    """Readiness check for k8s."""
    if not model_manager.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {"status": "ready"}
```

---

## Appendix: Deployment Checklist

### Pre-Deployment

- [ ] Model exported to ONNX
- [ ] ONNX model verified
- [ ] Model optimized (quantized/pruned)
- [ ] Vocabulary exported
- [ ] Preprocessor statistics saved
- [ ] Docker image built
- [ ] Integration tests passing

### Deployment

- [ ] Environment variables configured
- [ ] GPU drivers installed (if applicable)
- [ ] Model files accessible
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Logging configured

### Post-Deployment

- [ ] Smoke tests passing
- [ ] Performance benchmarks met
- [ ] Error rates acceptable
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented

---

*This document defines the complete deployment architecture for SignBridge AI. See AI_ROADMAP.md for the overall roadmap.*
