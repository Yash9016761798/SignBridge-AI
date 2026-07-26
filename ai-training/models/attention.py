"""
Attention mechanisms for SignBridge AI.
Multi-head self-attention, cross-attention, and masked attention.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
import math
from typing import Optional


class MultiHeadAttention(nn.Module):
    """
    Multi-Head Attention mechanism.
    """

    def __init__(self, d_model: int = 512, num_heads: int = 8, dropout: float = 0.1):
        super().__init__()
        assert d_model % num_heads == 0, 'd_model must be divisible by num_heads'

        self.d_model = d_model
        self.num_heads = num_heads
        self.head_dim = d_model // num_heads

        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

        self.dropout = nn.Dropout(dropout)
        self.scale = math.sqrt(self.head_dim)

        self._init_weights()

    def _init_weights(self):
        for module in [self.W_q, self.W_k, self.W_v, self.W_o]:
            nn.init.xavier_uniform_(module.weight)
            nn.init.zeros_(module.bias)

    def forward(
        self,
        query: torch.Tensor,
        key: torch.Tensor,
        value: torch.Tensor,
        mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        """
        Args:
            query: (B, T_q, d_model)
            key: (B, T_k, d_model)
            value: (B, T_k, d_model)
            mask: (B, 1, 1, T_k) or (B, 1, T_q, T_k) — True = masked
        Returns:
            (B, T_q, d_model)
        """
        B, T_q, _ = query.shape
        T_k = key.size(1)

        Q = self.W_q(query).view(B, T_q, self.num_heads, self.head_dim).transpose(1, 2)
        K = self.W_k(key).view(B, T_k, self.num_heads, self.head_dim).transpose(1, 2)
        V = self.W_v(value).view(B, T_k, self.num_heads, self.head_dim).transpose(1, 2)

        scores = torch.matmul(Q, K.transpose(-2, -1)) / self.scale

        if mask is not None:
            scores = scores.masked_fill(mask, float('-inf'))

        attn = F.softmax(scores, dim=-1)
        attn = self.dropout(attn)

        context = torch.matmul(attn, V)
        context = context.transpose(1, 2).contiguous().view(B, T_q, self.d_model)
        return self.W_o(context)


class SelfAttention(nn.Module):
    """Self-attention: query = key = value = input."""

    def __init__(self, d_model: int = 512, num_heads: int = 8, dropout: float = 0.1):
        super().__init__()
        self.mha = MultiHeadAttention(d_model, num_heads, dropout)

    def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> torch.Tensor:
        return self.mha(x, x, x, mask)


class CrossAttention(nn.Module):
    """Cross-attention: query from decoder, key/value from encoder."""

    def __init__(self, d_model: int = 512, num_heads: int = 8, dropout: float = 0.1):
        super().__init__()
        self.mha = MultiHeadAttention(d_model, num_heads, dropout)

    def forward(
        self,
        query: torch.Tensor,
        memory: torch.Tensor,
        mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        return self.mha(query, memory, memory, mask)


def create_padding_mask(seq: torch.Tensor, pad_token_id: int = 0) -> torch.Tensor:
    """
    Creates a boolean mask for padding tokens.
    Args:
        seq: (B, T) token ids
    Returns:
        (B, 1, 1, T) True where padded
    """
    return (seq == pad_token_id).unsqueeze(1).unsqueeze(2)


def create_causal_mask(size: int, device: torch.device) -> torch.Tensor:
    """
    Creates a causal (autoregressive) mask.
    Args:
        size: sequence length
    Returns:
        (1, 1, size, size) True where future positions
    """
    mask = torch.triu(torch.ones(size, size, device=device), diagonal=1).bool()
    return mask.unsqueeze(0).unsqueeze(0)
