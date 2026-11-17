# Вырезает человека из каждого кадра: media/frames/NNNNN.jpg -> media/mask/NNNNN.png (человек на прозрачном фоне)
# python scripts/mask.py [каждый_N_кадр]
import sys, os, glob, numpy as np, cv2, mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
step = int(sys.argv[1]) if len(sys.argv) > 1 else 1
# свои папки: python scripts/mask.py 1 media/yt9 media/yt9m
SRC = sys.argv[2] if len(sys.argv) > 2 else os.path.join('media', 'frames')
DST = sys.argv[3] if len(sys.argv) > 3 else os.path.join('media', 'mask')
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_buffer=open(os.path.join(ROOT, 'models', 'selfie_segmenter.tflite'), 'rb').read()),
    output_confidence_masks=True))
os.makedirs(os.path.join(ROOT, DST), exist_ok=True)
files = sorted(glob.glob(os.path.join(ROOT, SRC, '*.jpg')))[::step]
prev = None
for i, f in enumerate(files):
    bgr = cv2.imdecode(np.fromfile(f, np.uint8), cv2.IMREAD_COLOR)
    h, w = bgr.shape[:2]
    small = cv2.resize(bgr, (w // 2, h // 2))
    img = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(small, cv2.COLOR_BGR2RGB))
    m = seg.segment(img).confidence_masks[0].numpy_view().copy()
    m = cv2.resize(m, (w, h), interpolation=cv2.INTER_LINEAR)
    if prev is not None: m = 0.6 * m + 0.4 * prev   # меньше дрожания края
    prev = m
    a = np.clip((m - 0.35) / 0.3, 0, 1)
    a = cv2.GaussianBlur(a, (0, 0), 2)
    out = np.dstack([bgr, (a * 255).astype(np.uint8)])
    name = os.path.join(ROOT, DST, os.path.basename(f)[:-4] + '.png')
    cv2.imencode('.png', out)[1].tofile(name)
    if i % 50 == 0: print(f'{i}/{len(files)}', flush=True)
print('ok')
