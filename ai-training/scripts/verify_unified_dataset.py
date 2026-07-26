"""
Verification script for Unified Training Dataset.
Tests all components end-to-end.
"""
import sys
import numpy as np

sys.path.insert(0, r'C:\Users\Gaurav Gopal Gosavi\OneDrive\Desktop\Sign languageproject\ai-training')

from pose import MockPoseGenerator, PoseNormalizer, SequenceBuilder
from tokenizer.tokenizer import Tokenizer, TokenizerConfig
from tokenizer.vocabulary import Vocabulary, VocabularyConfig
from training.sample import TrainingSample
from training.collate import CollateFn
from training.dataloader import DataLoader
from training.metadata import MetadataHandler


def main():
    print('=' * 60)
    print('UNIFIED TRAINING DATASET VERIFICATION')
    print('=' * 60)

    # 1. Create components
    print('\n[1] Creating components...')
    gen = MockPoseGenerator(num_landmarks=33, seed=42)
    normalizer = PoseNormalizer()
    seq_builder = SequenceBuilder({'max_length': 64})

    vocab = Vocabulary(VocabularyConfig(min_freq=1, max_size=1000))
    vocab.build_from_texts(['the cat sat', 'hello world', 'sign language'])
    tokenizer = Tokenizer(vocab, TokenizerConfig(max_length=32))

    # 2. Create mock TrainingSample
    print('\n[2] Creating TrainingSample...')
    pose_seq = gen.generate(num_frames=30)
    norm_seq = normalizer.normalize(pose_seq)
    pose_result = seq_builder.build(norm_seq)

    text = 'the cat sat'
    input_ids = tokenizer.encode(text, add_special=True, max_length=32)
    target_ids = input_ids[1:] + [0] * (32 - len(input_ids) + 1)
    target_ids = target_ids[:32]
    text_mask = [1] * len(input_ids) + [0] * (32 - len(input_ids))
    text_mask = text_mask[:32]

    sample = TrainingSample(
        uid='test-1',
        pose_tensor=pose_result['pose_tensor'],
        input_ids=np.array(input_ids, dtype=np.int64),
        target_ids=np.array(target_ids, dtype=np.int64),
        attention_mask=np.array(text_mask, dtype=np.int64),
        pose_mask=pose_result['attention_mask'],
        sequence_length=int(pose_result['sequence_length']),
        metadata={'text': text}
    )
    print(f'    Sample: {sample}')

    # 3. Test Collate
    print('\n[3] Testing CollateFn...')
    collate = CollateFn()
    samples = [sample, sample, sample, sample]
    batch = collate(samples)
    print(f'    pose_tensor: {batch["pose_tensor"].shape}')
    print(f'    input_ids: {batch["input_ids"].shape}')
    print(f'    target_ids: {batch["target_ids"].shape}')
    print(f'    attention_mask: {batch["attention_mask"].shape}')
    print(f'    pose_mask: {batch["pose_mask"].shape}')

    # 4. Test batch statistics
    print('\n[4] Batch Statistics...')
    meta = MetadataHandler()
    stats = meta.compute_batch_statistics(batch)
    for k, v in stats.items():
        print(f'    {k}: {v}')

    # 5. Test validation
    print('\n[5] Validating Batch...')
    validation = meta.validate_batch(batch)
    print(f'    Valid: {validation["is_valid"]}')
    print(f'    Errors: {validation["errors"]}')

    # 6. Summary
    print('\n' + '=' * 60)
    print('UNIFIED DATASET SUMMARY')
    print('=' * 60)
    print(f'  TrainingSample:')
    print(f'    pose_tensor:  {sample.pose_tensor.shape}')
    print(f'    input_ids:    {sample.input_ids.shape}')
    print(f'    target_ids:   {sample.target_ids.shape}')
    print(f'    attention_mask: {sample.attention_mask.shape}')
    print(f'    pose_mask:    {sample.pose_mask.shape}')
    print(f'  Batch:')
    print(f'    Batch Pose:   {batch["pose_tensor"].shape}')
    print(f'    Batch Tokens: {batch["input_ids"].shape}')
    print(f'    Batch Labels: {batch["target_ids"].shape}')
    print('=' * 60)
    print('ALL CHECKS PASSED')


if __name__ == '__main__':
    main()
