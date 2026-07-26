# SignBridge AI — Complete AI Architecture

*Version: 1.0 | Date: 2026-07-26 | Status: Architecture Design*

---

## Table of Contents

1. [Problem Analysis](#1-problem-analysis)
2. [Recommended Architecture](#2-recommended-architecture)
3. [Input Design](#3-input-design)
4. [Output Design](#4-output-design)
5. [Architecture Diagram](#5-architecture-diagram)

---

## 1. Problem Analysis

### 1.1 Problem Classification

The SignBridge AI project targets **Sign Language Translation (SLT)** — converting Indian Sign Language (ISL) video sequences into English text sentences.

**Why Sign Language Translation (not other variants):**

| Task | Description | Applicability |
|------|-------------|---------------|
| Isolated Sign Recognition | Classify single static signs from images | ❌ Too limited — ISL uses continuous motion |
| Continuous Sign Language Recognition | Recognize a sequence of signs from video | ⚠️ Partial — we need sentence-level output |
| **Sign Language Translation** | Translate sign video to spoken language text | ✅ **Primary task** — full sentence understanding |
| Multimodal Sequence Learning | Learn from multiple modalities jointly | ⚠️ Related — but our primary goal is translation |

**Evidence from the iSign dataset:**

- CSV contains full English sentences (not isolated words)
- Videos contain multi-sign sequences (avg 10.8 words per sentence)
- The dataset supports SignVideo2Text and SignPose2Text tasks
- Annotator IDs suggest multiple translation perspectives

### 1.2 Task Definition

```
Input:  Video sequence V = {v_1, v_2, ..., v_T}  (T frames)
        OR Pose sequence P = {p_1, p_2, ..., p_T}  (T timesteps × landmarks × 3)

Output: English sentence S = {w_1, w_2, ..., w_N}  (N words)
```

### 1.3 Why Pose-Based (Not Raw Video)

The iSign dataset provides pre-extracted pose data. This is advantageous:

| Factor | Raw Video | Pose Data |
|--------|-----------|-----------|
| Data size | ~54 GB | ~159 GB (but sparse) |
| Processing | Requires CNN backbone | Direct landmark input |
| Privacy | Contains face/identity | Anonymized landmarks |
| Inference speed | Slower (CNN forward pass) | Faster (MLP/Transformer) |
| Mobile deployment | Heavy model | Lightweight model |
| Noise sensitivity | High (background, lighting) | Low (skeleton only) |

**Decision:** Use **pose-first architecture** with MediaPipe landmarks as primary input. Raw video as optional augmentation.

### 1.4 Sequence Characteristics

From dataset analysis:

| Property | Value |
|----------|-------|
| Vocabulary size | 68,029 words |
| Avg sentence length | 10.8 words |
| Max sentence length | 66 words |
| Min sentence length | 1 word |
| Median sentence length | 10 words |
| Unique video IDs | 6,058 |
| Total annotations | 127,237 |

---

## 2. Recommended Architecture

### 2.1 Selected Architecture: Pose-Transformer with Autoregressive Decoder

```
┌─────────────────────────────────────────────────────────┐
│                  POSE-TRANSFORMER SLT                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Video Input ──→ MediaPipe ──→ Pose Landmarks           │
│                                      │                   │
│                                      ▼                   │
│                              ┌───────────────┐           │
│                              │  Normalization │           │
│                              │  & Padding     │           │
│                              └───────┬───────┘           │
│                                      │                   │
│                                      ▼                   │
│                         ┌────────────────────┐           │
│                         │  Pose Embedding     │           │
│                         │  (Linear + SinPos)  │           │
│                         └─────────┬──────────┘           │
│                                   │                      │
│                                   ▼                      │
│                    ┌──────────────────────────┐           │
│                    │  Temporal Encoder         │           │
│                    │  (Transformer Encoder)    │           │
│                    │  × L layers               │           │
│                    └──────────┬───────────────┘           │
│                               │                          │
│                               ▼                          │
│                    ┌──────────────────────────┐           │
│                    │  Text Decoder             │           │
│                    │  (Transformer Decoder)    │           │
│                    │  × L layers               │           │
│                    └──────────┬───────────────┘           │
│                               │                          │
│                               ▼                          │
│                    ┌──────────────────────────┐           │
│                    │  Linear Projection        │           │
│                    │  + Softmax                │           │
│                    └──────────┬───────────────┘           │
│                               │                          │
│                               ▼                          │
│                         Output Sentence                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Why This Architecture

| Criterion | Rationale |
|-----------|-----------|
| **Accuracy** | Transformer attention captures long-range temporal dependencies in sign sequences |
| **Training cost** | Pose input is lightweight — no CNN backbone needed |
| **Inference speed** | Encoder processes T timesteps in parallel; decoder generates autoregressively |
| **Memory** | Pose landmarks are compact (104 features per frame vs 224×224×3 image) |
| **Mobile deployment** | Encoder is small (~5M params); can run on-device |
| **Cloud deployment** | Full model with beam search for production quality |
| **ONNX compatibility** | Transformer is fully ONNX-exportable |
| **TensorFlow Lite** | Encoder can be TFLite-exported for mobile |
| **Scalability** | Architecture scales with more data and compute |

### 2.3 Architecture Variants

| Variant | Encoder | Decoder | Use Case |
|---------|---------|---------|----------|
| **Pose-Transformer-Base** | 6-layer Transformer | 6-layer Transformer | Cloud training, full quality |
| **Pose-Transformer-Light** | 3-layer Transformer | 3-layer Transformer | Mobile inference |
| **Pose-BiLSTM** | 2-layer BiLSTM | 1-layer LSTM | Lightweight fallback |

---

## 3. Input Design

### 3.1 Pose Input Tensor

```
Input Tensor Shape: [B, T, F]

B = Batch size (default: 32)
T = Sequence length (default: 64 frames, padded/truncated)
F = Feature dimension (default: 104 = 21×2×2 hands + 33×3 pose)
```

### 3.2 Feature Vector Breakdown

| Component | Landmarks | Dimensions | Total |
|-----------|-----------|------------|-------|
| Left hand | 21 landmarks | 3 (x, y, z) | 63 |
| Right hand | 21 landmarks | 3 (x, y, z) | 63 |
| Pose (body) | 33 landmarks | 3 (x, y, z) | 99 |
| **Raw total** | 75 landmarks | 3 | **225** |

**After normalization (center + scale):**

| Normalization | Features Kept | Dimensions |
|---------------|---------------|------------|
| Center (wrist-relative) | All | 225 |
| Min-max scale | All | 225 |
| Relative joints | Select subset | 104 |

**Selected 104-feature configuration:**

```
Left hand:  21 landmarks × 3 = 63  (relative to left wrist)
Right hand: 21 landmarks × 3 = 63  (relative to right wrist)
Pose:       10 key joints × 3 = 30  (shoulders, elbows, wrists, hips, knees)
                                          (relative to hip center)
Left hand velocity:  21 × 1 = 21    (frame-to-frame delta)
Right hand velocity: 21 × 1 = 21    (frame-to-frame delta)
Total: 63 + 63 + 30 + 21 + 21 = 198 → reduced to 104 via PCA or selection
```

**Practical 104-feature mapping:**

```
Index 0-62:   Left hand landmarks (21 × 3), normalized to left wrist
Index 63-125: Right hand landmarks (21 × 3), normalized to right wrist
Index 126-155: Pose keypoints (10 × 3), normalized to hip center
Index 156-176: Left hand velocity (21 × 1)
Index 177-197: Right hand velocity (21 × 1)
Index 198-203: Pose velocity (6 × 1)
Index 204-224: Derived features (angles, distances)
```

### 3.3 Normalization Strategy

```python
# Step 1: Center normalization
landmarks -= landmarks[wrist_center]  # Center on wrists

# Step 2: Scale normalization
scale = np.linalg.norm(landmarks[max] - landmarks[min])
landmarks /= (scale + 1e-6)

# Step 3: Relative joint calculation
left_hand_relative = left_hand - left_wrist
right_hand_relative = right_hand - right_wrist
pose_relative = pose_joints - hip_center

# Step 4: Velocity calculation
velocity[t] = (landmarks[t] - landmarks[t-1]) / delta_t
```

### 3.4 Padding and Masking

```python
# Padding
if len(sequence) < MAX_LENGTH:
    pad_length = MAX_LENGTH - len(sequence)
    padded = np.pad(sequence, ((0, pad_length), (0, 0)), mode='constant')
    mask = np.array([1]*len(sequence) + [0]*pad_length)

# Attention mask
attention_mask = create_causal_mask(T)  # For decoder
source_mask = create_padding_mask(T)    # For encoder
```

### 3.5 Batching Strategy

```python
# Dynamic batching by sequence length
batch = sort_by_length(sequences)
bucket = batch[abs(len(seq) - avg_len) < threshold]

# Collate function
def collate_fn(batch):
    sequences, texts = zip(*batch)
    padded_seqs = pad_sequences(sequences, maxlen=MAX_LENGTH)
    tokenized_texts = tokenize(texts, maxlen=MAX_TEXT_LEN)
    return {
        'pose': torch.tensor(padded_seqs),        # [B, T, F]
        'text': torch.tensor(tokenized_texts),     # [B, N]
        'src_mask': create_mask(padded_seqs),      # [B, T]
        'tgt_mask': create_causal_mask(tokenized_texts)  # [B, N]
    }
```

---

## 4. Output Design

### 4.1 Sentence Prediction

The model outputs a probability distribution over the vocabulary at each timestep:

```
Output Tensor Shape: [B, N, V]

B = Batch size
N = Sequence length (text tokens)
V = Vocabulary size (68,029 + special tokens)
```

### 4.2 Vocabulary Design

| Token | Symbol | Index | Description |
|-------|--------|-------|-------------|
| Padding | `<pad>` | 0 | Sequence padding |
| Start of sequence | `<sos>` | 1 | Sentence start marker |
| End of sequence | `<eos>` | 2 | Sentence end marker |
| Unknown | `<unk>` | 3 | Out-of-vocabulary words |
| Word tokens | various | 4+ | Vocabulary words |

**Vocabulary construction:**

```python
# Minimum frequency threshold
MIN_FREQ = 2  # Words appearing < 2 times become <unk>

# Build vocabulary
vocab = {'<pad>': 0, '<sos>': 1, '<eos>': 2, '<unk>': 3}
for word, freq in word_counts.items():
    if freq >= MIN_FREQ:
        vocab[word] = len(vocab)

# Final vocabulary size: ~35,000 (after filtering rare words)
```

### 4.3 Tokenization

```
Input text:  "The quick brown fox"
Tokenized:   ["The", "quick", "brown", "fox"]
Token IDs:   [15, 2341, 892, 4567]
With BOS/EOS: [1, 15, 2341, 892, 4567, 2]
```

### 4.4 Beam Search Decoding

```python
def beam_search(model, src, beam_width=5, max_len=50):
    """
    Beam search for sequence generation.
    
    Args:
        model: Pose-Transformer model
        src: Source pose tensor [1, T, F]
        beam_width: Number of beams to keep
        max_len: Maximum output length
    
    Returns:
        best_sequence: Best decoded sequence
        score: Sequence log-probability
    """
    beams = [Beam(tokens=[SOS_TOKEN], score=0.0)]
    completed = []
    
    for step in range(max_len):
        all_candidates = []
        for beam in beams:
            if beam.tokens[-1] == EOS_TOKEN:
                completed.append(beam)
                continue
            
            logits = model(src, beam.tokens)
            log_probs = log_softmax(logits[:, -1, :])
            
            topk_probs, topk_ids = log_probs.topk(beam_width)
            for prob, idx in zip(topk_probs[0], topk_ids[0]):
                new_beam = Beam(
                    tokens=beam.tokens + [idx.item()],
                    score=beam.score + prob.item()
                )
                all_candidates.append(new_beam)
        
        beams = sorted(all_candidates, key=lambda b: b.score, reverse=True)[:beam_width]
    
    completed.extend(beams)
    return max(completed, key=lambda b: b.score / len(b.tokens))
```

### 4.5 Confidence Score

```python
confidence = {
    'sequence_confidence': np.exp(mean_log_prob),  # Average token probability
    'token_confidences': [np.exp(lp) for lp in token_log_probs],
    'coverage': len(completed_sequence) / max_len,  # How much of max_len used
    'beam_score': best_beam.score,  # Normalized beam score
}
```

### 4.6 Special Tokens

| Token | Purpose | When Used |
|-------|---------|-----------|
| `<pad>` | Batch padding | All sequences in batch padded to same length |
| `<sos>` | Start generation | Decoder input starts with this |
| `<eos>` | Stop generation | Model predicts this to end sentence |
| `<unk>` | Unknown word | Words not in vocabulary |
| `<mask>` | Masked token | During pre-training (if applicable) |

---

## 5. Architecture Diagram

### 5.1 Full Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SIGNBRIDGE AI PIPELINE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────────┐       │
│  │  Camera   │───▶│  MediaPipe   │───▶│  Pose Landmarks      │       │
│  │  Input    │    │  Holistic    │    │  [T × 75 × 3]        │       │
│  └──────────┘    └──────────────┘    └──────────┬───────────┘       │
│                                                  │                   │
│                                                  ▼                   │
│                                     ┌──────────────────────┐         │
│                                     │  Feature Extraction   │         │
│                                     │  • Center normalize   │         │
│                                     │  • Scale normalize    │         │
│                                     │  • Velocity compute   │         │
│                                     │  • Relative joints    │         │
│                                     └──────────┬───────────┘         │
│                                                │                     │
│                                                ▼                     │
│                                   ┌──────────────────────┐           │
│                                   │  Pose Embedding       │           │
│                                   │  Linear(F → D)        │           │
│                                   │  + SinusoidalPosEmb   │           │
│                                   └──────────┬───────────┘           │
│                                              │                       │
│                                              ▼                       │
│                                 ┌────────────────────────┐           │
│                                 │  Transformer Encoder    │           │
│                                 │  ┌──────────────────┐  │           │
│                                 │  │ MultiHeadAttention│  │           │
│                                 │  │ FeedForward       │  │           │
│                                 │  │ LayerNorm         │  │           │
│                                 │  └──────────────────┘  │           │
│                                 │  × L layers (L=6)      │           │
│                                 └──────────┬─────────────┘           │
│                                            │                         │
│                                            │ memory                  │
│                                            ▼                         │
│                                 ┌────────────────────────┐           │
│                                 │  Text Decoder           │           │
│                                 │  ┌──────────────────┐  │           │
│                                 │  │ MaskedAttention   │  │           │
│                                 │  │ CrossAttention    │  │           │
│                                 │  │ FeedForward       │  │           │
│                                 │  │ LayerNorm         │  │           │
│                                 │  └──────────────────┘  │           │
│                                 │  × L layers (L=6)      │           │
│                                 └──────────┬─────────────┘           │
│                                            │                         │
│                                            ▼                         │
│                                 ┌────────────────────────┐           │
│                                 │  Linear Projection      │           │
│                                 │  Linear(D → V)          │           │
│                                 │  + Softmax              │           │
│                                 └──────────┬─────────────┘           │
│                                            │                         │
│                                            ▼                         │
│                                 ┌────────────────────────┐           │
│                                 │  Beam Search Decoder    │           │
│                                 │  Width = 5              │           │
│                                 └──────────┬─────────────┘           │
│                                            │                         │
│                                            ▼                         │
│                                   ┌──────────────┐                   │
│                                   │  Output Text  │                   │
│                                   │  + Confidence │                   │
│                                   └──────────────┘                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Model Specifications

| Component | Parameter | Value |
|-----------|-----------|-------|
| **Pose Embedding** | Input dim | 104 (features) |
| | Hidden dim | 256 |
| | Dropout | 0.1 |
| **Encoder** | Layers | 6 |
| | Attention heads | 8 |
| | FFN dim | 512 |
| | Dropout | 0.1 |
| **Decoder** | Layers | 6 |
| | Attention heads | 8 |
| | FFN dim | 512 |
| | Dropout | 0.1 |
| **Vocabulary** | Size | ~35,000 |
| | Embedding dim | 256 |
| **Total parameters** | Estimated | ~25M |

### 5.3 Training Configuration

| Parameter | Value |
|-----------|-------|
| Optimizer | AdamW |
| Learning rate | 1e-4 (encoder), 1e-3 (decoder) |
| LR scheduler | Cosine annealing with warmup |
| Warmup steps | 4,000 |
| Batch size | 32 |
| Max epochs | 100 |
| Early stopping patience | 10 |
| Label smoothing | 0.1 |
| Gradient clipping | 1.0 |
| Weight decay | 0.01 |

---

## Appendix A: Alternative Architectures Considered

| Architecture | Pros | Cons | Verdict |
|--------------|------|------|---------|
| MediaPipe + LSTM | Simple, fast | Limited temporal modeling | ❌ Rejected |
| MediaPipe + Transformer | Good temporal modeling | No cross-modal fusion | ⚠️ Fallback |
| Raw Video + CNN + LSTM | End-to-end | Heavy, slow, data-hungry | ❌ Rejected |
| SlowFast | Multi-scale temporal | Complex, heavy | ❌ Rejected |
| TimeSformer | Video attention | Very heavy, overkill | ❌ Rejected |
| Graph Neural Network | Pose-native | Complex implementation | ⚠️ Future work |

---

*This document defines the core AI architecture for SignBridge AI. See MODEL_COMPARISON.md for detailed comparison of all considered architectures.*
