# SignBridge AI — Training Pipeline

*Version: 1.0 | Date: 2026-07-26 | Status: Architecture Design*

---

## Table of Contents

1. [Dataset Loader](#1-dataset-loader)
2. [Augmentation](#2-augmentation)
3. [Preprocessing](#3-preprocessing)
4. [Feature Engineering](#4-feature-engineering)
5. [Training Loop](#5-training-loop)
6. [Validation](#6-validation)
7. [Checkpointing](#7-checkpointing)
8. [Early Stopping](#8-early-stopping)
9. [Learning Rate Schedule](#9-learning-rate-schedule)
10. [Directory Structure](#10-directory-structure)

---

## 1. Dataset Loader

### 1.1 Data Sources

| Source | Format | Size | Purpose |
|--------|--------|------|---------|
| `iSign_v1.1.csv` | CSV | 9.35 MB | Main annotations (uid, text) |
| `word-description-dataset_v1.1.csv` | CSV | 0.06 MB | Word descriptions |
| `word-presence-dataset_v1.1.csv` | CSV | 0.13 MB | Word presence |
| Video archive | Split ZIP | 53.92 GB | Raw video files |
| Pose archive | Split ZIP | 158.54 GB | Pre-extracted pose data |

### 1.2 Dataset Class Design

```python
class ISignDataset(Dataset):
    """
    iSign Dataset Loader for Sign Language Translation.
    
    Loads pre-extracted pose landmarks and corresponding text annotations.
    Supports lazy loading for memory efficiency.
    """
    
    def __init__(self, 
                 csv_path: str,
                 pose_dir: str,
                 vocab: Vocabulary,
                 max_seq_len: int = 64,
                 max_text_len: int = 50,
                 transform=None):
        """
        Args:
            csv_path: Path to iSign_v1.1.csv
            pose_dir: Directory containing .pose files
            vocab: Vocabulary object for text tokenization
            max_seq_len: Maximum pose sequence length (frames)
            max_text_len: Maximum text sequence length (tokens)
            transform: Optional transform to apply to pose data
        """
        self.df = pd.read_csv(csv_path)
        self.pose_dir = Path(pose_dir)
        self.vocab = vocab
        self.max_seq_len = max_seq_len
        self.max_text_len = max_text_len
        self.transform = transform
        
        # Extract base IDs (video identifiers)
        self.df['base_id'] = self.df['uid'].str.rsplit('-', n=1).str[0]
        
        # Group by video
        self.video_groups = self.df.groupby('base_id')
    
    def __len__(self):
        return len(self.video_groups)
    
    def __getitem__(self, idx):
        # Get video group
        base_id = list(self.video_groups.groups.keys())[idx]
        group = self.video_groups.get_group(base_id)
        
        # Load pose data
        pose_path = self.pose_dir / f"{base_id}.pose"
        pose_data = self._load_pose(pose_path)
        
        # Get text annotation (first sentence for this video)
        text = group['text'].iloc[0]
        
        # Apply transform
        if self.transform:
            pose_data = self.transform(pose_data)
        
        # Tokenize text
        tokens = self.vocab.encode(text)
        
        return {
            'pose': pose_data,
            'text': tokens,
            'base_id': base_id,
            'raw_text': text
        }
    
    def _load_pose(self, path: Path) -> np.ndarray:
        """Load .pose file and extract landmarks."""
        from pose_format import Pose
        
        with open(path, 'rb') as f:
            pose = Pose.read(f)
        
        # Extract body, hand, and face landmarks
        # Shape: [T, num_landmarks, 3] (x, y, confidence)
        landmarks = pose.body.data
        
        # Truncate or pad to max_seq_len
        if len(landmarks) > self.max_seq_len:
            landmarks = landmarks[:self.max_seq_len]
        
        return landmarks
```

### 1.3 DataLoader Configuration

```python
# Training DataLoader
train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    shuffle=True,
    num_workers=4,
    pin_memory=True,
    collate_fn=collate_fn,
    drop_last=True
)

# Validation DataLoader
val_loader = DataLoader(
    val_dataset,
    batch_size=64,
    shuffle=False,
    num_workers=4,
    pin_memory=True,
    collate_fn=collate_fn
)

# Test DataLoader
test_loader = DataLoader(
    test_dataset,
    batch_size=64,
    shuffle=False,
    num_workers=4,
    collate_fn=collate_fn
)
```

### 1.4 Train/Val/Test Split

```python
# Split by video ID (not by annotation)
# Ensures no data leakage between splits

video_ids = df['base_id'].unique()
np.random.shuffle(video_ids)

# 80% train, 10% val, 10% test
train_ids = video_ids[:int(0.8 * len(video_ids))]
val_ids = video_ids[int(0.8 * len(video_ids)):int(0.9 * len(video_ids))]
test_ids = video_ids[int(0.9 * len(video_ids)):]

# Statistics
# Train: ~4,846 videos, ~101,790 annotations
# Val: ~606 videos, ~12,724 annotations
# Test: ~606 videos, ~12,723 annotations
```

---

## 2. Augmentation

### 2.1 Pose Augmentation

```python
class PoseAugmentation:
    """Data augmentation for pose sequences."""
    
    def __init__(self,
                 rotation_range=15,
                 scale_range=(0.9, 1.1),
                 translate_range=0.1,
                 noise_std=0.01,
                 time_mask_prob=0.1,
                 feature_mask_prob=0.1):
        self.rotation_range = rotation_range
        self.scale_range = scale_range
        self.translate_range = translate_range
        self.noise_std = noise_std
        self.time_mask_prob = time_mask_prob
        self.feature_mask_prob = feature_mask_prob
    
    def __call__(self, pose: np.ndarray) -> np.ndarray:
        """
        Apply random augmentations to pose sequence.
        
        Args:
            pose: [T, F] or [T, L, 3] pose sequence
        Returns:
            Augmented pose sequence
        """
        pose = pose.copy()
        
        # 1. Random rotation
        if np.random.random() < 0.5:
            angle = np.random.uniform(-self.rotation_range, self.rotation_range)
            pose = self._rotate_pose(pose, angle)
        
        # 2. Random scaling
        if np.random.random() < 0.5:
            scale = np.random.uniform(*self.scale_range)
            pose = pose * scale
        
        # 3. Random translation
        if np.random.random() < 0.5:
            tx = np.random.uniform(-self.translate_range, self.translate_range)
            ty = np.random.uniform(-self.translate_range, self.translate_range)
            pose[:, :, 0] += tx
            pose[:, :, 1] += ty
        
        # 4. Gaussian noise
        if np.random.random() < 0.5:
            noise = np.random.normal(0, self.noise_std, pose.shape)
            pose = pose + noise
        
        # 5. Temporal masking (random frames)
        if np.random.random() < self.time_mask_prob:
            pose = self._temporal_mask(pose)
        
        # 6. Feature masking (random landmarks)
        if np.random.random() < self.feature_mask_prob:
            pose = self._feature_mask(pose)
        
        return pose
    
    def _rotate_pose(self, pose, angle):
        """Rotate pose around center."""
        # Implementation details...
        return pose
    
    def _temporal_mask(self, pose):
        """Randomly zero out consecutive frames."""
        T = pose.shape[0]
        mask_len = np.random.randint(1, T // 4)
        start = np.random.randint(0, T - mask_len)
        pose[start:start + mask_len] = 0
        return pose
    
    def _feature_mask(self, pose):
        """Randomly zero out landmark features."""
        F = pose.shape[-1]
        mask_indices = np.random.choice(F, size=F // 4, replace=False)
        pose[..., mask_indices] = 0
        return pose
```

### 2.2 Text Augmentation

```python
class TextAugmentation:
    """Data augmentation for text annotations."""
    
    def __init__(self, vocab, swap_prob=0.1, drop_prob=0.1):
        self.vocab = vocab
        self.swap_prob = swap_prob
        self.drop_prob = drop_prob
    
    def __call__(self, text: str) -> str:
        """Apply random augmentations to text."""
        tokens = text.split()
        
        # Random word swap
        if np.random.random() < self.swap_prob and len(tokens) > 2:
            i, j = np.random.choice(len(tokens), 2, replace=False)
            tokens[i], tokens[j] = tokens[j], tokens[i]
        
        # Random word drop
        if np.random.random() < self.drop_prob and len(tokens) > 2:
            drop_idx = np.random.randint(0, len(tokens))
            tokens.pop(drop_idx)
        
        return ' '.join(tokens)
```

### 2.3 Augmentation Pipeline

```python
# Training augmentation
train_transform = Compose([
    PoseAugmentation(
        rotation_range=15,
        scale_range=(0.9, 1.1),
        translate_range=0.1,
        noise_std=0.01,
        time_mask_prob=0.1,
        feature_mask_prob=0.1
    ),
    NormalizePose(),  # Center + scale normalization
    ToTensor()
])

# Validation/Test (no augmentation)
val_transform = Compose([
    NormalizePose(),
    ToTensor()
])
```

---

## 3. Preprocessing

### 3.1 Pose Preprocessing

```python
class PosePreprocessor:
    """Preprocess pose landmarks for model input."""
    
    def __init__(self, 
                 max_seq_len: int = 64,
                 num_landmarks: int = 75,
                 normalize: bool = True):
        self.max_seq_len = max_seq_len
        self.num_landmarks = num_landmarks
        self.normalize = normalize
    
    def preprocess(self, pose: np.ndarray) -> np.ndarray:
        """
        Preprocess pose sequence.
        
        Args:
            pose: Raw pose [T, L, 3] or [T, F]
        Returns:
            Preprocessed pose [T, F]
        """
        # 1. Reshape if needed
        if pose.ndim == 3:
            pose = pose.reshape(pose.shape[0], -1)
        
        # 2. Truncate or pad to max_seq_len
        pose = self._pad_or_truncate(pose)
        
        # 3. Normalize
        if self.normalize:
            pose = self._normalize(pose)
        
        # 4. Handle NaN/Inf
        pose = np.nan_to_num(pose, nan=0.0, posinf=1.0, neginf=-1.0)
        
        return pose
    
    def _pad_or_truncate(self, pose: np.ndarray) -> np.ndarray:
        """Pad or truncate to max_seq_len."""
        T = pose.shape[0]
        
        if T >= self.max_seq_len:
            # Truncate from center
            start = (T - self.max_seq_len) // 2
            return pose[start:start + self.max_seq_len]
        else:
            # Pad at the end
            pad_length = self.max_seq_len - T
            return np.pad(pose, ((0, pad_length), (0, 0)), mode='constant')
    
    def _normalize(self, pose: np.ndarray) -> np.ndarray:
        """Center and scale normalization."""
        # Center on wrist (landmark 0)
        wrist = pose[:, :3]  # First landmark
        pose = pose - wrist[:, np.newaxis, :]
        
        # Scale by body size
        body_size = np.linalg.norm(pose[:, :3] - pose[:, 9:12])  # Wrist to hip
        body_size = np.maximum(body_size, 1e-6)
        pose = pose / body_size[:, np.newaxis, np.newaxis]
        
        return pose
```

### 3.2 Text Preprocessing

```python
class TextPreprocessor:
    """Preprocess text annotations for model input."""
    
    def __init__(self, vocab: Vocabulary, max_len: int = 50):
        self.vocab = vocab
        self.max_len = max_len
    
    def preprocess(self, text: str) -> List[int]:
        """
        Preprocess text.
        
        Args:
            text: Raw text string
        Returns:
            Tokenized text with BOS/EOS
        """
        # 1. Lowercase
        text = text.lower()
        
        # 2. Basic cleaning
        text = self._clean_text(text)
        
        # 3. Tokenize
        tokens = text.split()
        
        # 4. Add BOS/EOS
        tokens = ['<sos>'] + tokens + ['<eos>']
        
        # 5. Truncate if needed
        if len(tokens) > self.max_len:
            tokens = tokens[:self.max_len - 1] + ['<eos>']
        
        # 6. Convert to IDs
        token_ids = [self.vocab.get(t, self.vocab['<unk>']) for t in tokens]
        
        return token_ids
    
    def _clean_text(self, text: str) -> str:
        """Clean text."""
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Keep only alphanumeric and basic punctuation
        text = re.sub(r'[^a-zA-Z0-9\s.,!?\'-]', '', text)
        
        return text
```

---

## 4. Feature Engineering

### 4.1 Landmark Selection

```python
# Selected 104-feature configuration
LANDMARK_CONFIG = {
    'left_hand': {
        'indices': list(range(0, 21)),  # 21 landmarks
        'dimensions': 3,  # x, y, z
        'features': 63,
        'relative_to': 'left_wrist'  # Landmark 0
    },
    'right_hand': {
        'indices': list(range(21, 42)),  # 21 landmarks
        'dimensions': 3,
        'features': 63,
        'relative_to': 'right_wrist'  # Landmark 21
    },
    'pose': {
        'indices': [11, 12, 13, 14, 15, 16, 23, 24, 25, 26],  # 10 key joints
        'dimensions': 3,
        'features': 30,
        'relative_to': 'hip_center'  # Midpoint of 23, 24
    },
    'velocity': {
        'compute': True,
        'features': 42,  # 21 per hand
        'normalize': True
    }
}

# Total: 63 + 63 + 30 + 42 = 198 → reduced to 104 via feature selection
```

### 4.2 Derived Features

```python
def compute_derived_features(pose: np.ndarray) -> np.ndarray:
    """
    Compute derived features from raw landmarks.
    
    Args:
        pose: [T, F] raw features
    Returns:
        features: [T, F'] derived features
    """
    features = []
    
    # 1. Hand distances
    left_wrist = pose[:, 0:3]
    right_wrist = pose[:, 63:66]
    hand_distance = np.linalg.norm(left_wrist - right_wrist, axis=-1, keepdims=True)
    features.append(hand_distance)
    
    # 2. Hand heights
    left_height = pose[:, 1].reshape(-1, 1)  # y-coordinate
    right_height = pose[:, 64].reshape(-1, 1)
    features.extend([left_height, right_height])
    
    # 3. Hand spread (distance between fingers)
    left_spread = compute_hand_spread(pose[:, :63])
    right_spread = compute_hand_spread(pose[:, 63:126])
    features.extend([left_spread, right_spread])
    
    # 4. Body orientation (shoulder angle)
    left_shoulder = pose[:, 126:129]
    right_shoulder = pose[:, 129:132]
    body_angle = compute_angle(left_shoulder, right_shoulder)
    features.append(body_angle)
    
    return np.concatenate(features, axis=-1)
```

### 4.3 Feature Statistics

```python
# Compute training set statistics for normalization
def compute_feature_stats(dataset: ISignDataset) -> dict:
    """Compute mean and std for feature normalization."""
    all_features = []
    
    for i in range(len(dataset)):
        sample = dataset[i]
        all_features.append(sample['pose'])
    
    all_features = np.concatenate(all_features, axis=0)
    
    return {
        'mean': np.mean(all_features, axis=0),
        'std': np.std(all_features, axis=0) + 1e-6
    }

# Save statistics
stats = compute_feature_stats(train_dataset)
np.save('feature_stats.npy', stats)
```

---

## 5. Training Loop

### 5.1 Training Configuration

```python
@dataclass
class TrainingConfig:
    # Model
    model_name: str = "pose_transformer_base"
    d_model: int = 256
    nhead: int = 8
    num_encoder_layers: int = 6
    num_decoder_layers: int = 6
    dim_feedforward: int = 512
    dropout: float = 0.1
    
    # Training
    batch_size: int = 32
    num_epochs: int = 100
    learning_rate: float = 1e-4
    weight_decay: float = 0.01
    warmup_steps: int = 4000
    max_grad_norm: float = 1.0
    label_smoothing: float = 0.1
    
    # Data
    max_seq_len: int = 64
    max_text_len: int = 50
    vocab_size: int = 35000
    
    # Checkpointing
    save_dir: str = "checkpoints"
    save_every: int = 5
    keep_top_k: int = 3
    
    # Early stopping
    patience: int = 10
    min_delta: float = 0.001
    
    # Device
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
    mixed_precision: bool = True
```

### 5.2 Training Loop Implementation

```python
def train_epoch(model, loader, optimizer, criterion, config):
    """Train for one epoch."""
    model.train()
    total_loss = 0
    total_tokens = 0
    
    for batch_idx, batch in enumerate(loader):
        pose = batch['pose'].to(config.device)      # [B, T, F]
        text = batch['text'].to(config.device)      # [B, N]
        
        # Teacher forcing
        tgt_input = text[:, :-1]  # All but last token
        tgt_output = text[:, 1:]  # All but first token
        
        # Forward pass
        with torch.cuda.amp.autocast(enabled=config.mixed_precision):
            output = model(pose, tgt_input)  # [B, N-1, V]
            loss = criterion(output.reshape(-1, config.vocab_size), 
                           tgt_output.reshape(-1))
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        
        # Gradient clipping
        torch.nn.utils.clip_grad_norm_(model.parameters(), config.max_grad_norm)
        
        optimizer.step()
        
        # Statistics
        total_loss += loss.item() * tgt_output.numel()
        total_tokens += tgt_output.numel()
        
        if batch_idx % 100 == 0:
            avg_loss = total_loss / total_tokens
            print(f"Batch {batch_idx}/{len(loader)}, Loss: {avg_loss:.4f}")
    
    return total_loss / total_tokens
```

### 5.3 Full Training Script Structure

```python
def main():
    # 1. Load config
    config = TrainingConfig()
    
    # 2. Create datasets
    train_dataset = ISignDataset(...)
    val_dataset = ISignDataset(...)
    
    train_loader = DataLoader(train_dataset, batch_size=config.batch_size, ...)
    val_loader = DataLoader(val_dataset, batch_size=config.batch_size * 2, ...)
    
    # 3. Create model
    model = PoseTransformer(config)
    model = model.to(config.device)
    
    # 4. Create optimizer and scheduler
    optimizer = AdamW(model.parameters(), lr=config.learning_rate, 
                     weight_decay=config.weight_decay)
    scheduler = CosineAnnealingWarmRestarts(optimizer, T_0=config.warmup_steps)
    
    # 5. Create criterion
    criterion = LabelSmoothingLoss(config.vocab_size, smoothing=config.label_smoothing)
    
    # 6. Training loop
    best_val_loss = float('inf')
    patience_counter = 0
    
    for epoch in range(config.num_epochs):
        # Train
        train_loss = train_epoch(model, train_loader, optimizer, criterion, config)
        
        # Validate
        val_loss, val_bleu = evaluate(model, val_loader, criterion, config)
        
        # Update scheduler
        scheduler.step()
        
        # Log
        print(f"Epoch {epoch+1}/{config.num_epochs}")
        print(f"Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}, Val BLEU: {val_bleu:.2f}")
        
        # Checkpoint
        if (epoch + 1) % config.save_every == 0:
            save_checkpoint(model, optimizer, epoch, val_loss, config)
        
        # Early stopping
        if val_loss < best_val_loss - config.min_delta:
            best_val_loss = val_loss
            patience_counter = 0
            save_checkpoint(model, optimizer, epoch, val_loss, config, is_best=True)
        else:
            patience_counter += 1
            if patience_counter >= config.patience:
                print(f"Early stopping at epoch {epoch+1}")
                break
```

---

## 6. Validation

### 6.1 Evaluation Metrics

```python
def evaluate(model, loader, criterion, config):
    """Evaluate model on validation set."""
    model.eval()
    total_loss = 0
    total_tokens = 0
    
    all_predictions = []
    all_references = []
    
    with torch.no_grad():
        for batch in loader:
            pose = batch['pose'].to(config.device)
            text = batch['text'].to(config.device)
            
            # Teacher forcing for loss
            tgt_input = text[:, :-1]
            tgt_output = text[:, 1:]
            
            output = model(pose, tgt_input)
            loss = criterion(output.reshape(-1, config.vocab_size), 
                           tgt_output.reshape(-1))
            
            total_loss += loss.item() * tgt_output.numel()
            total_tokens += tgt_output.numel()
            
            # Generate predictions (greedy for speed)
            predictions = model.generate(pose, max_len=config.max_text_len)
            
            # Decode tokens
            for pred, ref in zip(predictions, text):
                all_predictions.append(vocab.decode(pred.cpu().numpy()))
                all_references.append(vocab.decode(ref.cpu().numpy()))
    
    # Compute metrics
    avg_loss = total_loss / total_tokens
    bleu = compute_bleu(all_predictions, all_references)
    rouge = compute_rouge(all_predictions, all_references)
    meteor = compute_meteor(all_predictions, all_references)
    
    return avg_loss, bleu, rouge, meteor
```

### 6.2 Metrics Implementation

```python
def compute_bleu(predictions, references):
    """Compute BLEU score."""
    from nltk.translate.bleu_score import corpus_bleu
    
    # Tokenize
    pred_tokens = [p.split() for p in predictions]
    ref_tokens = [[r.split()] for r in references]
    
    # Compute BLEU-1, BLEU-2, BLEU-3, BLEU-4
    bleu1 = corpus_bleu(ref_tokens, pred_tokens, weights=(1, 0, 0, 0))
    bleu2 = corpus_bleu(ref_tokens, pred_tokens, weights=(0.5, 0.5, 0, 0))
    bleu3 = corpus_bleu(ref_tokens, pred_tokens, weights=(0.33, 0.33, 0.33, 0))
    bleu4 = corpus_bleu(ref_tokens, pred_tokens, weights=(0.25, 0.25, 0.25, 0.25))
    
    return {
        'bleu1': bleu1 * 100,
        'bleu2': bleu2 * 100,
        'bleu3': bleu3 * 100,
        'bleu4': bleu4 * 100
    }
```

---

## 7. Checkpointing

### 7.1 Checkpoint Format

```python
def save_checkpoint(model, optimizer, epoch, loss, config, is_best=False):
    """Save model checkpoint."""
    checkpoint = {
        'epoch': epoch,
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'loss': loss,
        'config': asdict(config),
        'vocab': vocab.get_state()
    }
    
    # Save regular checkpoint
    path = Path(config.save_dir) / f"checkpoint_epoch_{epoch:03d}.pt"
    torch.save(checkpoint, path)
    
    # Save best checkpoint
    if is_best:
        best_path = Path(config.save_dir) / "best_model.pt"
        torch.save(checkpoint, best_path)
    
    # Keep only top K checkpoints
    keep_checkpoints(config.save_dir, config.keep_top_k)
```

### 7.2 Checkpoint Loading

```python
def load_checkpoint(path: str, model, optimizer=None):
    """Load model checkpoint."""
    checkpoint = torch.load(path, map_location='cpu')
    
    model.load_state_dict(checkpoint['model_state_dict'])
    
    if optimizer:
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
    
    return {
        'epoch': checkpoint['epoch'],
        'loss': checkpoint['loss']
    }
```

---

## 8. Early Stopping

### 8.1 Implementation

```python
class EarlyStopping:
    """Early stopping to prevent overfitting."""
    
    def __init__(self, patience=10, min_delta=0.001, mode='min'):
        self.patience = patience
        self.min_delta = min_delta
        self.mode = mode
        self.counter = 0
        self.best_score = None
        self.early_stop = False
    
    def __call__(self, score):
        if self.best_score is None:
            self.best_score = score
        elif self._is_improvement(score):
            self.best_score = score
            self.counter = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.early_stop = True
    
    def _is_improvement(self, score):
        if self.mode == 'min':
            return score < self.best_score - self.min_delta
        else:
            return score > self.best_score + self.min_delta
```

---

## 9. Learning Rate Schedule

### 9.1 Cosine Annealing with Warmup

```python
class CosineAnnealingWarmRestarts:
    """Cosine annealing with linear warmup."""
    
    def __init__(self, optimizer, warmup_steps, total_steps, min_lr=1e-6):
        self.optimizer = optimizer
        self.warmup_steps = warmup_steps
        self.total_steps = total_steps
        self.min_lr = min_lr
        self.current_step = 0
    
    def step(self):
        self.current_step += 1
        
        if self.current_step < self.warmup_steps:
            # Linear warmup
            lr = self.optimizer.defaults['lr'] * (self.current_step / self.warmup_steps)
        else:
            # Cosine annealing
            progress = (self.current_step - self.warmup_steps) / (self.total_steps - self.warmup_steps)
            lr = self.min_lr + (self.optimizer.defaults['lr'] - self.min_lr) * 0.5 * (1 + np.cos(np.pi * progress))
        
        for param_group in self.optimizer.param_groups:
            param_group['lr'] = lr
```

---

## 10. Directory Structure

### 10.1 Training Workspace

```
ai-training/
├── configs/
│   ├── training.yaml          # Training hyperparameters
│   ├── model.yaml             # Model architecture
│   ├── dataset.yaml           # Dataset configuration
│   └── dev_dataset.yaml       # Development dataset config
│
├── preprocessing/
│   ├── __init__.py
│   ├── pose_preprocessor.py   # Pose landmark preprocessing
│   ├── text_preprocessor.py   # Text tokenization
│   ├── augmentation.py        # Data augmentation
│   └── feature_extraction.py  # Feature engineering
│
├── tokenizer/
│   ├── __init__.py
│   ├── vocabulary.py          # Vocabulary building
│   ├── tokenizer.py           # Text tokenizer
│   └── vocab.json             # Saved vocabulary
│
├── models/
│   ├── __init__.py
│   ├── pose_transformer.py    # Main model architecture
│   ├── encoder.py             # Transformer encoder
│   ├── decoder.py             # Transformer decoder
│   ├── embeddings.py          # Positional embeddings
│   └── layers.py              # Shared layers
│
├── training/
│   ├── __init__.py
│   ├── trainer.py             # Training loop
│   ├── evaluator.py           # Evaluation metrics
│   ├── loss.py                # Loss functions
│   ├── optimizer.py           # Optimizer setup
│   ├── scheduler.py           # LR scheduling
│   └── checkpointing.py       # Checkpoint management
│
├── evaluation/
│   ├── __init__.py
│   ├── metrics.py             # BLEU, ROUGE, METEOR
│   ├── visualize.py           # Attention visualization
│   └── error_analysis.py      # Error analysis tools
│
├── deployment/
│   ├── __init__.py
│   ├── export_onnx.py         # ONNX export
│   ├── export_tflite.py       # TFLite export
│   ├── optimize.py            # Model optimization
│   └── quantize.py            # Quantization
│
├── scripts/
│   ├── train.py               # Main training script
│   ├── evaluate.py            # Evaluation script
│   ├── predict.py             # Inference script
│   ├── build_vocab.py         # Vocabulary builder
│   └── preprocess_data.py     # Data preprocessing
│
├── datasets/
│   ├── dev/                   # Development dataset
│   ├── processed/             # Preprocessed data
│   └── raw/                   # Raw data (symlinks)
│
├── experiments/
│   ├── experiment_001/        # Experiment logs
│   └── ...
│
├── checkpoints/
│   ├── best_model.pt          # Best model checkpoint
│   ├── checkpoint_epoch_*.pt  # Regular checkpoints
│   └── ...
│
├── logs/
│   ├── training.log           # Training logs
│   └── tensorboard/           # TensorBoard logs
│
└── requirements.txt           # Python dependencies
```

---

*This document defines the complete training pipeline for SignBridge AI. See DEPLOYMENT_ARCHITECTURE.md for deployment details.*
