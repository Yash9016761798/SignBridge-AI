"""
Verify iSign Dataset integrity.
Checks CSV, pose files, and reports statistics.
"""
import os
import sys
import csv
import json
from pathlib import Path
from typing import Dict, List, Set, Tuple


def verify_csv(csv_path: str) -> Dict:
    result = {'path': csv_path, 'exists': False, 'rows': 0, 'columns': [], 'errors': []}
    if not os.path.exists(csv_path):
        result['errors'].append('File not found')
        return result
    result['exists'] = True
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            result['columns'] = reader.fieldnames or []
            for row in reader:
                result['rows'] += 1
    except Exception as e:
        result['errors'].append(str(e))
    return result


def verify_poses(pose_dir: str, expected_uids: Set[str]) -> Dict:
    result = {'dir': pose_dir, 'exists': False, 'found': 0, 'missing': [], 'extra': []}
    if not os.path.exists(pose_dir):
        result['errors'] = ['Directory not found']
        return result
    result['exists'] = True

    found_uids = set()
    for f in Path(pose_dir).rglob('*.npy'):
        uid = f.stem
        found_uids.add(uid)

    result['found'] = len(found_uids)
    result['missing'] = list(expected_uids - found_uids)[:100]
    result['extra'] = list(found_uids - expected_uids)[:100]
    return result


def verify_videos(video_dir: str, expected_uids: Set[str]) -> Dict:
    result = {'dir': video_dir, 'exists': False, 'found': 0, 'missing': []}
    if not os.path.exists(video_dir):
        result['errors'] = ['Directory not found']
        return result
    result['exists'] = True

    found_uids = set()
    for ext in ['*.mp4', '*.avi', '*.mov']:
        for f in Path(video_dir).rglob(ext):
            found_uids.add(f.stem)

    result['found'] = len(found_uids)
    result['missing'] = list(expected_uids - found_uids)[:100]
    return result


def compute_statistics(csv_path: str) -> Dict:
    stats = {'total_rows': 0, 'unique_videos': 0, 'text_lengths': [], 'vocab': set()}
    uids = set()
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                stats['total_rows'] += 1
                uid = row.get('uid', '')
                text = row.get('text', '')
                uids.add(uid.split('_')[0] if '_' in uid else uid)
                stats['text_lengths'].append(len(text.split()))
                stats['vocab'].update(text.lower().split())
    except Exception:
        pass
    stats['unique_videos'] = len(uids)
    if stats['text_lengths']:
        stats['avg_text_length'] = sum(stats['text_lengths']) / len(stats['text_lengths'])
        stats['max_text_length'] = max(stats['text_lengths'])
        stats['min_text_length'] = min(stats['text_lengths'])
    stats['vocab_size'] = len(stats['vocab'])
    stats['vocab'] = None
    return stats


def verify_dataset(config_path: str = None) -> Dict:
    import yaml
    if config_path is None:
        config_path = os.path.join(os.path.dirname(__file__), '..', 'configs', 'dataset_paths.yaml')
    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)

    local = config.get('local', {})
    csv_path = local.get('csv_path', '')
    pose_dir = local.get('pose_dir', '')
    video_dir = local.get('video_dir', '')

    print('=' * 60)
    print('  iSign Dataset Verification')
    print('=' * 60)

    # CSV
    print('\n[1/4] Verifying CSV...')
    csv_result = verify_csv(csv_path)
    print(f'  Exists: {csv_result["exists"]}')
    print(f'  Rows: {csv_result["rows"]}')
    print(f'  Columns: {csv_result["columns"]}')

    # Get UIDs
    uids = set()
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                uid = row.get('uid', '')
                uids.add(uid.split('_')[0] if '_' in uid else uid)
    except Exception:
        pass

    # Poses
    print('\n[2/4] Verifying poses...')
    pose_result = verify_poses(pose_dir, uids)
    print(f'  Exists: {pose_result.get("exists", False)}')
    print(f'  Found: {pose_result.get("found", 0)}')
    print(f'  Missing: {len(pose_result.get("missing", []))}')

    # Videos
    print('\n[3/4] Verifying videos...')
    video_result = verify_videos(video_dir, uids)
    print(f'  Exists: {video_result.get("exists", False)}')
    print(f'  Found: {video_result.get("found", 0)}')

    # Statistics
    print('\n[4/4] Computing statistics...')
    stats = compute_statistics(csv_path)
    print(f'  Total rows: {stats["total_rows"]}')
    print(f'  Unique videos: {stats["unique_videos"]}')
    print(f'  Vocab size: {stats["vocab_size"]}')
    print(f'  Avg text length: {stats.get("avg_text_length", 0):.1f} words')

    # Storage
    total_size = 0
    for d in [pose_dir, video_dir]:
        if os.path.exists(d):
            for f in Path(d).rglob('*'):
                if f.is_file():
                    total_size += f.stat().st_size
    print(f'\n  Storage used: {total_size / 1024**3:.2f} GB')

    print('\n' + '=' * 60)
    print('  Verification Complete')
    print('=' * 60)

    return {
        'csv': csv_result,
        'poses': pose_result,
        'videos': video_result,
        'statistics': stats,
        'storage_bytes': total_size,
    }


if __name__ == '__main__':
    config = sys.argv[1] if len(sys.argv) > 1 else None
    result = verify_dataset(config)
