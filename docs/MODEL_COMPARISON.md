# SignBridge AI — Model Comparison

*Version: 1.0 | Date: 2026-07-26 | Status: Architecture Design*

---

## Table of Contents

1. [Comparison Matrix](#1-comparison-matrix)
2. [Detailed Analysis](#2-detailed-analysis)
3. [Architecture Categories](#3-architecture-categories)
4. [Selection Rationale](#4-selection-rationale)

---

## 1. Comparison Matrix

### 1.1 Accuracy & Performance

| Architecture | Accuracy (BLEU) | Training Cost | Inference Speed | Memory |
|--------------|-----------------|---------------|-----------------|--------|
| LSTM | 15-20 | Low | Fast (<10ms) | Low (5MB) |
| BiLSTM | 18-23 | Low | Fast (<10ms) | Low (8MB) |
| GRU | 16-21 | Low | Fast (<10ms) | Low (5MB) |
| Temporal CNN | 20-25 | Medium | Fast (<15ms) | Medium (15MB) |
| Transformer Encoder | 25-30 | Medium | Medium (20ms) | Medium (25MB) |
| Transformer Decoder | 25-30 | Medium | Medium (20ms) | Medium (25MB) |
| Vision Transformer (ViT) | 28-35 | High | Slow (50ms) | High (80MB) |
| TimeSformer | 32-38 | Very High | Slow (100ms) | Very High (300MB) |
| I3D | 30-36 | High | Slow (80ms) | High (120MB) |
| SlowFast | 33-39 | Very High | Slow (120ms) | Very High (200MB) |
| Pose Transformer | 28-35 | Low | Fast (15ms) | Low (25MB) |
| Graph Neural Network | 25-32 | Medium | Medium (30ms) | Medium (20MB) |
| **MediaPipe + LSTM** | **22-28** | **Low** | **Fast (<10ms)** | **Low (8MB)** |
| **MediaPipe + Transformer** | **30-37** | **Medium** | **Fast (15ms)** | **Low (25MB)** |
| **Pose Dataset + Transformer** | **32-38** | **Medium** | **Fast (15ms)** | **Low (25MB)** |

### 1.2 Deployment Suitability

| Architecture | Mobile | Cloud | ONNX | TFLite | Difficulty | Scalability |
|--------------|--------|-------|------|--------|------------|-------------|
| LSTM | ✅ | ✅ | ✅ | ✅ | Easy | Low |
| BiLSTM | ✅ | ✅ | ✅ | ✅ | Easy | Low |
| GRU | ✅ | ✅ | ✅ | ✅ | Easy | Low |
| Temporal CNN | ✅ | ✅ | ✅ | ✅ | Medium | Medium |
| Transformer Encoder | ✅ | ✅ | ✅ | ⚠️ | Medium | High |
| Transformer Decoder | ✅ | ✅ | ✅ | ⚠️ | Medium | High |
| Vision Transformer (ViT) | ⚠️ | ✅ | ✅ | ❌ | Hard | High |
| TimeSformer | ❌ | ✅ | ⚠️ | ❌ | Very Hard | Very High |
| I3D | ❌ | ✅ | ⚠️ | ❌ | Hard | High |
| SlowFast | ❌ | ✅ | ⚠️ | ❌ | Very Hard | Very High |
| Pose Transformer | ✅ | ✅ | ✅ | ⚠️ | Medium | High |
| Graph Neural Network | ⚠️ | ✅ | ⚠️ | ❌ | Hard | Medium |
| **MediaPipe + LSTM** | **✅** | **✅** | **✅** | **✅** | **Easy** | **Medium** |
| **MediaPipe + Transformer** | **✅** | **✅** | **✅** | **✅** | **Medium** | **High** |
| **Pose Dataset + Transformer** | **✅** | **✅** | **✅** | **✅** | **Medium** | **High** |

**Legend:** ✅ Full support | ⚠️ Partial/complex | ❌ Not supported

---

## 2. Detailed Analysis

### 2.1 LSTM (Long Short-Term Memory)

**Architecture:**
```
Input → LSTM(256) → LSTM(256) → Linear → Output
```

**Pros:**
- Simple to implement and train
- Fast inference (<10ms)
- Low memory footprint (5MB)
- Excellent TFLite support
- Well-understood training dynamics

**Cons:**
- Limited temporal receptive field
- Cannot parallelize across time
- Struggles with long sequences (>50 frames)
- Lower accuracy on complex sentences

**Best for:** Quick prototyping, mobile-first, fallback model

---

### 2.2 BiLSTM (Bidirectional LSTM)

**Architecture:**
```
Input → BiLSTM(256) → BiLSTM(256) → Linear → Output
```

**Pros:**
- Captures both forward and backward context
- Better than unidirectional LSTM
- Still fast and lightweight
- Good for offline processing

**Cons:**
- Cannot be used for real-time autoregressive decoding
- Slightly more complex than LSTM
- Still limited temporal modeling

**Best for:** Offline translation, bidirectional context needed

---

### 2.3 GRU (Gated Recurrent Unit)

**Architecture:**
```
Input → GRU(256) → GRU(256) → Linear → Output
```

**Pros:**
- Simpler than LSTM (fewer parameters)
- Similar performance to LSTM
- Faster training
- Good for smaller datasets

**Cons:**
- Same limitations as LSTM
- Slightly lower capacity than LSTM

**Best for:** Resource-constrained environments, quick experiments

---

### 2.4 Temporal CNN (1D Convolution)

**Architecture:**
```
Input → Conv1D(64) → Conv1D(128) → Conv1D(256) → Linear → Output
```

**Pros:**
- Parallelizable across time
- Fast inference
- Captures local temporal patterns
- Good for fixed-length sequences

**Cons:**
- Limited receptive field without dilations
- Needs careful kernel size tuning
- Less effective for variable-length sequences

**Best for:** Fixed-length pose sequences, real-time applications

---

### 2.5 Transformer Encoder

**Architecture:**
```
Input → Embedding → TransformerEncoder(6) → Linear → Output
```

**Pros:**
- Self-attention captures long-range dependencies
- Parallelizable across all timesteps
- State-of-the-art on many sequence tasks
- Scales well with more data

**Cons:**
- O(T²) memory for sequence length T
- Needs more data than RNNs
- Positional encoding design matters

**Best for:** Full sequence encoding, when memory allows

---

### 2.6 Transformer Decoder

**Architecture:**
```
Input → Embedding → TransformerDecoder(6) → Linear → Output
```

**Pros:**
- Autoregressive generation
- Cross-attention to encoder
- State-of-the-art for translation
- Beam search compatible

**Cons:**
- Sequential generation (cannot parallelize)
- Needs encoder for cross-modal input
- More complex training

**Best for:** Text generation from encoded pose

---

### 2.7 Vision Transformer (ViT)

**Architecture:**
```
Image → PatchEmbed → TransformerEncoder(12) → CLS → Linear → Output
```

**Pros:**
- State-of-the-art on image tasks
- Can process raw video frames
- Scales to large datasets
- Pre-trained models available

**Cons:**
- Very heavy for video (300MB+)
- Not designed for pose data
- Slow inference on mobile
- No TFLite support

**Best for:** Raw video classification, not pose-based SLT

---

### 2.8 TimeSformer

**Architecture:**
```
Video → Spatial-Temporal Transformer → Linear → Output
```

**Pros:**
- State-of-the-art on video understanding
- Joint spatial-temporal attention
- Pre-trained models available

**Cons:**
- Extremely heavy (300MB+)
- Very slow inference (100ms+)
- Not suitable for mobile
- Overkill for pose data

**Best for:** Large-scale video understanding research

---

### 2.9 I3D (Inflated 3D ConvNet)

**Architecture:**
```
Video → Inflated 3D Conv → Linear → Output
```

**Pros:**
- Good for action recognition
- Pre-trained on Kinetics
- Captures spatiotemporal features

**Cons:**
- Heavy model
- Not designed for pose
- Slow inference
- Complex training

**Best for:** Action recognition from raw video

---

### 2.10 SlowFast Networks

**Architecture:**
```
Video → Slow pathway (high capacity)
     → Fast pathway (low capacity)
     → Fusion → Linear → Output
```

**Pros:**
- Multi-scale temporal modeling
- State-of-the-art on video tasks
- Captures both slow and fast motion

**Cons:**
- Very complex architecture
- Very heavy model
- Slow inference
- Not suitable for mobile

**Best for:** Large-scale video understanding

---

### 2.11 Pose Transformer

**Architecture:**
```
Pose Landmarks → Linear Embedding → TransformerEncoder → Linear → Output
```

**Pros:**
- Designed specifically for pose data
- Lightweight (25MB)
- Fast inference (15ms)
- Good accuracy on pose tasks
- ONNX/TFLite compatible

**Cons:**
- Needs pose extraction (MediaPipe)
- Less pre-trained models available
- Needs more training data than RNNs

**Best for:** Pose-based sign language translation ✅

---

### 2.12 Graph Neural Network (GNN)

**Architecture:**
```
Pose Graph → GCN/GAT → Readout → Linear → Output
```

**Pros:**
- Natural representation for skeleton data
- Captures joint relationships
- Rotation invariant

**Cons:**
- Complex implementation
- Slower than Transformers
- Less ONNX support
- Limited TFLite support

**Best for:** Skeleton-based action recognition

---

### 2.13 MediaPipe + LSTM

**Architecture:**
```
Video → MediaPipe Holistic → Landmarks → LSTM → Linear → Output
```

**Pros:**
- Simple pipeline
- Fast inference
- Good for isolated signs
- Easy to implement

**Cons:**
- Limited temporal modeling
- Lower accuracy on complex sentences
- No cross-modal attention

**Best for:** Quick prototype, isolated sign recognition

---

### 2.14 MediaPipe + Transformer

**Architecture:**
```
Video → MediaPipe Holistic → Landmarks → Transformer → Linear → Output
```

**Pros:**
- Good temporal modeling
- Lightweight
- Fast inference
- ONNX/TFLite compatible
- Good balance of accuracy and speed

**Cons:**
- Needs MediaPipe at inference time
- No pre-trained pose models

**Best for:** Production deployment, mobile + cloud ✅

---

### 2.15 Pose Dataset + Transformer

**Architecture:**
```
Pre-extracted Pose → Transformer Encoder → Transformer Decoder → Linear → Output
```

**Pros:**
- Best accuracy for pose-based SLT
- No runtime pose extraction needed
- Full Transformer benefits
- Scales with data

**Cons:**
- Needs pre-extracted pose data
- Larger training pipeline
- More complex than MediaPipe + Transformer

**Best for:** Production SLT with pre-extracted features ✅

---

## 3. Architecture Categories

### 3.1 By Input Type

| Category | Architectures | Input |
|----------|---------------|-------|
| **Raw Video** | ViT, TimeSformer, I3D, SlowFast | RGB frames |
| **Pose-based** | Pose Transformer, GNN, MediaPipe + LSTM/Transformer | Landmarks |
| **Hybrid** | SlowFast + Pose, CNN + Transformer | Both |

### 3.2 By Model Size

| Category | Architectures | Size |
|----------|---------------|------|
| **Lightweight** (<10MB) | LSTM, BiLSTM, GRU | 5-8MB |
| **Medium** (10-50MB) | Temporal CNN, Pose Transformer, MediaPipe + Transformer | 15-25MB |
| **Heavy** (50-200MB) | Transformer, ViT, I3D | 80-120MB |
| **Very Heavy** (>200MB) | TimeSformer, SlowFast | 200-300MB |

### 3.3 By Deployment Target

| Category | Architectures | Target |
|----------|---------------|--------|
| **Mobile-first** | LSTM, BiLSTM, GRU, MediaPipe + LSTM | iOS/Android |
| **Cloud-first** | TimeSformer, SlowFast, I3D | GPU servers |
| **Both** | Pose Transformer, MediaPipe + Transformer | Mobile + Cloud |

---

## 4. Selection Rationale

### 4.1 Why Pose Transformer?

The **Pose Transformer** (or **MediaPipe + Transformer**) is selected for SignBridge AI because:

1. **Dataset alignment:** iSign provides pre-extracted pose data
2. **Accuracy:** Transformer attention captures temporal sign dynamics
3. **Efficiency:** 25MB model, 15ms inference — suitable for both mobile and cloud
4. **Deployment:** Full ONNX and TFLite support
5. **Scalability:** Architecture scales with more data and compute
6. **Maintainability:** Clean, well-understood architecture

### 4.2 Why Not Others?

| Architecture | Reason for Rejection |
|--------------|---------------------|
| LSTM/GRU | Limited temporal modeling for complex sentences |
| ViT | Too heavy, not designed for pose |
| TimeSformer | Overkill, not suitable for mobile |
| I3D | Not designed for pose data |
| SlowFast | Too complex, too heavy |
| GNN | Complex implementation, limited ONNX support |

### 4.3 Fallback Strategy

If Pose Transformer does not meet requirements:

| Priority | Fallback | Trigger |
|----------|----------|---------|
| 1 | MediaPipe + Transformer | Need real-time inference |
| 2 | BiLSTM | Need smallest possible model |
| 3 | Pose Transformer + Attention | Need better accuracy |
| 4 | GNN | Need rotation invariance |

---

## Appendix: Benchmark Estimates

Based on literature and similar projects:

| Architecture | BLEU (estimated) | Training Time (100 epochs) | Inference (per sentence) |
|--------------|------------------|---------------------------|-------------------------|
| LSTM | 15-20 | 2 hours | 5ms |
| BiLSTM | 18-23 | 2 hours | 8ms |
| GRU | 16-21 | 2 hours | 5ms |
| Temporal CNN | 20-25 | 4 hours | 10ms |
| Transformer Encoder | 25-30 | 8 hours | 15ms |
| Pose Transformer | 28-35 | 8 hours | 15ms |
| MediaPipe + Transformer | 30-37 | 10 hours | 20ms |
| Pose Dataset + Transformer | 32-38 | 10 hours | 15ms |

**Note:** These are estimates based on similar ISL translation tasks. Actual performance depends on data quality, preprocessing, and hyperparameters.

---

*This document provides a comprehensive comparison of all considered architectures. See AI_ARCHITECTURE.md for the recommended architecture design.*
