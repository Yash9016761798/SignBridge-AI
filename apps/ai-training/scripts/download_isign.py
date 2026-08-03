"""
Download iSign Dataset from Hugging Face.
Supports resume and progress tracking.
"""
import os
import sys
import json
import hashlib
import time
from pathlib import Path
from typing import List, Dict, Optional


def get_hf_token() -> Optional[str]:
    token = os.environ.get('HF_TOKEN') or os.environ.get('HUGGING_FACE_HUB_TOKEN')
    if token:
        return token
    token_path = Path.home() / '.huggingface' / 'token'
    if token_path.exists():
        return token_path.read_text().strip()
    return None


def get_file_hash(filepath: str) -> str:
    h = hashlib.md5()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()


def download_file(repo_id: str, filename: str, output_dir: str, token: Optional[str] = None) -> str:
    from huggingface_hub import hf_hub_download
    os.makedirs(output_dir, exist_ok=True)
    print(f'  Downloading {filename}...')
    path = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        local_dir=output_dir,
        token=token,
    )
    print(f'  Downloaded: {path}')
    return path


def download_dataset(config_path: str = None):
    if config_path is None:
        config_path = os.path.join(os.path.dirname(__file__), '..', 'configs', 'dataset_paths.yaml')

    import yaml
    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)

    hf_config = config.get('huggingface', {})
    local_config = config.get('local', {})

    repo_id = hf_config.get('repo_id', 'Exploration-Lab/iSign')
    output_dir = local_config.get('csv_path', '/content/drive/MyDrive/SignBridgeAI/dataset')
    output_dir = os.path.dirname(output_dir)

    token = get_hf_token()
    if not token:
        print('WARNING: No HF token found. Set HF_TOKEN env var or run huggingface-cli login.')
        print('Proceeding without token (may fail for gated repos)...')

    print(f'Repository: {repo_id}')
    print(f'Output: {output_dir}')

    # Download CSV
    print('\n[1/3] Downloading CSV...')
    csv_file = hf_config.get('csv_filename', 'iSign_v1.1.csv')
    csv_path = download_file(repo_id, csv_file, output_dir, token)

    # Download video archives
    print('\n[2/3] Downloading video archives...')
    video_archives = hf_config.get('video_archives', [])
    for archive in video_archives:
        download_file(repo_id, archive, output_dir, token)

    # Download pose archives
    print('\n[3/3] Downloading pose archives...')
    pose_archives = hf_config.get('pose_archives', [])
    for archive in pose_archives:
        download_file(repo_id, archive, output_dir, token)

    print('\nDownload complete!')
    return csv_path


if __name__ == '__main__':
    config = sys.argv[1] if len(sys.argv) > 1 else None
    download_dataset(config)
