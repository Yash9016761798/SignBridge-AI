"""
Model Export Script for SignBridge AI Training.

This script handles exporting trained models to production formats:
ONNX, TFLite, TorchScript.

DO NOT run export automatically — this is infrastructure only.
"""

import sys
import logging
import shutil
from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))

from utils import load_config, get_project_root, ensure_dir, setup_logging

logger = logging.getLogger(__name__)


# =============================================================================
# ONNX EXPORT
# =============================================================================

def export_to_onnx(
    model,
    input_shape: tuple,
    output_path: str,
    opset_version: int = 17,
    input_names: list = None,
    output_names: list = None,
) -> Path:
    """Export model to ONNX format.

    Args:
        model: PyTorch model.
        input_shape: Input tensor shape (batch, seq_len, features).
        output_path: Path to save ONNX model.
        opset_version: ONNX opset version.
        input_names: Names for input tensors.
        output_names: Names for output tensors.

    Returns:
        Path to saved ONNX model.
    """
    import torch

    if input_names is None:
        input_names = ["landmarks"]
    if output_names is None:
        output_names = ["prediction"]

    model.eval()
    dummy_input = torch.randn(*input_shape)

    output_path = ensure_dir(Path(output_path).parent) / Path(output_path).name

    torch.onnx.export(
        model,
        dummy_input,
        str(output_path),
        opset_version=opset_version,
        input_names=input_names,
        output_names=output_names,
        dynamic_axes={name: {0: "batch_size"} for name in input_names},
    )

    logger.info(f"ONNX model exported to {output_path}")
    return output_path


# =============================================================================
# TFLITE EXPORT
# =============================================================================

def export_to_tflite(
    onnx_path: str,
    output_path: str,
    quantize: bool = True,
) -> Path:
    """Export ONNX model to TFLite format via onnx2tf.

    Args:
        onnx_path: Path to ONNX model.
        output_path: Path to save TFLite model.
        quantize: Whether to apply quantization.

    Returns:
        Path to saved TFLite model.
    """
    try:
        import onnx
        from onnx_tf.backend import prepare
        import tensorflow as tf

        # Load ONNX model
        onnx_model = onnx.load(onnx_path)
        tf_rep = prepare(onnx_model)

        # Export to TensorFlow SavedModel
        temp_dir = ensure_dir(Path(output_path).parent / "temp_savedmodel")
        tf_rep.export_graph(str(temp_dir))

        # Convert to TFLite
        converter = tf.lite.TFLiteConverter.from_saved_model(str(temp_dir))
        if quantize:
            converter.optimizations = [tf.lite.Optimize.DEFAULT]

        tflite_model = converter.convert()

        output_path = ensure_dir(Path(output_path).parent) / Path(output_path).name
        output_path.write_bytes(tflite_model)

        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)

        logger.info(f"TFLite model exported to {output_path}")
        return output_path

    except ImportError as e:
        logger.warning(f"TFLite export requires onnx-tf and tensorflow: {e}")
        return Path(output_path)


# =============================================================================
# TORCHSCRIPT EXPORT
# =============================================================================

def export_to_torchscript(
    model,
    input_shape: tuple,
    output_path: str,
    jit_trace: bool = True,
) -> Path:
    """Export model to TorchScript format.

    Args:
        model: PyTorch model.
        input_shape: Input tensor shape.
        output_path: Path to save TorchScript model.
        jit_trace: Use tracing (True) or scripting (False).

    Returns:
        Path to saved TorchScript model.
    """
    import torch

    model.eval()
    dummy_input = torch.randn(*input_shape)

    output_path = ensure_dir(Path(output_path).parent) / Path(output_path).name

    if jit_trace:
        scripted_model = torch.jit.trace(model, dummy_input)
    else:
        scripted_model = torch.jit.script(model)

    scripted_model.save(str(output_path))

    logger.info(f"TorchScript model exported to {output_path}")
    return output_path


# =============================================================================
# MODEL VALIDATION
# =============================================================================

def validate_onnx_model(onnx_path: str) -> Dict[str, Any]:
    """Validate an exported ONNX model.

    Args:
        onnx_path: Path to ONNX model.

    Returns:
        Validation results dictionary.
    """
    try:
        import onnx
        import onnxruntime as ort

        model = onnx.load(onnx_path)
        onnx.checker.check_model(model)

        session = ort.InferenceSession(onnx_path)
        input_info = [
            {"name": inp.name, "shape": inp.shape, "type": inp.type}
            for inp in session.get_inputs()
        ]
        output_info = [
            {"name": out.name, "shape": out.shape, "type": out.type}
            for out in session.get_outputs()
        ]

        file_size_mb = Path(onnx_path).stat().st_size / (1024 * 1024)

        return {
            "valid": True,
            "file_size_mb": round(file_size_mb, 2),
            "inputs": input_info,
            "outputs": output_info,
            "opset_version": model.opset_import[0].version if model.opset_import else 0,
        }

    except Exception as e:
        return {"valid": False, "error": str(e)}


# =============================================================================
# FULL EXPORT PIPELINE
# =============================================================================

def export_model(model, config: Dict, input_shape: tuple) -> Dict[str, Any]:
    """Run full export pipeline for all configured formats.

    Args:
        model: Trained PyTorch model.
        config: Model export configuration.
        input_shape: Input tensor shape.

    Returns:
        Dictionary of export results.
    """
    export_config = config.get("export", {})
    metadata = config.get("metadata", {})
    filenames = config.get("integration", {}).get("filenames", {})

    export_dir = ensure_dir(get_project_root() / "models" / "exported")
    results = {}

    formats = export_config.get("formats", [])

    if "onnx" in formats:
        onnx_path = export_to_onnx(
            model,
            input_shape,
            str(export_dir / filenames.get("onnx", "model.onnx")),
            opset_version=export_config.get("onnx", {}).get("opset_version", 17),
        )
        results["onnx"] = validate_onnx_model(str(onnx_path))

    if "torchscript" in formats:
        ts_path = export_to_torchscript(
            model,
            input_shape,
            str(export_dir / filenames.get("torchscript", "model.pt")),
        )
        results["torchscript"] = {"path": str(ts_path)}

    if "tflite" in formats and "onnx" in results:
        tflite_path = export_to_tflite(
            str(export_dir / filenames.get("onnx", "model.onnx")),
            str(export_dir / filenames.get("tflite", "model.tflite")),
            quantize=export_config.get("tflite", {}).get("quantize", True),
        )
        results["tflite"] = {"path": str(tflite_path)}

    # Copy to ai-service if auto_deploy is enabled
    auto_deploy = config.get("integration", {}).get("auto_deploy", False)
    if auto_deploy:
        deploy_path = get_project_root().parent / config["integration"]["deploy_path"]
        if deploy_path.exists():
            for fmt, result in results.items():
                if "path" in result:
                    shutil.copy2(result["path"], deploy_path / Path(result["path"]).name)
                    logger.info(f"Deployed {fmt} model to {deploy_path}")

    return results


# =============================================================================
# MAIN
# =============================================================================

def main():
    """Export entry point (infrastructure only — no model is exported)."""
    setup_logging(level="INFO")

    config = load_config("model")

    logger.info("Export infrastructure ready")
    logger.info(f"Formats: {config.get('export', {}).get('formats', [])}")
    logger.info("Use notebook 06_export_model.ipynb to define model and export")


if __name__ == "__main__":
    main()
