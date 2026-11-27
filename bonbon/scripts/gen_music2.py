"""Synthesize a brighter, rhythmic ~30s track for the target ad (no downloads).
Beat grid is locked to the video: 1 beat = 22 frames @30fps (81.8 BPM, played as lively 8ths/16ths),
first downbeat at 0.2s, so the beat-cut montage (frames 402/424/446) lands on beats.
Intro (envelope, 0-4.6s): music box + pad.  Main (4.6s-): pizzicato, piano, soft kick/snap/shaker.
Usage: python3 scripts/gen_music2.py public/audio
"""
import sys, wave, numpy as np
SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/audio"
rng = np.random.default_rng(11)
BEAT = 22 / 30
T0 = 0.2
DUR = 30.5
N = int(SR * DUR)

def hz(n): return 440.0 * 2 ** ((n - 69) / 12)
def tt(d): return np.arange(int(SR * d)) / SR

def fftconv(x, h):
    n = len(x) + len(h) - 1; m = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(h, m), m)[:len(x)]

def reverb(x, mix=0.3, length=2.2, decay=3.0):
    n = int(SR * length)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * decay); ir[:int(SR * 0.015)] = 0
    ir /= np.sqrt(np.sum(ir ** 2))
    return x * (1 - mix) + fftconv(x, ir) * 0.4 * mix

def lowpass(x, cut):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cut) ** 4); return np.fft.irfft(X, len(x))

def piano(f, d, v):
    t = tt(d); x = np.zeros_like(t)
    for k, a in enumerate([1, .5, .25, .12, .06], 1):
        x += a * np.sin(2 * np.pi * f * k * np.sqrt(1 + .0004 * k * k) * t) * np.exp(-t * (1.4 + k))
    return x * np.minimum(1, t / .005) * v

def pizz(f, v):
    t = tt(0.7); x = np.zeros_like(t)
    for k, a in enumerate([1, .6, .35, .2, .1, .05], 1):
        x += a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (7 + 3 * k))
    return x * np.minimum(1, t / .003) * v

def bell(f, v, d=1.8):  # music box / celesta
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.6) + .35 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t * 7) \
        + .15 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 4)
    return x * np.minimum(1, t / .002) * v

def pad(f, d, v):
    t = tt(d); x = np.zeros_like(t)
    for det in (-.1, 0, .1):
        ph = 2 * np.pi * np.cumsum(f * (1 + det / 100) * (1 + .002 * np.sin(2 * np.pi * 5 * t))) / SR
        for k in range(1, 6): x += np.sin(k * ph) / k * .7 ** k
    env = np.clip(np.minimum(t / .8, (d - t) / .8), 0, 1)
    return x * env * v

def kick(v):
    t = tt(.35); f = 45 + 75 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * v

def noise(d, lo, hi):
    n = int(SR * d); X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, n)

def snap(v):
    t = tt(.18); return noise(.18, 1500, 7000) * np.exp(-t * 38) * v

def shaker(v):
    t = tt(.09); return noise(.09, 6000, 14000) * np.sin(np.pi * t / .09) ** 2 * v

L = np.zeros(N); R = np.zeros(N)
def add(sig, at, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); s = sig[:j - i]
    L[i:j] += s * (1 - max(0, pan)); R[i:j] += s * (1 + min(0, pan))

def bt(b): return T0 + b * BEAT  # beat index -> seconds

# F major, bright: Fmaj7 – Am7 – Dm9 – Bbmaj7(add C) ; 4 beats each
prog = [(41, [65, 69, 72, 76]), (45, [64, 67, 69, 72]), (38, [62, 65, 69, 72]), (46, [62, 65, 70, 74])]
motif = [81, 79, 77, 76, 77, 79, 72, 74]           # music box line (8ths)
motif2 = [84, 81, 79, 81, 77, 76, 74, 76]

DROP = 6          # beat 6 ~ 4.6s: letter zooms into the footage
END = 38          # last full beat ~28.1s
for b in range(0, END):
    bar, pos = divmod(b, 4)
    root, ch = prog[bar % 4]
    t = bt(b)
    if pos == 0:
        for n in ch: add(pad(hz(n - 12), 4 * BEAT + .6, .035 if b < DROP else .028), t - .1)
    # intro: music box in 8ths
    if b < DROP:
        for e in range(2):
            add(bell(hz(motif[(b * 2 + e) % 8]), .22), t + e * BEAT / 2, pan=.25 if e else -.25)
        continue
    # main groove
    add(kick(.55 if pos in (0, 2) else 0), t)
    if pos in (1, 3): add(snap(.22), t, pan=.1)
    for s16 in range(4):
        add(shaker(.06 if s16 % 2 else .035), t + s16 * BEAT / 4, pan=.35)
    add(pizz(hz(root), .5), t); add(pizz(hz(root + 12), .28), t + BEAT / 2)
    # piano chord stabs on the off-beats
    for n in ch: add(piano(hz(n), .9, .07), t + BEAT / 2, pan=-.15)
    # celesta melody in phrases (every other bar more active)
    mel = motif2 if bar % 2 else motif
    for e in range(2):
        if (b + e) % 3 != 2: add(bell(hz(mel[(b * 2 + e) % 8]), .16, 1.2), t + e * BEAT / 2, pan=.2)

# hits on the beat-cut montage (beats at frames 402/424/446 -> 13.4/14.13/14.87s)
for s in (13.4, 14.133, 14.867):
    add(kick(.7), s); add(bell(hz(89), .25), s, pan=.3); add(noise(.6, 3000, 12000) * np.exp(-tt(.6) * 7) * .08, s)
# whoosh riser into the drop and into the CTA
for at, d in ((3.4, 1.2), (21.9, 1.1)):
    t = tt(d); add(noise(d, 800, 9000) * (t / d) ** 3 * .25, at)
# letter seal "pop" sparkle + final resolving chord at the logo
for i, n in enumerate([77, 81, 84, 89]): add(bell(hz(n), .18), 1.0 + i * .06)
for i, n in enumerate([53, 60, 65, 69, 72, 77]): add(piano(hz(n), 3.5, .22), bt(END) + i * .02)
add(bell(hz(89), .2, 3), bt(END) + .15)

mix = np.stack([reverb(L, .28), reverb(R, .28)], 1)
mix = np.stack([lowpass(mix[:, 0], 12000), lowpass(mix[:, 1], 12000)], 1)
fade = np.ones(N); fo = int(SR * 2.0); fade[-fo:] = np.linspace(1, 0, fo) ** 2
mix *= fade[:, None]
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.3) * 0.88  # gentle glue
with wave.open(f"{OUT}/music2.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok")
