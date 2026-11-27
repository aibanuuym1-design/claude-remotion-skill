"""Synthesize a soft 30s piano + strings bed and a few ambient SFX (no downloads).
Usage: python3 scripts/gen_music.py public/audio
"""
import sys, wave, numpy as np
SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/audio"
rng = np.random.default_rng(7)

def hz(n):  # MIDI -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)

def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.89
    st = x if x.ndim == 2 else np.stack([x, x], 1)
    with wave.open(f"{OUT}/{name}", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())

def piano(f, dur, vel=0.6):
    t = np.arange(int(SR * dur)) / SR
    x = np.zeros_like(t)
    for k, a in enumerate([1, 0.45, 0.22, 0.12, 0.06, 0.03], 1):
        fk = f * k * np.sqrt(1 + 0.0004 * k * k)          # slight inharmonicity
        x += a * np.sin(2 * np.pi * fk * t) * np.exp(-t * (1.1 + 0.9 * k))
    att = np.minimum(1, t / 0.006)
    return x * att * vel

def strings(f, dur):
    t = np.arange(int(SR * dur)) / SR
    x = np.zeros_like(t)
    for det in (-0.12, 0, 0.11):                          # 3 detuned voices
        vib = 1 + 0.0025 * np.sin(2 * np.pi * 5.1 * t + det * 9)
        ph = 2 * np.pi * np.cumsum(f * (1 + det / 100) * vib) / SR
        for k in range(1, 7):
            x += np.sin(k * ph) / k * (0.75 ** k)
    env = np.minimum(1, t / 1.6) * np.minimum(1, (dur - t) / 1.4)
    return x * np.clip(env, 0, 1) * 0.06

def reverb(x, mix=0.32):
    n = int(SR * 2.8)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 2.6)
    ir[:int(SR * 0.02)] = 0
    wet = np.convolve(x, ir / np.sqrt(np.sum(ir ** 2)) * 0.35, mode="full")[:len(x)]
    return x * (1 - mix) + wet * mix

DUR = 31.0
N = int(SR * DUR)
mix = np.zeros(N)
def add(sig, at):
    i = int(at * SR); j = min(N, i + len(sig)); mix[i:j] += sig[: j - i]

# 72 BPM, progression in D major: Dmaj9 – Bm7 – Gmaj7 – A(sus) ; 4 beats per chord
beat = 60 / 72
prog = [([50, 57, 62, 64, 66, 69], [62, 66, 69, 73]),    # D add9
        ([47, 54, 59, 62, 66], [59, 62, 66, 69]),        # Bm7
        ([43, 50, 55, 59, 62, 66], [55, 59, 62, 66]),    # Gmaj7
        ([45, 52, 57, 61, 64], [57, 61, 64, 69])]        # A
melody = [78, 76, 74, 73, 74, 76, 73, 71, 69, 71, 74, 73]  # gentle top line
t = 0.6; c = 0
while t < DUR - 3:
    bass, pad = prog[c % 4]
    bar = 4 * beat
    for n in pad:
        add(strings(hz(n - 12), bar + 1.6), t - 0.3)
    add(piano(hz(bass[0] - 12), 3.5, 0.5), t)
    for i, n in enumerate(bass[1:]):                     # soft rolling arpeggio
        add(piano(hz(n), 2.6, 0.32), t + i * beat * 0.5)
    if c >= 1:
        m = melody[(c * 3) % len(melody): (c * 3) % len(melody) + 3]
        for i, n in enumerate(m):
            add(piano(hz(n), 2.8, 0.42), t + i * beat * 1.33)
    t += bar; c += 1
# final resolving chord at the end card
for n in [50, 57, 62, 66, 69, 74]:
    add(piano(hz(n), 4.5, 0.38), 26.2 + (n - 50) * 0.012)
mix = reverb(mix, 0.38)
fade = np.ones(N); fo = int(SR * 2.2); fade[-fo:] = np.linspace(1, 0, fo) ** 2
fade[: int(SR * 0.4)] = np.linspace(0, 1, int(SR * 0.4))
mix *= fade
L = mix; R = np.roll(mix, int(SR * 0.012))                  # light stereo width
save("music.wav", np.stack([L, R], 1)[: int(SR * 30.5)])

# --- ambient SFX ---
def noise_band(dur, lo, hi):
    n = int(SR * dur); x = rng.standard_normal(n)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, n)

# paper / satin swish for transitions
d = 1.1; tt = np.arange(int(SR * d)) / SR
sw = noise_band(d, 900, 7000) * np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 3
save("swish.wav", reverb(sw, 0.3) * 0.5)
# soft shimmer (glass bells) for the logo
d = 3.0; sh = np.zeros(int(SR * d))
for i, n in enumerate([86, 90, 93, 98]):
    tt = np.arange(int(SR * (d - i * 0.09))) / SR
    s = np.sin(2 * np.pi * hz(n) * tt) * np.exp(-tt * 2.4) + 0.3 * np.sin(2 * np.pi * hz(n) * 2.76 * tt) * np.exp(-tt * 5)
    sh[int(i * 0.09 * SR):int(i * 0.09 * SR) + len(s)] += s
save("shimmer.wav", reverb(sh, 0.45))
# airy room tone (very quiet) under everything
d = 30.5; rt = noise_band(d, 200, 2500)
rt *= 0.6 + 0.4 * np.sin(2 * np.pi * np.arange(len(rt)) / SR / 9) ** 2
save("air.wav", rt)
print("ok")
