// Движок «Чистый премиум». Не трогать без нужды: ролик описывается в video.html.
// render(t) рисует кадр на секунде t. window.DUR — длина, window.SFX — звуки [[сек, файл, громкость]].
(() => {
const clamp = x => Math.min(Math.max(x, 0), 1);
const ease = x => 1 - Math.pow(1 - clamp(x), 3);
const inout = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const spring = x => { x = clamp(x); return 1 - Math.cos(x * 4.2) * Math.exp(-x * 5.5); };
const num = (v, d = 0) => v === undefined || v === '' ? d : +v;
const XF = 0.35; // длина перехода между сценами, сек

const scenes = [...document.querySelectorAll('.scene')];
const SFX = [];
const sfx = (t, name, vol) => SFX.push([+t.toFixed(3), name, vol ?? 0.13]);

// подготовка: подписи по словам, кольца, фон сцены
scenes.forEach((sc, i) => {
  sc.s = num(sc.dataset.s); sc.e = num(sc.dataset.e, sc.s + 3);
  const bg = document.createElement('div');
  bg.className = 'bg ' + (sc.dataset.bg || 'mist');
  if (sc.dataset.img) { bg.style.backgroundImage = `url(${sc.dataset.img})`; bg.classList.add('photo'); }
  sc.prepend(bg);
  const cam = document.createElement('div'); cam.className = 'cam';
  [...sc.childNodes].filter(n => n !== bg).forEach(n => cam.appendChild(n));
  sc.appendChild(cam); sc.cam = cam;
  if (i > 0 && sc.dataset.sfx !== 'none') sfx(sc.s - 0.15, sc.dataset.sfx || 'whoosh', 0.10);

  sc.querySelectorAll('.cap').forEach(cap => {
    const lines = cap.innerHTML.split('|').map(s => s.trim());
    const times = (cap.dataset.w || '').trim().split(/\s+/).filter(x => x && x !== '|').map(Number);
    let t0 = num(cap.dataset.at, 0.1), k = 0;
    cap.innerHTML = lines.map((ln, li) => {
      const words = ln.split(/\s+/).filter(Boolean);
      return `<div class="l${li + 1}">` + words.map(w => {
        const t = times[k] ?? (t0 + k * 0.16); k++;
        return `<span class="w" data-t="${t}">${w}</span>`;
      }).join(' ') + '</div>';
    }).join('');
  });
  sc.querySelectorAll('.wave').forEach(w => {
    const n = num(w.dataset.bars, 36);
    w.innerHTML = Array.from({ length: n }, (_, k) => `<i style="height:${Math.round(25 + 75 * Math.abs(Math.sin(k * 1.7) * Math.cos(k * .45)))}%"></i>`).join('');
  });
  sc.querySelectorAll('.ring').forEach(r => {
    r.innerHTML = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" pathLength="1"/></svg>';
  });
  sc.querySelectorAll('[data-in][data-sfx]').forEach(el => sfx(sc.s + num(el.dataset.in), el.dataset.sfx, num(el.dataset.vol, 0.13)));
});

const mascot = document.getElementById('mascot');
const mpos = scenes.map(sc => sc.dataset.m ? sc.dataset.m.split(',').map(Number) : null);
window.DUR = Math.max(...scenes.map(s => s.e));
window.SFX = SFX;

function render(t) {
  let mi = -1;
  scenes.forEach((sc, i) => {
    const lt = t - sc.s, vis = t >= sc.s - XF && t < sc.e + XF;
    sc.style.display = vis ? 'block' : 'none'; if (!vis) return;
    if (t >= sc.s && t < sc.e) mi = i;
    const pin = ease((t - sc.s + XF) / (2 * XF)), pout = ease((t - sc.e + XF) / (2 * XF));
    sc.style.opacity = i === 0 ? 1 - pout : pin * (1 - pout);
    const blur = (1 - pin) * 26 + pout * 22;
    const camDir = sc.dataset.cam === 'out' ? -1 : 1;
    const push = 1 + camDir * 0.035 * clamp(lt / (sc.e - sc.s));
    const sc0 = (1 + (1 - pin) * 0.07) * (1 - pout * 0.05);
    sc.cam.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none';
    sc.cam.style.transform = `scale(${(push * sc0).toFixed(4)})`;

    sc.querySelectorAll('.cap .l2').forEach(l => { const f = l.querySelector('.w'); l.style.opacity = f ? ease((lt - num(f.dataset.t)) / 0.25) : 0; });
    sc.querySelectorAll('.w').forEach(w => {
      const p = ease((lt - num(w.dataset.t)) / 0.32);
      w.style.opacity = p; w.style.filter = p < 1 ? `blur(${((1 - p) * 12).toFixed(1)}px)` : 'none';
      w.style.transform = `translateY(${((1 - p) * 18).toFixed(1)}px)`;
    });

    sc.querySelectorAll('[data-in],[data-float],[data-drift],[data-out]').forEach(el => {
      const d = el.dataset; let o = 1, tf = '', f = 0;
      if (d.in !== undefined) {
        const p = (lt - num(d.in)) / num(d.dur, 0.6);
        o = clamp(p * 2.2);
        const sp = d.pop !== undefined ? spring(p) : ease(p);
        const from = d.from || 'scale';
        const dist = num(d.dist, 260);
        if (from === 'left') tf += `translateX(${(-(1 - sp) * dist).toFixed(1)}px) `;
        if (from === 'right') tf += `translateX(${((1 - sp) * dist).toFixed(1)}px) `;
        if (from === 'bottom') tf += `translateY(${((1 - sp) * dist).toFixed(1)}px) `;
        if (from === 'top') tf += `translateY(${(-(1 - sp) * dist).toFixed(1)}px) `;
        tf += `scale(${(0.82 + 0.18 * sp).toFixed(4)}) `;
        f = (1 - ease(p)) * 14;
      }
      if (d.out !== undefined) { const q = ease((lt - num(d.out)) / 0.4); o *= 1 - q; f += q * 14; tf += `scale(${(1 - q * 0.08).toFixed(4)}) `; }
      if (d.float !== undefined) { const a = num(d.float, 14), ph = el.ph ??= Math.random() * 6; tf += `translateY(${(Math.sin(lt * 1.6 + ph) * a).toFixed(1)}px) rotate(${(Math.sin(lt * 1.1 + ph) * a * 0.12).toFixed(2)}deg) `; }
      if (d.drift !== undefined) { const [dx, dy] = d.drift.split(',').map(Number); const k = clamp(lt / (sc.e - sc.s)); tf += `translate(${(dx * k).toFixed(1)}px,${(dy * k).toFixed(1)}px) `; }
      if (d.rot !== undefined) tf += `rotate(${d.rot}deg) `;
      el.style.opacity = o.toFixed(3); el.style.transform = tf;
      el.style.filter = f > 0.3 ? `blur(${f.toFixed(1)}px)` : '';
    });

    sc.querySelectorAll('.ring').forEach(r => {
      const p = inout((lt - num(r.dataset.in)) / 0.7);
      r.querySelector('circle').style.strokeDashoffset = (1 - p).toFixed(3);
      r.style.opacity = r.dataset.out !== undefined ? 1 - ease((lt - num(r.dataset.out)) / 0.3) : 1;
      r.style.transform = `translate(-50%,-50%) scale(${(0.9 + 0.1 * ease((lt - num(r.dataset.in)) / 0.7)).toFixed(3)})`;
      r.style.filter = '';
    });
    sc.querySelectorAll('[data-count]').forEach(el => {
      const target = +el.dataset.count, dec = (el.dataset.count.split('.')[1] || '').length;
      const p = inout((lt - num(el.dataset.cin, num(el.dataset.in))) / num(el.dataset.cdur, 1.2));
      el.textContent = (target * p).toFixed(dec).replace('.', el.dataset.comma !== undefined ? ',' : '.');
    });
    sc.querySelectorAll('[data-type]').forEach(el => {
      const s = el.dataset.type, p = clamp((lt - num(el.dataset.tin)) / num(el.dataset.tdur, 1.5));
      el.textContent = s.slice(0, Math.round(s.length * p)) + (p > 0 && p < 1 ? '|' : '');
    });
    sc.querySelectorAll('.wave').forEach(w => {
      const play = lt - num(w.dataset.play, 0);
      [...w.children].forEach((b, k) => { b.style.transform = `scaleY(${play > 0 ? (0.55 + 0.45 * Math.abs(Math.sin(lt * 6 + k * 0.8))).toFixed(3) : 0.55})`; });
    });
    sc.querySelectorAll('.typing').forEach(el => {
      [...el.children].forEach((dot, k) => dot.style.opacity = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(lt * 9 - k * 0.9)));
    });
    sc.querySelectorAll('[data-press]').forEach(el => {
      const dd = lt - num(el.dataset.press);
      el.classList.toggle('pressed', dd > 0);
      if (dd > 0 && dd < 0.18) el.style.transform += ' scale(0.93)';
    });
  });

  // талисман: плывёт между точками сцен (data-m="x,y,размер")
  if (mascot) {
    let a = -1;
    for (let i = 0; i < scenes.length; i++) if (t >= scenes[i].s - XF) a = i;
    const nx = a + 1;
    let p = mpos[a];
    if (nx < scenes.length && mpos[nx] && p && t > scenes[nx].s - 0.6) {
      const k = inout((t - (scenes[nx].s - 0.6)) / 0.9), q = mpos[nx];
      p = p.map((v, j) => v + (q[j] - v) * k);
    }
    if (!p) { mascot.style.opacity = 0; }
    else {
      const [x, y, w = 220] = p;
      mascot.style.opacity = clamp((t - 0.2) / 0.4);
      mascot.style.width = w + 'px';
      mascot.style.left = (x - w / 2) + 'px'; mascot.style.top = (y - w / 2) + 'px';
      mascot.style.transform = `translateY(${(Math.sin(t * 2.4) * 12).toFixed(1)}px) rotate(${(Math.sin(t * 1.3) * 4).toFixed(2)}deg)`;
    }
  }
}
window.render = render;
document.fonts.ready.then(() => render(0));
})();
