"""Quick test of NLP pipeline."""
import sys
sys.path.insert(0, r'C:\Users\Gaurav Gopal Gosavi\OneDrive\Desktop\Sign languageproject\ai-training')

from tokenizer.vocabulary import Vocabulary, VocabularyConfig
from tokenizer.tokenizer import Tokenizer, TokenizerConfig

csv_path = r'C:\Users\Gaurav Gopal Gosavi\.cache\huggingface\hub\datasets--Exploration-Lab--iSign\snapshots\e4ee6c5f0d9dfcbc74205e3f1388ce94da26c298\iSign_v1.1.csv'

# Build vocabulary from CSV
config = VocabularyConfig(min_freq=2, max_size=35000)
vocab = Vocabulary(config)
vocab.build_from_csv(csv_path, 'text')

# Save vocabulary
vocab.save('tokenizer/vocab.json')

# Get stats
stats = vocab.get_stats()
print('=== Vocabulary Stats ===')
print('Size:', stats['vocab_size'])
print('Total words:', stats['total_words'])
print('Unique words:', stats['unique_words'])
print('Rare words:', stats['rare_words'])
print('Top 5 words:', stats['top_20_words'][:5])

# Build tokenizer
tok_config = TokenizerConfig(max_length=50)
tokenizer = Tokenizer(vocab, tok_config)
tokenizer.save('tokenizer/')

# Test encode/decode
test_texts = [
    'The quick brown fox',
    'Hello world',
    'Sign language translation'
]
print('\n=== Tokenization Tests ===')
for text in test_texts:
    ids = tokenizer.encode(text)
    decoded = tokenizer.decode(ids)
    print('Input:', repr(text))
    print('IDs:', ids)
    print('Decoded:', repr(decoded))
    print()
