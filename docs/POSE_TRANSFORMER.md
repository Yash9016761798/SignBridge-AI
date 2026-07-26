# Pose Transformer Architecture
SignBridge AI — Phase 11

## Overview
Encoder-decoder transformer that translates ISL pose sequences to English text.

## Architecture

```
Input Pose: (B, T, 33, 5)
    ↓
PoseEmbedding: Linear(33×5 → 512) + LayerNorm + Dropout
    ↓
SinusoidalPositionalEncoding
    ↓
TransformerEncoder (6 layers × 8 heads)
    ↓ (memory: B, T, 512)

Target Tokens: (B, T_tgt)
    ↓
TextEmbedding: Embedding(35000 → 512) × scale
    ↓
SinusoidalPositionalEncoding
    ↓
TransformerDecoder (6 layers × 8 heads)
    ↓ (cross-attention to encoder memory)
    ↓
Linear(512 → 35000) → Logits
```

## Components

### PoseEmbedding
- Input: (B, T, 33, 5) → reshape to (B, T, 165)
- Linear(165 → 512) + LayerNorm + Dropout

### SinusoidalPositionalEncoding
- Standard sinusoidal encoding
- Configurable max_len

### MultiHeadAttention
- 8 heads, d_model=512, head_dim=64
- Supports causal masking and padding masking

### TransformerEncoder
- 6 layers, each with self-attention + FFN
- Pre-norm residual connections

### TransformerDecoder
- 6 layers, each with masked self-attn + cross-attn + FFN
- Pre-norm residual connections

### PoseTransformer
- `forward()`: teacher forcing, returns logits
- `generate()`: autoregressive with temperature/top-k
- `predict()`: greedy generation

### SignBridgeLoss
- Cross-entropy with label smoothing (0.1)
- Ignores padding tokens

## Configuration
`configs/model.yaml` — all hyperparameters

## Shape Reference
- Input: `(B, 64, 33, 5)`
- Encoder Memory: `(B, 64, 512)`
- Decoder Logits: `(B, 50, 35000)`
- Parameters: ~65M (trainable)
