# Слова и тайминги из видео/аудио: python -I scripts/words.py media/source.mp4 kk > media/words.json
# язык: kk (казахский, по умолчанию), ru, en. Печатает [["слово", начало, конец], ...] и текст по фразам в stderr.
import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
src = sys.argv[1]; lang = sys.argv[2] if len(sys.argv) > 2 else 'kk'
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
m = WhisperModel('large-v3', device='cpu', compute_type='int8')
segs, _ = m.transcribe(a, word_timestamps=True, language=lang, beam_size=5,
                       initial_prompt='Claude, YouTube, Reels, таргет, автоворонка, монтаж.')
W = []
for s in segs:
    sys.stderr.buffer.write(f'[{s.start:.2f}-{s.end:.2f}] {s.text}\n'.encode('utf-8'))
    W += [[w.word.strip(), round(w.start, 2), round(w.end, 2)] for w in s.words]
sys.stdout.buffer.write(json.dumps(W, ensure_ascii=False).encode('utf-8'))
