# Nurserik Studio Hook — монтаж рилс / таргет-креативов 9:16

Скилл из обучения **Нұрсерік** (курс PROXIMA «Монтаж с Claude», модуль 11 «Кейс: таргет-креативы»).
Монтирует вертикальный ролик с говорящей головой полностью кодом: кадры видео + HTML-графика → Chrome рисует каждый кадр → ffmpeg собирает с голосом и звуками. CapCut не нужен.

Полные правила — в [`SKILL.md`](SKILL.md). Установка — в [`КАК_УСТАНОВИТЬ.md`](КАК_УСТАНОВИТЬ.md).

## Что получается
- Титры **над головой** в два яруса: тонкая строка + крупное жирное слово (хром-градиент, лаймовая точка).
- Лаймовые наклонные плашки, пиксельное слово из мозаики (1 раз за ролик).
- **Низ кадра** под текст: стеклянный чек-лист / список цен, три плотные жирные строки, тёмные блоки с наклоном.
- Полноэкранные цветные вставки: розовая/синяя с примерами работ, белая с полем ввода промпта, зелёная планета с карточками воронки, тёмная с красной стрелкой-графиком.
- Синий стеклянный телефон над головой, облачко мысли.
- Мягкие кинематографичные вжухи (`cin1..3`), тайп-бит на фоне с приглушением под голос.
- Финал всегда в **двух вариантах**: кнопка-ссылка и «комментарийге Claude сөзін жаз».
- Отдельный ролик **ДО / ПОСЛЕ**.
- Языки: казахский и русский.

**Главное правило:** текст и графика никогда не заходят на голову и лицо.

## Структура
```
nurserik-studio-hook/
├── SKILL.md              ← инструкция для Claude (правила, элементы, чек-лист)
├── КАК_УСТАНОВИТЬ.md
└── template/             ← копируется в папку каждого нового ролика
    ├── video.html        ← сам ролик: сцены, титры, вставки (правится под каждое видео)
    ├── engine.js         ← анимации, тайминги, звуки (не трогать)
    ├── style.css         ← все стили элементов (не трогать)
    ├── render.mjs        ← рендер: stills (проверочные кадры) / full (готовый mp4)
    ├── package.json      ← puppeteer-core
    ├── scripts/words.py  ← распознавание речи с таймингами слов (faster-whisper)
    ├── scripts/mask.py   ← вырезка человека из кадров (MediaPipe)
    ├── models/           ← selfie_segmenter.tflite
    ├── a/                ← шрифты, звуки (sfx), иконки, стикеры
    └── examples/         ← принятые финалы: kreativ1/2/3, kreativ3-comment, do-posle
```

## Что нужно
Node.js 20+, ffmpeg, Google Chrome, Python 3.10+ с `faster-whisper numpy opencv-python mediapipe`.

## Как монтировать (коротко)
```bash
cp -r template/ my-reel/ && cd my-reel && npm install
mkdir -p media/frames
ffmpeg -i SOURCE.mp4 -vf "scale=1080:1920,fps=30" -q:v 3 media/frames/%05d.jpg
ffmpeg -i SOURCE.mp4 -vn -c:a aac -b:a 192k media/voice.m4a
python -I scripts/words.py SOURCE.mp4 kk > media/words.json   # kk или ru
python scripts/mask.py                                        # media/mask/*.png
# правим video.html по словам из words.json (data-frames, data-dur, data-ty, сцены)
node render.mjs stills 2.2 4.2 8.0                            # проверочные кадры → frames/
node render.mjs full                                          # готовый ролик → out/video.mp4
```
Два финала: держи `video-link.html` и `video-comment.html`, рендери оба.

## Как попросить Claude
> «Смонтируй это видео скиллом Nurserik Studio Hook» · «рилс-таргет» · «как креатив 1/2/3» · «до/после»

## Установка как скилл Claude Code
Скопируй папку `nurserik-studio-hook` в `~/.claude/skills/` (Windows: `C:\Users\<имя>\.claude\skills\`) и перезапусти Claude.

## Лицензии
Шрифты Inter и Oswald — SIL OFL (`template/a/OFL-*.txt`), иконки — Fluent Emoji (`template/a/icons/LICENSE-fluent-emoji.txt`). Музыка из платных библиотек в рекламе требует лицензии.
