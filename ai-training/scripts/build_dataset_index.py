"""
Build Dataset Index for iSign.
Maps each UID to pose path, video path, and text.
"""
import os
import sys
import csv
import json
from pathlib import Path
from typing import Dict, List, Optional


def build_dataset_index(config_path: str = None) -> str:
    import yaml
    if config_path is None:
        config_path = os.path.join(os.path.dirname(__file__), '..', 'configs', 'dataset_paths.yaml')
    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)

    local = config.get('local', {})
    csv_path = local.get('csv_path', '')
    pose_dir = local.get('pose_dir', '')
    video_dir = local.get('video_dir', '')
    cache_dir = local.get('cache_dir', '')
    index_path = local.get('index_path', '')

    os.makedirs(cache_dir, exist_ok=True)

    print('=' * 60)
    print('  Building Dataset Index')
    print('=' * 60)

    # Load CSV
    print('\n[1/3] Loading CSV...')
    entries = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            uid = row.get('uid', '')
            text = row.get('text', '')
            base_uid = uid.split('_')[0] if '_' in uid else uid
            entries.append({'uid': uid, 'base_uid': base_uid, 'text': text})
    print(f'  Loaded {len(entries)} entries')

    # Find pose files
    print('\n[2/3] Scanning pose files...')
    pose_files = {}
    if os.path.exists(pose_dir):
        for f in Path(pose_dir).rglob('*.npy'):
            pose_files[f.stem] = str(f)
    print(f'  Found {len(pose_files)} pose files')

    # Find video files
    print('\n[3/3] Scanning video files...')
    video_files = {}
    if os.path.exists(video_dir):
        for ext in ['*.mp4', '*.avi', '*.mov']:
            for f in Path(video_dir).rglob(ext):
                video_files[f.stem] = str(f)
    print(f'  Found {len(video_files)} video files')

    # Build index
    print('\nBuilding index...')
    index = {
        'version': '1.0',
        'dataset': 'Exploration-Lab/iSign',
        'total_entries': len(entries),
        'found_poses': 0,
        'found_videos': 0,
        'entries': [],
    }

    for entry in entries:
        uid = entry['uid']
        base_uid = entry['base_uid']
        pose_path = pose_files.get(uid, pose_files.get(base_uid, ''))
        video_path = video_files.get(uid, video_files.get(base_uid, ''))

        idx_entry = {
            'uid': uid,
            'text': entry['text'],
            'pose_path': pose_path,
            'video_path': video_path,
        }
        index['entries'].append(idx_entry)
        if pose_path:
            index['found_poses'] += 1
        if video_path:
            index['found_videos'] += 1

    # Save
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f'\n  Total entries: {index["total_entries"]}')
    print(f'  Found poses:   {index["found_poses"]}')
    print(f'  Found videos:  {index["found_videos"]}')
    print(f'  Index saved:   {index_path}')

    print('\n' + '=' * 60)
    print('  Index Build Complete')
    print('=' * 60)

    return index_path


if __name__ == '__main__':
    config = sys.argv[1] if len(sys.argv) > 1 else None
    build_dataset_index(config)
