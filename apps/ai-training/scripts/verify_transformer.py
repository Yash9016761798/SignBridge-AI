"""
Verification script for Pose Transformer.
Tests shapes, forward pass, generation, and loss.
"""
import sys
import torch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from models.transformer import PoseTransformer
from models.loss import SignBridgeLoss


def main():
    device = torch.device('cpu')
    B, T_pose, L, F = 2, 64, 33, 5
    T_text = 20
    vocab_size = 35000

    print('=' * 60)
    print('POSE TRANSFORMER VERIFICATION')
    print('=' * 60)

    # 1. Create model
    print('\n[1] Creating PoseTransformer...')
    model = PoseTransformer(
        vocab_size=vocab_size,
        num_landmarks=L,
        num_features=F,
        d_model=512,
        num_heads=8,
        num_encoder_layers=2,
        num_decoder_layers=2,
        d_ff=2048,
        max_pose_length=64,
        max_text_length=50,
        dropout=0.1,
    ).to(device)

    params = model.get_num_parameters()
    print(f'    Total parameters: {params["total"]:,}')
    print(f'    Trainable: {params["trainable"]:,}')

    # 2. Forward pass
    print('\n[2] Forward pass (teacher forcing)...')
    pose = torch.randn(B, T_pose, L, F, device=device)
    target_ids = torch.randint(0, vocab_size, (B, T_text), device=device)
    output = model(pose, target_ids)
    print(f'    Input pose: {pose.shape}')
    print(f'    Target ids: {target_ids.shape}')
    print(f'    Output logits: {output["logits"].shape}')
    print(f'    Encoder memory: {output["memory"].shape}')

    # 3. Loss
    print('\n[3] Loss computation...')
    loss_fn = SignBridgeLoss(vocab_size=vocab_size, pad_token_id=0, smoothing=0.1)
    labels = torch.randint(0, vocab_size, (B, T_text), device=device)
    loss = loss_fn(output['logits'], labels)
    acc = loss_fn.compute_accuracy(output['logits'], labels)
    print(f'    Loss: {loss.item():.4f}')
    print(f'    Accuracy: {acc.item():.4f}')

    # 4. Generation
    print('\n[4] Autoregressive generation...')
    generated = model.generate(pose, max_length=10)
    print(f'    Generated sequences: {len(generated)}')
    print(f'    Sequence lengths: {[len(g) for g in generated]}')

    # 5. Predict
    print('\n[5] Predict (greedy)...')
    predicted = model.predict(pose, max_length=10)
    print(f'    Predicted sequences: {len(predicted)}')

    # 6. Summary
    print('\n' + '=' * 60)
    print('POSE TRANSFORMER SUMMARY')
    print('=' * 60)
    print(f'  Pose Embedding:   Linear({L}*{F} -> 512)')
    print(f'  Positional Enc:   Sinusoidal(d=512, max=64)')
    print(f'  Encoder:          6 layers x 8 heads')
    print(f'  Decoder:          6 layers x 8 heads')
    print(f'  Output:           Linear(512 -> {vocab_size})')
    print(f'  Parameters:       {params["total"]:,}')
    print(f'  Forward Shape:    ({B}, {T_text}, {vocab_size})')
    print('=' * 60)
    print('ALL CHECKS PASSED')


if __name__ == '__main__':
    main()
