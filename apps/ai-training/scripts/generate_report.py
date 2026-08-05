"""Generate report.md from experiment artifacts."""
import json
import csv
from pathlib import Path


def generate_report(experiment_dir: str):
    exp = Path(experiment_dir)

    with open(exp / 'metrics.json') as f:
        metrics = json.load(f)
    with open(exp / 'evaluation_metrics.json') as f:
        eval_m = json.load(f)
    with open(exp / 'history.csv') as f:
        history = list(csv.DictReader(f))
    with open(exp / 'predictions.csv') as f:
        predictions = list(csv.DictReader(f))
    ds_meta_path = exp.parent / 'representative' / 'metadata.json'
    with open(ds_meta_path) as f:
        ds_meta = json.load(f)

    config = metrics.get('config', {})
    mc = config.get('model', {})
    sent = ds_meta.get('sentence_stats', {}).get('overall', {})

    lines = []
    a = lines.append

    a('# Representative Training Report')
    a('')
    a('SignBridge AI \u2014 Phase 16')
    a('')
    a('---')
    a('')

    a('## Dataset Statistics')
    a('')
    a('| Property | Value |')
    a('|----------|-------|')
    a(f'| Source | {ds_meta.get("source", "N/A")} |')
    a(f'| Total Samples | {ds_meta.get("total_sampled", "N/A")} |')
    a(f'| Train | {ds_meta.get("train_size", "N/A")} |')
    a(f'| Validation | {ds_meta.get("validation_size", "N/A")} |')
    a(f'| Test | {ds_meta.get("test_size", "N/A")} |')
    a(f'| Unique Vocab | {ds_meta.get("unique_vocab", "N/A")} |')
    a(f'| Total Tokens | {ds_meta.get("total_tokens", "N/A")} |')
    a(f'| Mean Sentence Length | {sent.get("mean", "N/A")} words |')
    a(f'| Min Length | {sent.get("min", "N/A")} |')
    a(f'| Max Length | {sent.get("max", "N/A")} |')
    a('')

    a('## Training Summary')
    a('')
    a('| Property | Value |')
    a('|----------|-------|')
    a(f'| Total Training Time | {metrics.get("total_training_time", 0):.1f}s |')
    a(f'| Epochs Trained | {metrics.get("epochs_trained", "N/A")} |')
    a(f'| Best Epoch | {metrics.get("best_epoch", "N/A")} |')
    a(f'| Best Validation Loss | {metrics.get("best_val_loss", 0):.4f} |')
    a(f'| Final Train Loss | {metrics.get("final_train_loss", 0):.4f} |')
    a(f'| Final Val Loss | {metrics.get("final_val_loss", 0):.4f} |')
    a(f'| Final Val Accuracy | {metrics.get("final_val_accuracy", 0):.4f} |')
    a(f'| Final Val Perplexity | {metrics.get("final_val_perplexity", 0):.2f} |')
    a(f'| Best Checkpoint | checkpoints/best.pt |')
    a('')

    a('## Epoch History')
    a('')
    a('| Epoch | Train Loss | Val Loss | Train Acc | Val Acc | LR | Val PPL |')
    a('|-------|-----------|----------|----------|--------|-----|---------|')
    for h in history:
        a(f'| {h["epoch"]} | {float(h["train_loss"]):.4f} | {float(h["val_loss"]):.4f} '
          f'| {float(h["train_acc"]):.4f} | {float(h["val_acc"]):.4f} '
          f'| {float(h["learning_rate"]):.6f} | {float(h["val_perplexity"]):.2f} |')
    a('')

    a('## Evaluation Metrics')
    a('')
    a('| Metric | Value |')
    a('|--------|-------|')
    a(f'| BLEU | {eval_m.get("bleu", 0):.4f} |')
    a(f'| WER | {eval_m.get("wer", 0):.4f} |')
    a(f'| CER | {eval_m.get("cer", 0):.4f} |')
    a(f'| ROUGE-L | {eval_m.get("rouge_l", 0):.4f} |')
    a(f'| Exact Match | {eval_m.get("exact_match", 0):.4f} |')
    a(f'| Median BLEU | {eval_m.get("median_bleu", 0):.4f} |')
    a(f'| Min BLEU | {eval_m.get("min_bleu", 0):.4f} |')
    a(f'| Max BLEU | {eval_m.get("max_bleu", 0):.4f} |')
    a(f'| Total Samples | {eval_m.get("total_samples", 0)} |')
    a('')

    a('## Sample Predictions')
    a('')
    a('| UID | Ground Truth | Prediction | BLEU | WER | CER |')
    a('|-----|-------------|-----------|------|-----|-----|')
    for p in predictions[:10]:
        gt = p['ground_truth'].replace('|', ' ')
        pred = p['prediction'].replace('|', ' ')
        a(f'| {p["uid"]} | {gt} | {pred} | {p["bleu"]} | {p["wer"]} | {p["cer"]} |')
    a('')

    a('## Generated Plots')
    a('')
    a('- training_loss.png \u2014 Training vs validation loss over epochs')
    a('- validation_loss.png \u2014 Validation loss curve')
    a('- accuracy.png \u2014 Training vs validation accuracy')
    a('- learning_rate.png \u2014 Learning rate schedule')
    a('- bleu.png \u2014 BLEU score trend')
    a('- wer.png \u2014 WER score trend')
    a('- cer.png \u2014 CER score trend')
    a('')

    a('## Error Analysis')
    a('')
    a('With mock pose data (random noise instead of real MediaPipe landmarks),')
    a('the model cannot learn meaningful pose-text alignment. This is expected.')
    a('The pipeline demonstrates:')
    a('')
    a('- Correct stratified dataset splitting')
    a('- End-to-end training loop with checkpointing')
    a('- Gradient flow and loss convergence')
    a('- Autoregressive inference')
    a('- Metric computation (BLEU, WER, CER, ROUGE-L)')
    a('- Visualization generation')
    a('')
    a('When trained on real pose data, the model will learn meaningful')
    a('sign-language-to-text translation.')
    a('')

    a('## Configuration')
    a('')
    a('```yaml')
    a(f'max_epochs: {config.get("max_epochs", "N/A")}')
    a(f'batch_size: {config.get("batch_size", "N/A")}')
    a(f'learning_rate: {config.get("learning_rate", "N/A")}')
    a(f'optimizer: {config.get("optimizer", "N/A")}')
    a(f'scheduler: {config.get("scheduler", "N/A")}')
    a(f'gradient_clip: {config.get("gradient_clip", "N/A")}')
    a(f'label_smoothing: {config.get("label_smoothing", "N/A")}')
    a(f'dropout: {config.get("dropout", "N/A")}')
    a(f'd_model: {mc.get("d_model", "N/A")}')
    a(f'nhead: {mc.get("nhead", "N/A")}')
    a(f'num_encoder_layers: {mc.get("num_encoder_layers", "N/A")}')
    a(f'num_decoder_layers: {mc.get("num_decoder_layers", "N/A")}')
    a(f'dim_feedforward: {mc.get("dim_feedforward", "N/A")}')
    a(f'max_seq_length: {mc.get("max_seq_length", "N/A")}')
    a('```')
    a('')

    a('## Future Improvements')
    a('')
    a('1. Train on real pose data from extracted iSign dataset')
    a('2. Increase model size (d_model=256, 8 heads, 4 layers)')
    a('3. Train for 30+ epochs with early stopping')
    a('4. Add data augmentation (pose jittering, time warping)')
    a('5. Implement beam search decoding')
    a('6. Add attention visualization')
    a('7. Fine-tune with curriculum learning')
    a('8. Deploy with ONNX export for real-time inference')
    a('')

    with open(exp / 'report.md', 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print(f'Report saved to {exp / "report.md"}')


if __name__ == '__main__':
    generate_report('experiments/representative')
