"""
PoseTransformer for SignBridge AI.
Complete encoder-decoder transformer for ISL-to-text translation.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional, Dict, Any, List
from models.embedding import PoseEmbedding
from models.positional_encoding import SinusoidalPositionalEncoding
from models.encoder import TransformerEncoder
from models.decoder import TransformerDecoder
from models.attention import create_padding_mask, create_causal_mask


class TextEmbedding(nn.Module):
    """Token embedding with positional encoding for the decoder."""

    def __init__(self, vocab_size: int, d_model: int = 512, max_len: int = 512, dropout: float = 0.1, pad_token_id: int = 0):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model, padding_idx=pad_token_id)
        self.scale = d_model ** 0.5
        self.pos_encoding = SinusoidalPositionalEncoding(d_model, max_len, dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.pos_encoding(self.embedding(x) * self.scale)


class PoseTransformer(nn.Module):
    """
    Complete Pose-to-Text Transformer.

    Architecture:
        Pose (B, T, L, F) → PoseEmbedding → Encoder
        Text tokens → TextEmbedding → Decoder (cross-attn to encoder)
        Decoder output → Linear → Vocabulary logits
    """

    def __init__(
        self,
        vocab_size: int = 35000,
        num_landmarks: int = 33,
        num_features: int = 5,
        d_model: int = 512,
        num_heads: int = 8,
        num_encoder_layers: int = 6,
        num_decoder_layers: int = 6,
        d_ff: int = 2048,
        max_pose_length: int = 64,
        max_text_length: int = 50,
        dropout: float = 0.1,
        pad_token_id: int = 0,
        bos_token_id: int = 1,
        eos_token_id: int = 2,
    ):
        super().__init__()
        self.vocab_size = vocab_size
        self.d_model = d_model
        self.pad_token_id = pad_token_id
        self.bos_token_id = bos_token_id
        self.eos_token_id = eos_token_id

        self.pose_embedding = PoseEmbedding(num_landmarks, num_features, d_model, dropout)
        self.pose_pos_encoding = SinusoidalPositionalEncoding(d_model, max_pose_length, dropout)

        self.text_embedding = TextEmbedding(vocab_size, d_model, max_text_length, dropout, pad_token_id)

        self.encoder = TransformerEncoder(num_encoder_layers, d_model, num_heads, d_ff, dropout)
        self.decoder = TransformerDecoder(num_decoder_layers, d_model, num_heads, d_ff, dropout)

        self.output_projection = nn.Linear(d_model, vocab_size)
        self._init_output_projection()

    def _init_output_projection(self):
        nn.init.xavier_uniform_(self.output_projection.weight)
        nn.init.zeros_(self.output_projection.bias)

    def encode(
        self,
        pose: torch.Tensor,
        pose_mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        """
        Args:
            pose: (B, T, L, F) raw pose
            pose_mask: (B, T) bool, True = padded frame
        Returns:
            (B, T, d_model) encoder output
        """
        x = self.pose_embedding(pose)
        x = self.pose_pos_encoding(x)

        enc_mask = None
        if pose_mask is not None:
            enc_mask = pose_mask.unsqueeze(1).unsqueeze(2)

        return self.encoder(x, enc_mask)

    def decode(
        self,
        target_ids: torch.Tensor,
        memory: torch.Tensor,
        pose_mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        """
        Args:
            target_ids: (B, T_tgt) token ids (teacher forcing)
            memory: (B, T_src, d_model) encoder output
            pose_mask: (B, T_src) encoder padding mask
        Returns:
            (B, T_tgt, vocab_size) logits
        """
        tgt_emb = self.text_embedding(target_ids)

        tgt_mask = create_causal_mask(target_ids.size(1), target_ids.device)

        memory_mask = None
        if pose_mask is not None:
            memory_mask = pose_mask.unsqueeze(1).unsqueeze(2)

        dec_out = self.decoder(tgt_emb, memory, tgt_mask, memory_mask)
        return self.output_projection(dec_out)

    def forward(
        self,
        pose: torch.Tensor,
        target_ids: torch.Tensor,
        pose_mask: Optional[torch.Tensor] = None,
    ) -> Dict[str, torch.Tensor]:
        """
        Training forward pass (teacher forcing).
        Args:
            pose: (B, T, L, F)
            target_ids: (B, T_tgt) with BOS prefix
            pose_mask: (B, T) padding mask
        Returns:
            dict with 'logits' (B, T_tgt, V)
        """
        memory = self.encode(pose, pose_mask)
        logits = self.decode(target_ids, memory, pose_mask)
        return {'logits': logits, 'memory': memory}

    @torch.no_grad()
    def generate(
        self,
        pose: torch.Tensor,
        pose_mask: Optional[torch.Tensor] = None,
        max_length: int = 50,
        temperature: float = 1.0,
        top_k: int = 0,
    ) -> List[List[int]]:
        """
        Autoregressive generation.
        Args:
            pose: (B, T, L, F)
            pose_mask: (B, T)
            max_length: max tokens to generate
            temperature: sampling temperature
            top_k: top-k sampling (0 = greedy)
        Returns:
            list of lists of token ids
        """
        B = pose.size(0)
        memory = self.encode(pose, pose_mask)

        memory_mask = None
        if pose_mask is not None:
            memory_mask = pose_mask.unsqueeze(1).unsqueeze(2)

        generated = torch.full((B, 1), self.bos_token_id, dtype=torch.long, device=pose.device)

        for _ in range(max_length):
            tgt_emb = self.text_embedding(generated)
            tgt_mask = create_causal_mask(generated.size(1), generated.device)
            dec_out = self.decoder(tgt_emb, memory, tgt_mask, memory_mask)
            logits = self.output_projection(dec_out[:, -1:, :]) / temperature

            if top_k > 0:
                topk_vals, _ = torch.topk(logits, top_k, dim=-1)
                logits[logits < topk_vals] = float('-inf')

            probs = F.softmax(logits, dim=-1)
            next_token = torch.argmax(probs, dim=-1)
            generated = torch.cat([generated, next_token], dim=1)

        return [generated[i].tolist() for i in range(B)]

    @torch.no_grad()
    def predict(
        self,
        pose: torch.Tensor,
        pose_mask: Optional[torch.Tensor] = None,
        max_length: int = 50,
    ) -> List[List[int]]:
        """Greedy generation (temperature=1, top_k=0)."""
        return self.generate(pose, pose_mask, max_length, temperature=1.0, top_k=0)

    def get_num_parameters(self) -> Dict[str, int]:
        total = sum(p.numel() for p in self.parameters())
        trainable = sum(p.numel() for p in self.parameters() if p.requires_grad)
        return {'total': total, 'trainable': trainable, 'frozen': total - trainable}
