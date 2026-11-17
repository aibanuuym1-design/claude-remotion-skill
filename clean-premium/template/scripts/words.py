# usage: python scripts/words.py media/voice.mp3 [models/sherpa-onnx-zipformer-ru-2024-09-18] > media/words.json
# Голос -> время каждого слова (офлайн, на компьютере). Нужен, если озвучка не из voice.mjs.
import sys, json, subprocess, numpy as np, sherpa_onnx

src = sys.argv[1]
m = sys.argv[2] if len(sys.argv) > 2 else "models/sherpa-onnx-zipformer-ru-2024-09-18"
rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=f"{m}/encoder.int8.onnx", decoder=f"{m}/decoder.onnx", joiner=f"{m}/joiner.int8.onnx",
    tokens=f"{m}/tokens.txt", num_threads=4, decoding_method="greedy_search")
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                     capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768

words = []
CH = 16000 * 20
for off in range(0, len(audio), CH):
    st = rec.create_stream(); st.accept_waveform(16000, audio[off:off + CH]); rec.decode_stream(st)
    new = True
    for tok, t in zip(st.result.tokens, st.result.timestamps):
        t += off / 16000
        if tok.startswith(("▁", " ")):
            new = True
        tok = tok.lstrip("▁ ")
        if not tok:
            continue
        if new:
            words.append([tok.lower(), round(t, 2)]); new = False
        else:
            words[-1][0] += tok.lower()
print(json.dumps(words, ensure_ascii=False, indent=0))
