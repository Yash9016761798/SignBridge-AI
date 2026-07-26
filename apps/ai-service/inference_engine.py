"""
Inference engine for SignBridge AI.
Runs the PoseTransformer model for prediction.
"""
import time
import logging
from typing import Dict, Any, Optional

import torch

from model_loader import ModelBundle
from preprocessor import preprocess_pose, create_pose_mask

logger = logging.getLogger("signbridge.inference")


class InferenceEngine:
    """Wraps PoseTransformer for structured inference."""

    def __init__(self, bundle: ModelBundle):
        self.bundle = bundle
        self.model = bundle.model
        self.vocab = bundle.vocab
        self.device = bundle.device

    @torch.no_grad()
    def predict(
        self,
        pose_sequence,
        max_length: Optional[int] = None,
        temperature: float = 1.0,
    ) -> Dict[str, Any]:
        """Run inference on a pose sequence.

        Args:
            pose_sequence: List of frames, shape (T, 33, 5).
            max_length: Max tokens to generate.
            temperature: Sampling temperature.

        Returns:
            Dict with keys: token_ids, text, confidence, processing_time_ms.
        """
        start = time.perf_counter()

        if max_length is None:
            max_length = self.bundle.config.get("max_seq_length", 30)

        pose_tensor = preprocess_pose(
            pose_sequence,
            max_length=max_length,
            num_landmarks=33,
            num_features=5,
        ).to(self.device)

        pose_mask = create_pose_mask(pose_tensor).to(self.device)

        generated = self.model.generate(
            pose_tensor,
            pose_mask=pose_mask,
            max_length=max_length,
            temperature=temperature,
        )

        token_ids = generated[0]
        text = self.vocab.decode(token_ids, skip_special=True)

        try:
            truncated = token_ids[:max_length]
            logits = self.model.decode(
                torch.tensor([truncated], dtype=torch.long, device=self.device),
                self.model.encode(pose_tensor, pose_mask),
                pose_mask,
            )
            probs = torch.softmax(logits, dim=-1)
            max_probs = probs.max(dim=-1).values
            non_pad = max_probs[0] != 0
            confidence = float(max_probs[0][non_pad].mean()) if non_pad.any() else 0.0
            confidence = max(0.0, min(1.0, confidence))
        except Exception:
            confidence = 0.0

        elapsed_ms = (time.perf_counter() - start) * 1000

        return {
            "token_ids": token_ids,
            "text": text,
            "confidence": confidence,
            "processing_time_ms": elapsed_ms,
        }
