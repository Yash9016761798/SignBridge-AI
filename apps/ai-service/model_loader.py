"""
Model loader for SignBridge AI inference service.
Loads PoseTransformer and vocabulary from checkpoint at startup.
"""
import json
import sys
import logging
from pathlib import Path
from typing import Optional, Dict, Any

import torch

logger = logging.getLogger("signbridge.model_loader")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "ai-training"))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "ai-training" / "models"))


class Vocabulary:
    """Vocabulary loaded from checkpoint."""

    def __init__(self, word2idx: Dict[str, int], idx2word: Dict[int, str]):
        self.word2idx = word2idx
        self.idx2word = idx2word

    def decode(self, indices, skip_special: bool = True) -> str:
        special = {0, 1, 2}
        words = []
        for idx in indices:
            if skip_special and idx in special:
                continue
            words.append(self.idx2word.get(idx, "<unk>"))
        return " ".join(words)

    def __len__(self):
        return len(self.word2idx)


class ModelBundle:
    """Holds the loaded model, vocabulary, and configuration."""

    def __init__(self, model, vocab: Vocabulary, config: Dict[str, Any], device: torch.device):
        self.model = model
        self.vocab = vocab
        self.config = config
        self.device = device

    @property
    def vocab_size(self) -> int:
        return len(self.vocab)

    @property
    def d_model(self) -> int:
        return self.config.get("d_model", 0)

    @property
    def num_heads(self) -> int:
        return self.config.get("nhead", 0)

    @property
    def num_encoder_layers(self) -> int:
        return self.config.get("num_encoder_layers", 0)

    @property
    def num_decoder_layers(self) -> int:
        return self.config.get("num_decoder_layers", 0)

    @property
    def num_parameters(self) -> int:
        return sum(p.numel() for p in self.model.parameters())

    @property
    def max_seq_length(self) -> int:
        return self.config.get("max_seq_length", 30)


def load_model(checkpoint_path: str, vocab_path: str, device_str: str = "cpu") -> ModelBundle:
    """Load the PoseTransformer model and vocabulary from disk.

    Args:
        checkpoint_path: Path to the .pt checkpoint file.
        vocab_path: Path to the vocabulary JSON file.
        device_str: Device to load the model onto ("cpu" or "cuda").

    Returns:
        ModelBundle with model, vocabulary, config, and device.

    Raises:
        FileNotFoundError: If checkpoint or vocab file not found.
        RuntimeError: If model loading fails.
    """
    ckpt_path = Path(checkpoint_path)
    vcb_path = Path(vocab_path)

    if not ckpt_path.exists():
        raise FileNotFoundError(f"Checkpoint not found: {ckpt_path}")
    if not vcb_path.exists():
        raise FileNotFoundError(f"Vocabulary not found: {vcb_path}")

    logger.info("Loading checkpoint from %s", ckpt_path)
    checkpoint = torch.load(str(ckpt_path), map_location=device_str, weights_only=False)

    saved_config = checkpoint.get("config", {})
    model_cfg = saved_config.get("model", {})

    vocab_dict = checkpoint.get("vocab", {})
    vocab_size = vocab_dict.get("vocab_size", model_cfg.get("vocab_size", 978))

    logger.info("Loading vocabulary from %s", vcb_path)
    with open(vcb_path, "r", encoding="utf-8") as f:
        vocab_data = json.load(f)

    word2idx = vocab_data.get("word2idx", {})
    idx2word_raw = vocab_data.get("idx2word", {})
    idx2word = {int(k): v for k, v in idx2word_raw.items()}
    vocab = Vocabulary(word2idx, idx2word)

    device = torch.device(device_str)

    from transformer import PoseTransformer

    model = PoseTransformer(
        vocab_size=vocab_size,
        num_landmarks=33,
        num_features=5,
        d_model=model_cfg.get("d_model", 32),
        num_heads=model_cfg.get("nhead", 4),
        num_encoder_layers=model_cfg.get("num_encoder_layers", 1),
        num_decoder_layers=model_cfg.get("num_decoder_layers", 1),
        d_ff=model_cfg.get("dim_feedforward", 64),
        max_pose_length=model_cfg.get("max_seq_length", 30),
        max_text_length=model_cfg.get("max_seq_length", 30),
        dropout=0.0,
        pad_token_id=0,
        bos_token_id=1,
        eos_token_id=2,
    ).to(device)

    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    logger.info(
        "Model loaded: vocab=%d, d_model=%d, params=%s, device=%s",
        vocab_size, model_cfg.get("d_model", 0),
        f"{sum(p.numel() for p in model.parameters()):,}",
        device,
    )

    return ModelBundle(model=model, vocab=vocab, config=model_cfg, device=device)
