"""
Decoder module for SignBridge AI.
Post-processes model output into human-readable text.
"""
import re
from typing import List, Dict, Any


def clean_text(text: str) -> str:
    """Clean decoded text output.

    - Removes extra whitespace
    - Capitalizes first letter
    - Strips trailing/leading spaces
    """
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    if text:
        text = text[0].upper() + text[1:]
    return text


def decode_prediction(raw_output: Dict[str, Any]) -> Dict[str, Any]:
    """Decode raw model output into a clean prediction.

    Args:
        raw_output: Dict with 'token_ids', 'text', 'confidence', 'processing_time_ms'.

    Returns:
        Dict with cleaned 'text', original 'token_ids', 'confidence', 'processing_time_ms'.
    """
    return {
        "text": clean_text(raw_output["text"]),
        "tokens": raw_output["token_ids"],
        "confidence": raw_output["confidence"],
        "processing_time_ms": raw_output["processing_time_ms"],
    }


def tokens_to_text(token_ids: List[int], idx2word: Dict[int, str]) -> str:
    """Convert token IDs to text using vocabulary mapping.

    Args:
        token_ids: List of integer token IDs.
        idx2word: Mapping from token ID to word string.

    Returns:
        Decoded text string.
    """
    special = {0, 1, 2}
    words = []
    for tid in token_ids:
        if tid in special:
            continue
        words.append(idx2word.get(tid, "<unk>"))
    return clean_text(" ".join(words))
