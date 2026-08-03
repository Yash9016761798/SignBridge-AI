"""
Sinusoidal Positional Encoding for SignBridge AI.
Injects positional information into the pose sequence.
"""
import torch
import torch.nn as nn
import math


class SinusoidalPositionalEncoding(nn.Module):
    """
    Adds sinusoidal positional encoding to the input tensor.
    """

    def __init__(self, d_model: int = 512, max_len: int = 512, dropout: float = 0.1):
        super().__init__()
        self.d_model = d_model
        self.max_len = max_len
        self.dropout = nn.Dropout(dropout)

        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(
            torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model)
        )
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)
        self.register_buffer('pe', pe)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (B, T, d_model)
        Returns:
            (B, T, d_model) with positional encoding added
        """
        T = x.size(1)
        if T > self.max_len:
            raise ValueError(f'Sequence length {T} > max_len {self.max_len}')
        x = x + self.pe[:, :T, :]
        return self.dropout(x)
