/* Nurserik Studio Hook — движок из обучения Нұрсерік (курс PROXIMA «Монтаж с Claude»).
   Нұрсеріктің оқуындағы скилл: Нұрсерік өз таргет-креативтерін осы движокпен монтаждады. */
// Движок «Студийный хук». Не меняй без нужды — сцены пишутся в video.html.
// window.render(t) рисует кадр на секунде t. window.DUR, window.SFX читает render.mjs.
(() => {
  const FPS = 30;
  const $ = (q, r = document) => [...r.querySelectorAll(q)];
  const num = (v, d = 0) => (v === undefined || v === null || v === '' ? d : parseFloat(v));
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
  const easeInOut = x => (x = clamp(x), x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const back = x => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const spring = x => x <= 0 ? 0 : x >= 1.2 ? 1 : 1 - Math.exp(-7 * x) * Math.cos(11 * x);
  const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  const stage = document.getElementById('stage');
  const cam = document.getElementById('cam');
  const vid = document.getElementById('vid');
  const cut = document.getElementById('cut');
  const behind = document.getElementById('behind');
  const NFRAMES = num(document.body.dataset.frames, 0);
  const scenes = $('section.scene').map(sc => ({
    el: sc, s: num(sc.dataset.s), e: num(sc.dataset.e), full: sc.classList.contains('full'),
    cam: num(sc.dataset.cam, 1), ty: num(sc.dataset.ty, num(document.body.dataset.ty, 0)), push: num(sc.dataset.push, 0.015), cx: num(sc.dataset.cx, 50), cy: num(sc.dataset.cy, 30),
    punch: sc.dataset.punch ? sc.dataset.punch.split(/\s+/).map(Number) : [],
  }));
  window.DUR = num(document.body.dataset.dur, scenes.length ? Math.max(...scenes.map(s => s.e)) : 10);

  // элементы «за головой» переносим в слой behind, запоминая их сцену
  scenes.forEach((S, i) => {
    $('.bh', S.el).forEach(el => { el.dataset.scene = i; behind.appendChild(el); });
  });
  const items = [];
  scenes.forEach((S, i) => {
    const els = [...$('[data-in]', S.el), ...$(`#behind [data-scene="${i}"]`), ...$(`#behind [data-scene="${i}"] [data-in]`)];
    [...new Set(els)].forEach(el => items.push({ el, S, i }));
  });

  // подготовка текстовых эффектов
  $('[data-fx="scramble"],[data-fx="type"]').forEach(el => { el.dataset.txt = el.textContent; });
  // разбивка на слова только в тексте — теги (цветные span) сохраняются
  const splitWords = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
        else { const s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.appendChild(s); } });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && !n.classList.contains('w')) splitWords(n);
  });
  $('[data-fx="words"]').forEach(splitWords);
  $('svg.draw path, svg.draw ellipse, svg.draw circle, svg.draw line, svg.draw polyline').forEach(p => {
    const L = p.getTotalLength ? p.getTotalLength() : 2000; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.dataset.len = L;
  });
  // мозаика: текст рисуется в canvas и «собирается» из крупных пикселей
  let mos = [];
  const initMos = () => mos = $('.mos').map(el => {
    const cs = getComputedStyle(el), txt = el.dataset.text || el.textContent; el.textContent = '';
    const c = document.createElement('canvas'); el.appendChild(c);
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const m = document.createElement('canvas').getContext('2d'); m.font = font;
    const W = Math.ceil(m.measureText(txt).width + 20), H = Math.ceil(parseFloat(cs.fontSize) * 1.25);
    c.width = W; c.height = H; c.style.width = W + 'px'; c.style.height = H + 'px';
    const src = document.createElement('canvas'); src.width = W; src.height = H;
    const g = src.getContext('2d'); g.font = font; g.fillStyle = cs.color; g.textBaseline = 'middle'; g.fillText(txt, 10, H / 2 + 2);
    return { el, c, src, W, H, fin: num(el.dataset.pix, 1) };
  });
  const drawMos = (M, k) => {
    const g = M.c.getContext('2d'); g.clearRect(0, 0, M.W, M.H);
    k = Math.max(1, Math.round(k));
    if (k <= 1) { g.imageSmoothingEnabled = true; g.drawImage(M.src, 0, 0); return; }
    const w = Math.max(1, Math.round(M.W / k)), h = Math.max(1, Math.round(M.H / k));
    const t = document.createElement('canvas'); t.width = w; t.height = h;
    const tg = t.getContext('2d'); tg.imageSmoothingEnabled = true; tg.drawImage(M.src, 0, 0, w, h);
    g.imageSmoothingEnabled = false; g.drawImage(t, 0, 0, w, h, 0, 0, M.W, M.H);
  };

  // звуки: на появлении элементов с data-sfx и на каждой смене сцены
  const SFX = [];
  // переходы: мягкие кинематографичные вжухи (пик ровно на склейке), тише
  scenes.forEach((S, i) => { if (i > 0 && S.el.dataset.sfx !== 'none') SFX.push(S.el.dataset.sfx ? [S.s - 0.12, S.el.dataset.sfx, 0.12] : [S.s - 0.6, 'cin' + (i % 3 + 1), 0.09]); });
  items.forEach(({ el, S }) => {
    if (el.dataset.sfx) SFX.push([S.s + num(el.dataset.in), el.dataset.sfx, num(el.dataset.vol, 0.13) * (el.dataset.sfx === 'whoosh' ? 0.6 : 1)]);
    if (el.dataset.strike && el.dataset.sfxStrike !== 'none') SFX.push([S.s + num(el.dataset.strike), 'click', 0.12]);
  });
  window.SFX = SFX;

  const SCR = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ#$%&@*+=<>?/0123456789';
  const frameNo = t => Math.min(NFRAMES || 1e9, Math.floor(t * FPS) + 1);
  const pad = n => String(n).padStart(5, '0');
  const load = (img, src) => new Promise(r => { if (img.getAttribute('src') === src) return r(); img.onload = img.onerror = () => r(); img.src = src; setTimeout(r, 4000); })
    .then(() => img.decode ? img.decode().catch(() => {}) : 0);

  function animEl(el, lt, t) {
    const d = el.dataset, fx = d.fx || 'blur', dur = num(d.dur, fx === 'scramble' ? 0.5 : fx === 'type' ? 0.6 : 0.4);
    const outAt = d.out !== undefined ? num(d.out) : null;
    const x = lt / dur;
    let op = 1, tf = '', blur = 0;
    if (lt < 0) { el.style.opacity = 0; return; }
    const from = d.from, dist = num(d.dist, 260);
    const off = (k) => from === 'left' ? `translateX(${-dist * k}px)` : from === 'right' ? `translateX(${dist * k}px)` :
      from === 'bottom' ? `translateY(${dist * k}px)` : from === 'top' ? `translateY(${-dist * k}px)` : '';
    if (fx === 'blur') { const k = 1 - easeOut(x); op = clamp(x * 2.2); blur = 22 * k; tf = `${off(k)} scale(${1 + 0.28 * k})`; }
    else if (fx === 'pop') { const k = spring(x * 1.1); op = clamp(x * 4); tf = `${off(1 - easeOut(x))} scale(${k}) rotate(${num(d.rot, 0) * (1 - k)}deg)`; }
    else if (fx === 'squash') { const k = 1 - easeOut(x); op = clamp(x * 3); blur = 14 * k; tf = `scaleX(${1 + .25 * k}) scaleY(${1 - .55 * k})`; }
    else if (fx === 'slide') { const k = 1 - back(x); op = clamp(x * 3); blur = 16 * clamp(k * 2, 0, 1); tf = off(k); }
    else if (fx === 'scramble' || fx === 'type') {
      const s = d.txt; const n = s.length; const p = clamp(x);
      if (fx === 'type') el.textContent = s.slice(0, Math.ceil(n * p));
      else { const lock = Math.floor(n * p); let o = ''; const fr = Math.floor(t * 15);
        for (let i = 0; i < n; i++) o += i < lock || s[i] === ' ' ? s[i] : SCR[Math.floor(rnd(i * 7 + fr) * SCR.length)];
        el.textContent = o; }
      op = 1; blur = fx === 'scramble' ? 4 * (1 - p) : 0;
    }
    else if (fx === 'words') {
      const ws = (d.w || '').split(/[\s|]+/).filter(Boolean).map(Number), base = num(d.in);
      $('.w', el).forEach((w, i) => { const wl = lt + base - (ws[i] ?? base + i * 0.2); const k = 1 - easeOut(wl / 0.3);
        w.style.opacity = wl < 0 ? 0 : clamp(wl / 0.15); w.style.filter = `blur(${10 * k}px)`; w.style.transform = `translateY(${18 * k}px)`; });
    }
    else if (fx === 'jelly') {
      // буквы вылетают по одной и пружинят, как мармелад
      if (!el.dataset.split) { el.dataset.split = 1; el.innerHTML = [...el.textContent].map(c => `<span class="jl">${c === ' ' ? '&nbsp;' : c}</span>`).join(''); }
      const st = num(d.step, 0.045);
      $('.jl', el).forEach((c, i) => { const x = (lt - i * st) / 0.5; const k = spring(x * 1.1);
        c.style.display = 'inline-block'; c.style.opacity = x <= 0 ? 0 : 1;
        c.style.transform = `translateY(${(1 - easeOut(x * 2)) * 60}px) scale(${0.4 + 0.6 * k},${0.2 + 0.8 * k + 0.25 * Math.sin(clamp(x) * Math.PI) })`; });
    }
    else if (fx === 'none') { }
    // мозаика
    const M = mos.find(m => m.el === el); if (M) drawMos(M, M.fin + (num(d.pixFrom, 26) - M.fin) * (1 - easeInOut(lt / num(d.pixDur, 0.7))));
    // обводка от руки
    if (el.matches('svg.draw')) $('path,ellipse,circle,line,polyline', el).forEach(p => p.style.strokeDashoffset = p.dataset.len * (1 - easeInOut(lt / num(d.dur, 0.6))));
    // зачёркивание
    if (d.strike !== undefined) el.style.setProperty('--k', easeOut((lt + num(d.in) - num(d.strike)) / 0.3));
    // счётчик
    if (d.count) { const [a, b] = d.count.split(' ').map(Number); const v = a + (b - a) * easeOut((lt) / num(d.cdur, 1));
      el.textContent = (d.pre || '') + Math.round(v).toLocaleString('ru-RU').replace(/ /g, ' ') + (d.post || ''); }
    // барабан вариантов
    if (el.classList.contains('wheel')) {
      const st = (d.steps || '').split(/\s+/).map(Number), its = $('.it', el), base = num(d.in);
      let pos = 0; st.forEach((s, i) => { pos += easeInOut((lt + base - s) / 0.28); });
      const ih = num(d.ih, 70);
      el.querySelector('.track').style.transform = `translateY(${-pos * ih}px)`;
      its.forEach((it, i) => { const dd = Math.abs(i - pos); it.style.opacity = dd > 1.6 ? 0 : clamp(1 - dd * 0.5, 0.15, 1); it.style.transform = `scale(${1 + 0.45 * clamp(1 - dd)})`; it.classList.toggle('on', dd < 0.5); });
    }
    // сетка-прогресс: <div class="grid" data-cells="96" data-fill="1.1 3.0"> — клетки загораются по порядку
    if (el.classList.contains('grid')) {
      if (!el.children.length) for (let i = 0; i < num(d.cells, 96); i++) el.appendChild(document.createElement('i'));
      const [a, b] = (d.fill || '0 1').split(' ').map(Number), base = num(d.in), k = clamp((lt + base - a) / (b - a));
      [...el.children].forEach((c, i, all) => c.classList.toggle('on', i < Math.round(k * all.length)));
    }
    // маркер-подсветка: <span class="hl" data-in=".."> — плашка заливается слева направо
    if (el.classList.contains('hl')) el.style.setProperty('--k', easeOut((lt) / num(d.hdur, 0.35)));
    // курсор: data-path="x0,y0" — откуда прилетает к своей позиции; клик в конце (data-mdur)
    if (d.path) {
      const [x0, y0] = d.path.split(',').map(Number), md = num(d.mdur, 0.6), k = easeInOut(lt / md);
      tf += ` translate(${x0 * (1 - k)}px,${y0 * (1 - k)}px)`;
      const c = lt - md; if (c > 0 && c < 0.18) tf += ` scale(${1 - 0.18 * Math.sin(c / 0.18 * Math.PI)})`;
    }
    // нажатие кнопки: data-press="сек от начала сцены"
    if (d.press) { const c = lt + num(d.in) - num(d.press); if (c > 0 && c < 0.25) tf += ` scale(${1 - 0.1 * Math.sin(c / 0.25 * Math.PI)})`; }
    // взрыв частиц: <div class="burst" data-n="40" data-r="380">
    if (el.classList.contains('burst')) {
      if (!el.children.length) for (let i = 0; i < num(d.n, 40); i++) el.appendChild(document.createElement('i'));
      const R = num(d.r, 380);
      [...el.children].forEach((p, i) => { const a = rnd(i * 3.1) * Math.PI * 2, r = R * (0.3 + 0.7 * rnd(i * 7.7)) * easeOut(lt / 0.7);
        p.style.transform = `translate(${Math.cos(a) * r}px,${Math.sin(a) * r}px) scale(${1 - clamp(lt / 1.1)})`; p.style.opacity = 1 - clamp((lt - 0.3) / 0.8); });
    }
    // влёт в раму: data-zoomat="сек от начала сцены" data-zs="4.2" data-zdur="0.35" — рама растёт на весь экран, ч/б → цвет (--gk)
    if (d.zoomat) { const k = easeInOut((lt + num(d.in) - num(d.zoomat)) / num(d.zdur, 0.35));
      tf += ` scale(${1 + (num(d.zs, 4) - 1) * k})`; el.style.setProperty('--gk', k); el.style.zIndex = k > 0 ? 30 : ''; }
    // поворот/смена состояния: data-turn="сек от начала сцены" → --tk 0..1 (стрелка вниз, красный цвет)
    if (d.turn) el.style.setProperty('--tk', easeInOut((lt + num(d.in) - num(d.turn)) / 0.4));
    // покачивание и вращение
    if (d.float) tf += ` translateY(${Math.sin(t * 2.1 + num(d.in) * 3) * num(d.float)}px)`;
    if (d.spin) tf += ` rotate(${t * num(d.spin)}deg)`;
    if (d.drift) { const [dx, dy] = d.drift.split(',').map(Number); tf += ` translate(${dx * lt}px,${dy * lt}px)`; }
    // уход
    if (outAt !== null && lt + num(d.in) >= outAt) {
      const o = (lt + num(d.in) - outAt) / num(d.odur, 0.3), k = easeInOut(o), of = d.outfx || 'blur';
      op *= 1 - k; blur += 20 * k;
      tf += of === 'up' ? ` translateY(${-220 * k}px)` : of === 'down' ? ` translateY(${220 * k}px)` : of === 'right' ? ` translateX(${420 * k}px)` : of === 'left' ? ` translateX(${-420 * k}px)` : ` scale(${1 + 0.25 * k})`;
    }
    el.style.opacity = op; el.style.filter = blur > 0.2 ? `blur(${blur}px)` : ''; el.style.transform = tf;
  }

  window.render = async (t) => {
    const si = scenes.findIndex(S => t >= S.s && t < S.e);
    const S = scenes[si < 0 ? scenes.length - 1 : si];
    scenes.forEach((X, i) => X.el.classList.toggle('on', X === S));
    $('#behind > *').forEach(el => el.style.display = +el.dataset.scene === scenes.indexOf(S) ? '' : 'none');
    // кадр видео и вырезанный человек
    const n = pad(frameNo(t));
    const ext = document.getElementById('ext');
    await Promise.all([load(vid, `media/frames/${n}.jpg`), cut ? load(cut, `media/mask/${n}.png`) : 0, ext ? load(ext, `media/frames/${n}.jpg`) : 0]);
    // видеовставки: <img class="seq" data-seq="media/yt/" data-f0="90" data-nf="702"> — кадр = f0 + время от начала сцены
    const seqs = $('img.seq', S.el).map(im => {
      let f = Math.max(1, num(im.dataset.f0, 1) + Math.floor((t - S.s - num(im.dataset.sin, 0)) * FPS));
      const nf = num(im.dataset.nf, 1e9); f = im.hasAttribute('data-loop') ? ((f - 1) % nf) + 1 : Math.min(nf, f);
      return load(im, im.dataset.seq + pad(f) + (im.dataset.ext || '.jpg'));
    });
    await Promise.all(seqs);
    stage.classList.toggle('isfull', S.full);
    // камера: базовый масштаб сцены + медленный наезд + удары
    const p = (t - S.s) / Math.max(0.1, S.e - S.s);
    let z = S.cam * (1 + S.push * easeInOut(p));
    S.punch.forEach(pt => { z *= 1 + 0.07 * easeOut((t - pt) / 0.18); });
    $('.cam').forEach(c => { c.style.transformOrigin = `${S.cx}% ${S.cy}%`; c.style.transform = `translateY(${S.ty}px) scale(${z})`; });
    // элементы
    items.forEach(({ el, S: X }) => { if (X === S) animEl(el, t - X.s - num(el.dataset.in), t); });
    // переход через размытие на стыке сцен
    let b = 0, zb = 0;
    scenes.forEach((X, i) => { if (i === 0 || X.el.dataset.tr === 'none') return; const d = Math.abs(t - X.s); if (d < 0.2) { const k = 1 - d / 0.2; b = Math.max(b, 34 * k * k); zb = Math.max(zb, 0.1 * k * k); } });
    // начало ролика: <body data-intro="zoom"> — сразу резкий наезд без размытия; без атрибута — старое размытие
    if (document.body.dataset.intro === 'zoom') { if (t < 0.45) zb = Math.max(zb, 0.06 * (1 - easeOut(t / 0.45))); }
    else if (document.body.dataset.intro !== 'none') { const d = t; if (d < 0.22) { const k = 1 - d / 0.22; b = Math.max(b, 30 * k * k); zb = Math.max(zb, 0.12 * k * k); } }
    // переход-шторка: <section data-trans="wipe" data-wc="#2f6bff"> — цветная панель проезжает снизу вверх на стыке
    let wipe = document.getElementById('wipe');
    if (!wipe) { wipe = document.createElement('div'); wipe.id = 'wipe'; document.body.appendChild(wipe); }
    wipe.style.display = 'none';
    scenes.forEach(X => { if (X.el.dataset.trans !== 'wipe') return; const d = t - X.s;
      if (d > -0.28 && d < 0.28) { const k = (d + 0.28) / 0.56; wipe.style.display = 'block'; wipe.style.background = X.el.dataset.wc || '#2f6bff';
        wipe.style.transform = `translateY(${(1 - easeInOut(k) * 2) * 100}%)`; b = Math.max(b, 6); } });
    stage.style.filter = b > 0.3 ? `blur(${b}px)` : '';
    stage.style.transform = zb > 0.001 ? `scale(${1 + zb})` : '';
    await new Promise(r => setTimeout(r, 0));
  };
  window.READY = Promise.all(['800 100px Inter', '400 100px Mono', 'italic 400 100px Script', '700 100px Cond', '400 100px SerifBI'].map(f => document.fonts.load(f, 'Аә')))
    .then(() => document.fonts.ready).then(() => { initMos(); return true; });
})();
