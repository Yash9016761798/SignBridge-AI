"""
Pose Embedding for SignBridge AI.
Projects raw pose coordinates to the model's embedding dimension.
"""
import torch
import torch.nn as nn
import math


class PoseEmbedding(nn.Module):
    """
    Projects (B, T, L, F) pose data to (B, T, d_model).

    Reshapes landmark features to a flat vector per timestep,
    then projects via a linear layer.
    """

    def __init__(self, num_landmarks: int = 33, num_features: int = 5, d_model: int = 512, dropout: float = 0.1):
        super().__init__()
        self.num_landmarks = num_landmarks
        self.num_features = num_features
        self.input_dim = num_landmarks * num_features
        self.d_model = d_model

        self.projection = nn.Linear(self.input_dim, d_model)
        self.layer_norm = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)

        self._init_weights()

    def _init_weights(self):
        nn.init.xavier_uniform_(self.projection.weight)
        nn.init.zeros_(self.projection.bias)

    def forward(self, pose: torch.Tensor) -> torch.Tensor:
        """
        Args:
            pose: (B, T, L, F) raw pose coordinates
        Returns:
            (B, T, d_model) embedded pose sequence
        """
        B, T, L, F = pose.shape
        assert L == self.num_landmarks and F == self.num_features, \
            f'Expected ({self.num_landmarks}, {self.num_features}), got ({L}, {F})'

        x = pose.view(B, T, self.input_dim)
        x = self.projection(x)
        x = self.layer_norm(x)
        x = self.dropout(x)
        return x
