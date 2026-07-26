"""
Transformer Decoder for SignBridge AI.
Autoregressive text decoder with cross-attention to pose encoding.
"""
import torch
import torch.nn as nn
from typing import Optional
from models.attention import SelfAttention, CrossAttention


class DecoderLayer(nn.Module):
    """Single transformer decoder layer."""

    def __init__(self, d_model: int = 512, num_heads: int = 8, d_ff: int = 2048, dropout: float = 0.1):
        super().__init__()
        self.masked_self_attn = SelfAttention(d_model, num_heads, dropout)
        self.cross_attn = CrossAttention(d_model, num_heads, dropout)
        self.feed_forward = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_ff, d_model),
            nn.Dropout(dropout),
        )
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.norm3 = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)

    def forward(
        self,
        x: torch.Tensor,
        memory: torch.Tensor,
        tgt_mask: Optional[torch.Tensor] = None,
        memory_mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        attn_out = self.masked_self_attn(x, tgt_mask)
        x = self.norm1(x + self.dropout(attn_out))
        cross_out = self.cross_attn(x, memory, memory_mask)
        x = self.norm2(x + self.dropout(cross_out))
        ff_out = self.feed_forward(x)
        x = self.norm3(x + ff_out)
        return x


class TransformerDecoder(nn.Module):
    """Stack of transformer decoder layers."""

    def __init__(
        self,
        num_layers: int = 6,
        d_model: int = 512,
        num_heads: int = 8,
        d_ff: int = 2048,
        dropout: float = 0.1,
    ):
        super().__init__()
        self.layers = nn.ModuleList([
            DecoderLayer(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])
        self.norm = nn.LayerNorm(d_model)

    def forward(
        self,
        x: torch.Tensor,
        memory: torch.Tensor,
        tgt_mask: Optional[torch.Tensor] = None,
        memory_mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        """
        Args:
            x: (B, T_tgt, d_model) target embeddings
            memory: (B, T_src, d_model) encoder output
            tgt_mask: causal mask
            memory_mask: padding mask on encoder output
        Returns:
            (B, T_tgt, d_model) decoded representation
        """
        for layer in self.layers:
            x = layer(x, memory, tgt_mask, memory_mask)
        return self.norm(x)
