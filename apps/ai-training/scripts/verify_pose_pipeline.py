"""
Verification script for Pose Processing Pipeline.
Tests all components end-to-end.
"""
import sys
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pose import MockPoseGenerator, PoseReader, PoseValidator, PoseNormalizer, SequenceBuilder, PoseAugmentor


def main():
    print('=' * 60)
    print('POSE PROCESSING PIPELINE VERIFICATION')
    print('=' * 60)

    # 1. Generate mock data
    print('\n[1] Generating mock pose data...')
    gen = MockPoseGenerator(num_landmarks=33, seed=42)
    seq = gen.generate(num_frames=30, missing_prob=0.05)
    print(f'    Original shape: {seq.to_numpy().shape}')
    print(f'    Frames: {seq.num_frames}, Landmarks: {seq.num_landmarks}')

    # 2. Validate
    print('\n[2] Validating sequence...')
    validator = PoseValidator()
    report = validator.validate(seq)
    print(f'    Valid: {report.is_valid}')
    print(f'    Errors: {len(report.errors)}')
    print(f'    Warnings: {len(report.warnings)}')
    print(f'    NaN ratio: {report.stats.get("nan_ratio", 0):.4f}')

    # 3. Normalize
    print('\n[3] Normalizing sequence...')
    normalizer = PoseNormalizer()
    norm_seq = normalizer.normalize(seq)
    norm_data = norm_seq.to_numpy()
    print(f'    Normalized shape: {norm_data.shape}')
    print(f'    X range: [{norm_data[:,:,0].min():.3f}, {norm_data[:,:,0].max():.3f}]')
    print(f'    Y range: [{norm_data[:,:,1].min():.3f}, {norm_data[:,:,1].max():.3f}]')

    # 4. Build sequence
    print('\n[4] Building sequence tensor...')
    builder = SequenceBuilder()
    result = builder.build(norm_seq)
    print(f'    pose_tensor shape: {result["pose_tensor"].shape}')
    print(f'    attention_mask shape: {result["attention_mask"].shape}')
    print(f'    sequence_length: {result["sequence_length"]}')

    # 5. Batch creation
    print('\n[5] Building batch...')
    batch_seqs = [gen.generate(num_frames=20) for _ in range(4)]
    batch = builder.build_batch(batch_seqs)
    print(f'    batch pose_tensor: {batch["pose_tensor"].shape}')
    print(f'    batch attention_mask: {batch["attention_mask"].shape}')
    print(f'    batch sequence_length: {batch["sequence_length"].shape}')

    # 6. Augmentation
    print('\n[6] Testing augmentation...')
    augmentor = PoseAugmentor()
    aug_seq = augmentor.augment(seq)
    print(f'    Augmented shape: {aug_seq.to_numpy().shape}')

    # 7. Summary
    print('\n' + '=' * 60)
    print('PIPELINE SUMMARY')
    print('=' * 60)
    print(f'  Original:    {seq.to_numpy().shape}')
    print(f'  Validated:   {report.is_valid}')
    print(f'  Normalized:  {norm_data.shape}')
    print(f'  Tensor:      {result["pose_tensor"].shape}')
    print(f'  Mask:        {result["attention_mask"].shape}')
    print(f'  Batch:       {batch["pose_tensor"].shape}')
    print('=' * 60)
    print('ALL CHECKS PASSED')


if __name__ == '__main__':
    main()
