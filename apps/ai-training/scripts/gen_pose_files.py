"""Generate all pose pipeline files."""
import os

BASE = r'C:\Users\Gaurav Gopal Gosavi\OneDrive\Desktop\Sign languageproject\ai-training\pose'

files = {}

files['reader.py'] = '''"""
Pose Reader for SignBridge AI.
Reads pose data from multiple formats using adapter pattern.
"""
import json
import logging
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Union
from pose import Landmark, PoseFrame, PoseSequence

logger = logging.getLogger(__name__)


class PoseAdapter(ABC):
    @abstractmethod
    def read(self, source):
        pass
    @abstractmethod
    def can_read(self, source):
        pass


class MockJSONAdapter(PoseAdapter):
    def can_read(self, source):
        if isinstance(source, (str, Path)):
            path = Path(source)
            return path.suffix == '.json' and path.exists()
        return False

    def read(self, source):
        if isinstance(source, bytes):
            data = json.loads(source.decode('utf-8'))
        else:
            with open(source, 'r', encoding='utf-8') as f:
                data = json.load(f)
        frames = []
        for fd in data.get('frames', []):
            landmarks = []
            for lm in fd.get('landmarks', []):
                landmarks.append(Landmark(
                    x=lm.get('x', 0.0), y=lm.get('y', 0.0), z=lm.get('z', 0.0),
                    visibility=lm.get('visibility', 0.0), confidence=lm.get('confidence', 0.0)
                ))
            frames.append(PoseFrame(
                frame_index=fd.get('frame_index', len(frames)),
                timestamp=fd.get('timestamp', len(frames) / 30.0),
                landmarks=landmarks
            ))
        return PoseSequence(frames=frames, metadata=data.get('metadata', {}))


class MediaPipeAdapter(PoseAdapter):
    def can_read(self, source):
        if isinstance(source, (str, Path)):
            return Path(source).suffix == '.json' and Path(source).exists()
        return False

    def read(self, source):
        with open(source, 'r', encoding='utf-8') as f:
            data = json.load(f)
        frames = []
        for lm_list in data.get('landmarks', []):
            landmarks = [Landmark(x=l.get('x',0), y=l.get('y',0), z=l.get('z',0),
                         visibility=l.get('visibility',0), confidence=l.get('visibility',0)) for l in lm_list]
            frames.append(PoseFrame(frame_index=len(frames), timestamp=len(frames)/30.0, landmarks=landmarks))
        return PoseSequence(frames=frames, metadata={\'format\': \'mediapipe\'})


class ISignAdapter(PoseAdapter):
    def can_read(self, source):
        if isinstance(source, (str, Path)):
            return Path(source).suffix == '.pose'
        return False

    def read(self, source):
        try:
            from pose_format import Pose
            with open(source, \'rb\') as f:
                pose = Pose.read(f)
            frames = []
            for t in range(len(pose.body.data)):
                landmarks = []
                for l in range(len(pose.body.data[t])):
                    x, y, conf = pose.body.data[t, l]
                    landmarks.append(Landmark(x=float(x), y=float(y), z=0.0,
                                  visibility=float(conf), confidence=float(conf)))
                frames.append(PoseFrame(frame_index=t, timestamp=t/30.0, landmarks=landmarks))
            return PoseSequence(frames=frames, metadata={\'format\': \'isign\', \'source\': str(source)})
        except ImportError:
            raise ImportError(\'pose-format library required for iSign files\')


class PoseReader:
    def __init__(self):
        self._adapters = [MockJSONAdapter(), MediaPipeAdapter(), ISignAdapter()]

    def register_adapter(self, adapter):
        self._adapters.insert(0, adapter)

    def read(self, source):
        for adapter in self._adapters:
            if adapter.can_read(source):
                logger.info(f\'Reading {source} with {adapter.__class__.__name__}\')
                return adapter.read(source)
        raise ValueError(f\'No adapter found for {source}\')

    def read_json_string(self, json_str):
        adapter = MockJSONAdapter()
        return adapter.read(json_str.encode(\'utf-8\'))
'''

with open(os.path.join(BASE, 'reader.py'), 'w', encoding='utf-8') as f:
    f.write(files['reader.py'])
print('Created reader.py')
