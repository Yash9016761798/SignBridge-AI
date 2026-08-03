"""
Compare Experiments for SignBridge AI.
Generates comparison report and leaderboard.
"""
import sys
sys.path.insert(0, r'C:\Users\Gaurav Gopal Gosavi\OneDrive\Desktop\Sign languageproject\ai-training')

from experiments.comparator import ExperimentComparator
from experiments.analyzer import ExperimentAnalyzer
from experiments.visualizer import ExperimentVisualizer
from experiments.report import ReportGenerator


def main():
    print('=' * 70)
    print('  EXPERIMENT COMPARISON')
    print('=' * 70)

    comparator = ExperimentComparator('./experiments')
    analyzer = ExperimentAnalyzer('./experiments')
    viz = ExperimentVisualizer('./experiments')

    leaderboard = comparator.get_leaderboard()
    print('\n  Leaderboard:')
    for entry in leaderboard:
        print(f'    #{entry["rank"]} {entry["exp_id"]}: val_loss={entry["val_loss"]:.4f} acc={entry["accuracy"]:.4f} lr={entry["lr"]:.6f}')

    best = comparator.get_best()
    worst = comparator.get_worst()
    if best:
        print(f'\n  Best: {best["exp_id"]} (val_loss={best["metrics"].get("val_loss", "N/A"):.4f})')
    if worst:
        print(f'  Worst: {worst["exp_id"]} (val_loss={worst["metrics"].get("val_loss", "N/A"):.4f})')

    analysis = analyzer.analyze_all()
    recs = analyzer.get_recommendations()
    print('\n  Recommendations:')
    for r in recs:
        print(f'    - {r}')

    print('\n  Generating plots...')
    plots = viz.generate_all_plots('./experiments/comparison_plots')
    for p in plots:
        print(f'    {p}')

    print('\n  Generating report...')
    report_gen = ReportGenerator('./experiments')
    report_gen.generate_report('docs/HYPERPARAMETER_REPORT.md')
    print('    Report saved to docs/HYPERPARAMETER_REPORT.md')

    print('\n' + '=' * 70)
    print('  DONE')
    print('=' * 70)


if __name__ == '__main__':
    main()
