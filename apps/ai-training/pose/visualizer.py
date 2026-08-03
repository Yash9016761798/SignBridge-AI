"""
Pose Visualizer for SignBridge AI.
Generates visualizations of pose data.
"""
import logging
import math
from pathlib import Path
from typing import Optional, List
from pose import PoseSequence

logger = logging.getLogger(__name__)

# MediaPipe pose connections
POSE_CONNECTIONS = [
    (11, 12), (11, 13), (13, 15), (12, 14), (14, 16),
    (11, 23), (12, 24), (23, 24), (23, 25), (24, 26),
    (25, 27), (26, 28), (27, 29), (28, 30), (29, 31), (30, 32),
]


class PoseVisualizer:
    def __init__(self, width=640, height=480):
        self.width = width
        self.height = height

    def plot_frame(self, sequence: PoseSequence, frame_idx: int, save_path: Optional[str] = None):
        try:
            import matplotlib.pyplot as plt
            import matplotlib.patches as patches
        except ImportError:
            logger.warning('matplotlib required for visualization')
            return None

        if frame_idx >= len(sequence.frames):
            return None

        frame = sequence.frames[frame_idx]
        fig, ax = plt.subplots(1, 1, figsize=(8, 6))
        ax.set_xlim(-1.1, 1.1)
        ax.set_ylim(-1.1, 1.1)
        ax.set_aspect('equal')
        ax.set_title(f'Pose Frame {frame_idx}')
        ax.grid(True, alpha=0.3)

        xs = [lm.x for lm in frame.landmarks]
        ys = [-lm.y for lm in frame.landmarks]
        confs = [lm.confidence for lm in frame.landmarks]

        for start, end in POSE_CONNECTIONS:
            if start < len(xs) and end < len(xs):
                ax.plot([xs[start], xs[end]], [ys[start], ys[end]], 'b-', alpha=0.5, linewidth=1)

        for i, (x, y, c) in enumerate(zip(xs, ys, confs)):
            color = plt.cm.RdYlGn(c)
            ax.scatter(x, y, c=[color], s=20, zorder=5)

        if save_path:
            Path(save_path).parent.mkdir(parents=True, exist_ok=True)
            fig.savefig(save_path, dpi=150, bbox_inches='tight')
            plt.close(fig)
            logger.info(f'Saved frame visualization to {save_path}')
        return fig

    def plot_statistics(self, sequence: PoseSequence, save_path: Optional[str] = None):
        try:
            import matplotlib.pyplot as plt
            import numpy as np
        except ImportError:
            return None

        data = sequence.to_numpy()
        if data.size == 0:
            return None

        fig, axes = plt.subplots(2, 2, figsize=(12, 8))

        T = data.shape[0]
        axes[0, 0].plot(range(T), data[:, :, 0].mean(axis=1))
        axes[0, 0].set_title('Mean X over time')
        axes[0, 0].set_xlabel('Frame')
        axes[0, 0].set_ylabel('X')

        axes[0, 1].plot(range(T), data[:, :, 1].mean(axis=1))
        axes[0, 1].set_title('Mean Y over time')
        axes[0, 1].set_xlabel('Frame')
        axes[0, 1].set_ylabel('Y')

        conf_means = data[:, :, 4].mean(axis=1)
        axes[1, 0].plot(range(T), conf_means)
        axes[1, 0].set_title('Mean Confidence over time')
        axes[1, 0].set_xlabel('Frame')
        axes[1, 0].set_ylabel('Confidence')

        axes[1, 1].hist(data[:, :, 4].flatten(), bins=20)
        axes[1, 1].set_title('Confidence Distribution')
        axes[1, 1].set_xlabel('Confidence')
        axes[1, 1].set_ylabel('Count')

        fig.suptitle(f'Pose Statistics ({T} frames, {data.shape[1]} landmarks)')
        plt.tight_layout()

        if save_path:
            Path(save_path).parent.mkdir(parents=True, exist_ok=True)
            fig.savefig(save_path, dpi=150, bbox_inches='tight')
            plt.close(fig)
            logger.info(f'Saved statistics to {save_path}')
        return fig
