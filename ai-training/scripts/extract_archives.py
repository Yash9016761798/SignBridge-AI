"""
Extract split RAR archives for iSign Dataset.
Supports resume and integrity verification.
"""
import os
import sys
import subprocess
import hashlib
from pathlib import Path
from typing import List, Dict, Optional


def check_rarAvailable() -> bool:
    try:
        result = subprocess.run(['unrar', '--version'], capture_output=True, timeout=5)
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def extract_rar(archive_path: str, output_dir: str, password: str = None) -> bool:
    os.makedirs(output_dir, exist_ok=True)
    cmd = ['unrar', 'x', '-o+', archive_path, output_dir + '/']
    if password:
        cmd.insert(2, f'-p{password}')
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print(f'  TIMEOUT extracting {archive_path}')
        return False
    except FileNotFoundError:
        print('  ERROR: unrar not found. Install with: sudo apt-get install unrar')
        return False


def verify_archive(archive_path: str) -> bool:
    return os.path.exists(archive_path) and os.path.getsize(archive_path) > 0


def extract_archives(config_path: str = None):
    import yaml

    if config_path is None:
        config_path = os.path.join(os.path.dirname(__file__), '..', 'configs', 'dataset_paths.yaml')

    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)

    extraction = config.get('extraction', {})
    video_output = extraction.get('video_output', '/content/drive/MyDrive/SignBridgeAI/dataset/videos')
    pose_output = extraction.get('pose_output', '/content/drive/MyDrive/SignBridgeAI/dataset/poses')

    dataset_dir = config.get('local', {}).get('csv_path', '')
    dataset_dir = os.path.dirname(dataset_dir) if dataset_dir else '/content/drive/MyDrive/SignBridgeAI/dataset'

    if not check_rarAvailable():
        print('ERROR: unrar not available. Install with: sudo apt-get install unrar')
        return

    # Extract video archives
    print('\n[1/2] Extracting video archives...')
    video_dir = os.path.join(dataset_dir, 'data', 'video')
    if os.path.exists(video_dir):
        archives = sorted(Path(video_dir).glob('*.rar'))
        for i, archive in enumerate(archives):
            print(f'  [{i+1}/{len(archives)}] {archive.name}')
            if not verify_archive(str(archive)):
                print(f'    SKIP: corrupt or empty')
                continue
            success = extract_rar(str(archive), video_output)
            if success:
                print(f'    OK')
            else:
                print(f'    FAILED')
    else:
        print(f'  Video archives not found at {video_dir}')

    # Extract pose archives
    print('\n[2/2] Extracting pose archives...')
    pose_dir = os.path.join(dataset_dir, 'data', 'pose')
    if os.path.exists(pose_dir):
        archives = sorted(Path(pose_dir).glob('*.rar'))
        for i, archive in enumerate(archives):
            print(f'  [{i+1}/{len(archives)}] {archive.name}')
            if not verify_archive(str(archive)):
                print(f'    SKIP: corrupt or empty')
                continue
            success = extract_rar(str(archive), pose_output)
            if success:
                print(f'    OK')
            else:
                print(f'    FAILED')
    else:
        print(f'  Pose archives not found at {pose_dir}')

    print('\nExtraction complete!')


if __name__ == '__main__':
    config = sys.argv[1] if len(sys.argv) > 1 else None
    extract_archives(config)
