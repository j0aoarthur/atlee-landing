/* Atlee landing — interações (sem dependências além do three.js do iPhone 3D) */
(function () {
  'use strict';

  var root = document.querySelector('.at-root');
  if (!root) return;

  var rm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var WA = String(document.body.getAttribute('data-whatsapp') || '').replace(/\D/g, '');
  var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  var $ = function (s) { return root.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
  var SVGNS = 'http://www.w3.org/2000/svg';

  var NAV = ['funcionalidades', 'como-funciona', 'pra-quem', 'depoimentos', 'contato'];
  var S = { k: -1, heroOut: false, heroIn: false, shrunk: false, active: '', menu: false, deck: 0, p3: 'loading' };

  var E = {
    track: $('.story-track'), stage: $('.story-stage'), dots: $('.stage-dots'), heroCopy: $('.hero-copy'),
    aux: $$('.aux'), cue: $('.cue'), slotHero: $('.slot-hero'), slotFeat: $('.slot-feat'),
    canvas: $('.phone3d'), strip: $('.sw-strip'), nav: $('.nav'), h1: $('.hero-copy .h1'),
    fx: $$('.feat-copy .fx'), steps: $$('.sw-step'), stepsWrap: $('.sw-steps'),
    menu: $('.m-menu'), menuBtn: $('.menu-btn'), icOpen: $('.menu-btn .ic-open'), icClose: $('.menu-btn .ic-close'),
    deck: $$('.deck .dk'), deckCount: $('.dk-count'), measure: $('.j-measure'), legsHost: $('.j-legs')
  };

  /* ───────── state → DOM ───────── */
  function applyRoot() {
    ['loading', 'ready', 'off'].forEach(function (p) { root.classList.toggle('p3-' + p, S.p3 === p); });
    root.classList.toggle('k-feat', S.k >= 0);
    root.classList.toggle('k-hero', S.k < 0);
  }
  function applyK() {
    var k = S.k;
    E.fx.forEach(function (el, i) {
      el.classList.toggle('is-in', i === k);
      el.classList.toggle('is-out', k >= 0 && i < k);
      el.setAttribute('aria-hidden', i === k ? 'false' : 'true');
    });
    E.steps.forEach(function (el, i) {
      el.classList.toggle('on', i + 1 === k);
      el.classList.toggle('done', i + 1 < k);
    });
    if (E.stepsWrap) E.stepsWrap.classList.toggle('is-on', k >= 1);
    applyRoot();
  }
  function applyHero() {
    if (!E.h1) return;
    E.h1.classList.toggle('is-out', S.heroOut);
    E.h1.classList.toggle('is-in', !S.heroOut && S.heroIn);
  }
  function applyNav() {
    if (E.nav) E.nav.classList.toggle('is-shrunk', S.shrunk || S.menu);
    $$('.nav-links a, .m-menu a[href^="#"]:not(.btn)').forEach(function (a) {
      var on = a.getAttribute('href') === '#' + S.active;
      a.classList.toggle('is-active', on);
      a.setAttribute('aria-current', on ? 'true' : 'false');
    });
  }
  function applyMenu() {
    if (E.menu) E.menu.hidden = !S.menu;
    if (E.menuBtn) {
      E.menuBtn.setAttribute('aria-expanded', S.menu ? 'true' : 'false');
      E.menuBtn.setAttribute('aria-label', S.menu ? 'Fechar menu' : 'Abrir menu');
    }
    if (E.icOpen) E.icOpen.style.display = S.menu ? 'none' : '';
    if (E.icClose) E.icClose.style.display = S.menu ? '' : 'none';
    applyNav();
  }
  function applyDeck() {
    var n = E.deck.length;
    E.deck.forEach(function (el, i) {
      var d = ((i - S.deck) % n + n) % n;
      if (d > n / 2) d -= n;
      var ad = Math.abs(d);
      el.classList.toggle('is-active', d === 0);
      el.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      el.style.transform = 'translateX(calc(var(--fan) * ' + d + ')) translateY(' + (ad * 14) + 'px) rotate(' + (d * 7) + 'deg) scale(' + (1 - ad * 0.05).toFixed(2) + ')';
      el.style.zIndex = String(10 - ad);
      el.style.opacity = ad > 2 ? '0' : '1';
    });
    if (E.deckCount) E.deckCount.textContent = '0' + (S.deck + 1) + ' / 0' + n;
  }
  function set(patch) {
    var changed = {};
    Object.keys(patch).forEach(function (key) { if (S[key] !== patch[key]) { S[key] = patch[key]; changed[key] = true; } });
    if (changed.k || changed.p3) applyK();
    if (changed.heroOut || changed.heroIn) applyHero();
    if (changed.shrunk || changed.active) applyNav();
    if (changed.menu) applyMenu();
    if (changed.deck) applyDeck();
  }

  /* ───────── reveal dos títulos ───────── */
  var reveals = $$('[data-reveal]');
  if (!rm && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }
  setTimeout(function () { set({ heroIn: true }); }, 80);

  /* ───────── navegação suave ───────── */
  function scroller() {
    var el = root.parentElement;
    while (el && el !== document.body && el !== document.documentElement) {
      var st = getComputedStyle(el);
      if (/(auto|scroll)/.test(st.overflowY) && el.scrollHeight > el.clientHeight + 1) return el;
      el = el.parentElement;
    }
    return window;
  }
  function scrollToId(id) {
    var el = id === 'topo' ? root : root.querySelector('#' + id);
    if (!el) return;
    var sc = scroller();
    var behavior = rm ? 'auto' : 'smooth';
    var navFull = parseFloat(getComputedStyle(root).getPropertyValue('--nav')) || 80;
    var m = (id === 'topo' || id === 'funcionalidades') ? 0 : Math.round(navFull * 0.8);
    var r = el.getBoundingClientRect();
    if (sc === window) {
      window.scrollTo({ top: id === 'topo' ? 0 : window.pageYOffset + r.top - m, behavior: behavior });
    } else {
      sc.scrollTo({ top: id === 'topo' ? 0 : sc.scrollTop + r.top - sc.getBoundingClientRect().top - m, behavior: behavior });
    }
  }
  root.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || !root.contains(a)) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    e.preventDefault();
    scrollToId(id);
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    if (S.menu) set({ menu: false });
  });
  if (E.menuBtn) E.menuBtn.addEventListener('click', function () { set({ menu: !S.menu }); });

  /* ───────── depoimentos ───────── */
  var prevBtn = $('.dk-prev'), nextBtn = $('.dk-next');
  if (prevBtn) prevBtn.addEventListener('click', function () { set({ deck: (S.deck - 1 + E.deck.length) % E.deck.length }); });
  if (nextBtn) nextBtn.addEventListener('click', function () { set({ deck: (S.deck + 1) % E.deck.length }); });
  applyDeck();

  /* ───────── formulário ───────── */
  var form = $('.form-card form');
  var formBody = $('.form-body');
  var sent = $('.sent');
  if (form && sent) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var v = function (x) { return String(fd.get(x) || '').trim(); };
      var d = { nome: v('nome'), cargo: v('cargo'), atletica: v('atletica'), faculdade: v('faculdade') };
      sent.querySelector('.sent-name').textContent = d.nome.split(' ')[0];
      sent.querySelector('.sent-atl').textContent = d.atletica;
      var wa = sent.querySelector('.sent-wa');
      if (wa) {
        var txt = 'Oi! Sou ' + d.nome + ' (' + d.cargo + ') da ' + d.atletica + ' — ' + d.faculdade + '. Quero conhecer a Atlee.';
        wa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(txt);
        wa.hidden = !WA;
      }
      formBody.hidden = true;
      sent.hidden = false;
      sent.focus && sent.focus();
    });
    var again = sent.querySelector('.sent-again');
    if (again) again.addEventListener('click', function () { form.reset(); sent.hidden = true; formBody.hidden = false; });
  }

  /* ───────── card tilt (física de mola) ───────── */
  var tilts = $$('.tilt').map(function (el) {
    var t = {
      inner: el.querySelector('.tilt-in'),
      amp: parseFloat(el.getAttribute('data-tilt')) || 12, sc: parseFloat(el.getAttribute('data-scale')) || 1.05,
      rx: { x: 0, v: 0, t: 0 }, ry: { x: 0, v: 0, t: 0 }, s: { x: 1, v: 0, t: 1 }, live: false
    };
    var ok = function (e) { return !rm && (!e.pointerType || e.pointerType === 'mouse'); };
    el.addEventListener('pointerenter', function (e) { if (!ok(e)) return; t.s.t = t.sc; t.live = true; });
    el.addEventListener('pointermove', function (e) {
      if (!ok(e)) return;
      var r = el.getBoundingClientRect();
      t.rx.t = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -t.amp;
      t.ry.t = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * t.amp;
      t.live = true;
    });
    el.addEventListener('pointerleave', function () { t.rx.t = 0; t.ry.t = 0; t.s.t = 1; t.live = true; });
    return t;
  });
  function updateTilts(dt) {
    var step = function (s, k, c, m) { var a = (-k * (s.x - s.t) - c * s.v) / m; s.v += a * dt; s.x += s.v * dt; };
    tilts.forEach(function (t) {
      if (!t.live) return;
      for (var i = 0; i < 2; i++) { step(t.rx, 100, 30, 2); step(t.ry, 100, 30, 2); step(t.s, 100, 30, 2); }
      t.inner.style.transform = 'rotateX(' + t.rx.x.toFixed(2) + 'deg) rotateY(' + t.ry.x.toFixed(2) + 'deg) scale(' + t.s.x.toFixed(4) + ')';
      if ([t.rx, t.ry, t.s].every(function (s) { return Math.abs(s.x - s.t) < 0.002 && Math.abs(s.v) < 0.002; })) t.live = false;
    });
  }

  /* ───────── linha de jornada (um svg por seção) ───────── */
  var J = null;
  function buildJourney() {
    var host = E.legsHost;
    if (!host) return;
    while (host.firstChild) host.removeChild(host.firstChild);
    J = null;
    var secs = $$('[data-stop]');
    var endEl = $('[data-journey-end]');
    if (!secs.length || !endEl || !E.measure) return;
    var W = root.clientWidth;
    var rr = root.getBoundingClientRect();
    var top = function (el) { return el.getBoundingClientRect().top - rr.top; };
    var mob = W < 720;
    var xL = mob ? 11 : Math.max(16, (W - 1240) / 2 - 24);
    var xR = W - xL;
    var r = mob ? 18 : 30;
    var SPAN = mob ? 170 : 240;
    var er = endEl.getBoundingClientRect();
    var ex = er.left - rr.left + er.width / 2;
    var ey = er.top - rr.top + er.height / 2;
    var eR = er.width / 2;
    var len = function (d) { E.measure.setAttribute('d', d); return E.measure.getTotalLength(); };
    var meta = [];
    secs.forEach(function (sec, i) {
      var T = top(sec), H = sec.offsetHeight, last = i === secs.length - 1;
      var side = i % 2 === 0 ? xL : xR;
      var other = side === xL ? xR : xL;
      var sg = other > side ? 1 : -1;
      var y0 = i === 0 ? 24 : r;
      var k0 = i === 0 ? T + y0 : T + SPAN / 2; // só começa quando o trecho anterior termina de atravessar
      var d, keys, h, total, v;
      if (last) {
        var ly = ey - T, sx = ex > side ? 1 : -1, r2 = mob ? 14 : 30;
        v = 'M ' + side + ' ' + y0 + ' L ' + side + ' ' + (ly - r2);
        d = v + ' Q ' + side + ' ' + ly + ' ' + (side + sx * r2) + ' ' + ly + ' L ' + (ex - sx * (eR + 6)) + ' ' + ly;
        total = len(d);
        keys = [[k0, 0], [T + ly - 60, len(v)], [T + ly + 60, total]];
        h = ly + 12;
      } else {
        v = 'M ' + side + ' ' + y0 + ' L ' + side + ' ' + (H - r);
        d = v + ' Q ' + side + ' ' + H + ' ' + (side + sg * r) + ' ' + H + ' L ' + (other - sg * r) + ' ' + H + ' Q ' + other + ' ' + H + ' ' + other + ' ' + (H + r);
        total = len(d);
        keys = [[k0, 0], [T + H - SPAN / 2, len(v)], [T + H + SPAN / 2, total]];
        h = H + r + 8;
      }
      var svg = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('class', 'j-leg' + (sec.classList.contains('on-dark') ? ' on-dark-leg' : ''));
      svg.setAttribute('width', W);
      svg.setAttribute('height', Math.ceil(h));
      svg.setAttribute('aria-hidden', 'true');
      svg.style.top = Math.round(T) + 'px';
      ['j-track', 'j-under', 'j-over'].forEach(function (c) {
        var p = document.createElementNS(SVGNS, 'path');
        p.setAttribute('class', c);
        p.setAttribute('d', d);
        svg.appendChild(p);
      });
      var head = document.createElementNS(SVGNS, 'circle');
      head.setAttribute('class', 'j-head');
      head.setAttribute('r', mob ? 6 : 9);
      head.setAttribute('cx', -40);
      head.setAttribute('cy', -40);
      svg.appendChild(head);
      host.appendChild(svg);
      meta.push({ keys: keys, total: total, over: svg.querySelector('.j-over'), under: svg.querySelector('.j-under'), head: head });
    });
    J = { meta: meta, end: endEl };
  }
  function updateJourney(scrolled, vh) {
    if (!J) return;
    var pen = scrolled + vh * 0.62;
    var allDone = true;
    J.meta.forEach(function (m) {
      var k = m.keys, L = 0;
      if (rm || pen >= k[k.length - 1][0]) L = m.total;
      else if (pen > k[0][0]) {
        for (var j = 1; j < k.length; j++) {
          if (pen <= k[j][0]) { var a = k[j - 1], b = k[j]; L = a[1] + (b[1] - a[1]) * (pen - a[0]) / Math.max(1, b[0] - a[0]); break; }
        }
      }
      var off = Math.max(0, m.total - L);
      var da = m.total + ' ' + (m.total + 4);
      m.over.style.strokeDasharray = da; m.under.style.strokeDasharray = da;
      m.over.style.strokeDashoffset = off; m.under.style.strokeDashoffset = off;
      var active = L > 0.5 && L < m.total - 0.5;
      if (active) { var p = m.over.getPointAtLength(L); m.head.setAttribute('cx', p.x); m.head.setAttribute('cy', p.y); }
      m.head.style.opacity = active ? '1' : '0';
      if (L < m.total - 0.5) allDone = false;
    });
    J.end.classList.toggle('is-lit', allDone);
  }

  /* ───────── iPhone 3D ───────── */
  var eng = null;
  function sizeCanvas() {
    if (!eng || !E.stage) return;
    eng.resize(E.stage.clientWidth, E.stage.clientHeight, Math.min(window.devicePixelRatio || 1, 1.75));
  }
  function init3D() {
    if (rm) { set({ p3: 'off' }); return; }
    var gl = null;
    try { var c = document.createElement('canvas'); gl = c.getContext('webgl2') || c.getContext('webgl'); } catch (e) { gl = null; }
    if (!gl) { set({ p3: 'off' }); return; }
    var tries = 0;
    var wait = setInterval(function () {
      tries++;
      if (window.AtleePhone && window.ATLEE_ASSETS) {
        clearInterval(wait);
        window.AtleePhone.create(E.canvas, window.ATLEE_ASSETS).then(function (en) {
          eng = en; sizeCanvas(); dirty = true; set({ p3: 'ready' });
        }).catch(function () { set({ p3: 'off' }); });
      } else if (tries > 200) { clearInterval(wait); set({ p3: 'off' }); }
    }, 100);
  }

  /* ───────── sticky: hero → giro → funcionalidades ───────── */
  var sp = null, tw = { from: 0, to: 0, t0: 0, dur: 1 }, px = 0, py = 0;
  function updateStory(t, vh, moved, patch) {
    if (!E.track || !E.stage || rm) return;
    var tr = E.track.getBoundingClientRect();
    if (!(tr.bottom > 0 && tr.top < vh)) return;
    var H = E.stage.offsetHeight;
    var s = -tr.top;
    var pT = clamp((s - 0.08 * H) / (0.92 * H), 0, 1);
    var e = pT < 0.5 ? 4 * pT * pT * pT : 1 - Math.pow(-2 * pT + 2, 3) / 2;
    var fStart = 1.9 * H, U = 1.15 * H;
    var raw = (s - fStart) / U;
    var fi = raw < 0 ? 0 : clamp(Math.floor(raw + 0.5), 0, 4);
    var k = -1;
    if (pT >= 0.6) k = s < fStart - 0.35 * U ? 0 : 1 + fi;
    if (k !== S.k) patch.k = k;
    var heroOut = pT > 0.16;
    if (heroOut !== S.heroOut) patch.heroOut = heroOut;

    var now = t * 1000;
    var mob = E.stage.clientWidth < 820;
    var rA = mob ? -0.16 : -0.42, rB = mob ? 0.14 : 0.36;
    var eBack = (Math.PI - rA) / (rB - rA + Math.PI * 2);
    var target;
    if (k < 1) {
      // capa → tela inicial troca num único quadro, quando o celular está de costas
      target = e >= eBack ? 1 : 0;
      sp = target; tw.from = target; tw.to = target; tw.t0 = now - 1e4;
    } else {
      target = k + 1;
    }
    if (sp == null) sp = target;
    if (target !== tw.to) { tw.from = sp; tw.to = target; tw.t0 = now; tw.dur = 720 + 160 * Math.max(0, Math.abs(target - sp) - 1); }
    var tp = clamp((now - tw.t0) / tw.dur, 0, 1);
    var te = tp < 0.5 ? 4 * tp * tp * tp : 1 - Math.pow(-2 * tp + 2, 3) / 2;
    sp = tp >= 1 ? tw.to : tw.from + (tw.to - tw.from) * te;
    var pos = sp;
    var f = tp < 1 ? tp : 0;

    if (moved) {
      var bgMix = clamp((pT - 0.15) / 0.55, 0, 1);
      var c0 = [255, 91, 46], c1 = [250, 248, 245];
      E.stage.style.backgroundColor = 'rgb(' + c0.map(function (c, i) { return Math.round(c + (c1[i] - c) * bgMix); }).join(',') + ')';
      E.dots.style.opacity = String(1 - bgMix);
      E.heroCopy.style.opacity = String(clamp(1 - pT * 1.7, 0, 1));
      E.heroCopy.style.transform = 'translate3d(0,' + (-pT * 70).toFixed(1) + 'px,0)';
      E.aux.forEach(function (a, i) { a.style.opacity = String(clamp(1 - pT * 2.4, 0, 1)); a.style.translate = '0 ' + (-pT * (40 + i * 30)).toFixed(1) + 'px'; });
      if (E.cue) E.cue.style.opacity = String(clamp(1 - pT * 4, 0, 1));
    }
    if (S.p3 !== 'ready' && E.strip) {
      var sh = E.strip.parentElement.clientHeight;
      E.strip.style.transform = 'translate3d(0,' + (-clamp(pos - 2, 0, 1) * sh).toFixed(1) + 'px,0)';
    }
    if (!eng || S.p3 !== 'ready') return;
    var sr = E.stage.getBoundingClientRect();
    var a = E.slotHero.getBoundingClientRect();
    var b = E.slotFeat.getBoundingClientRect();
    var ha = mob ? Math.max(a.height * 0.96, H * 0.5) : Math.min(a.height * 0.94, a.width / 0.5);
    var hb = Math.min(b.height * 0.94, b.width / 0.5);
    var ax = a.left - sr.left + a.width / 2, ay = a.top - sr.top + (mob ? ha / 2 : a.height / 2);
    var bx = b.left - sr.left + b.width / 2, by = b.top - sr.top + b.height / 2;
    var idle = 1 - e;
    var wob = Math.sin(Math.PI * f) * 0.22 * (Math.sign(tw.to - tw.from) || 1);
    eng.set({
      cx: ax + (bx - ax) * e,
      cy: ay + (by - ay) * e - Math.sin(Math.PI * e) * H * 0.05 + Math.sin(t * 1.2) * 7 * idle,
      h: (ha + (hb - ha) * e) * (1 + Math.sin(Math.PI * e) * 0.05),
      ry: rA + (rB - rA) * e + e * Math.PI * 2 + (px * 0.16 + Math.sin(t * 0.6) * 0.05) * idle + Math.sin(t * 0.7) * 0.03 * e + wob,
      rx: 0.05 + py * 0.08 * idle + Math.sin(t * 0.8) * 0.015,
      rz: (mob ? 0.02 : 0.07) * idle - 0.035 * e,
      screen: pos
    });
    eng.render();
  }

  /* ───────── loop ───────── */
  var dirty = true, lastS = null, lastT = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, Math.max(0.001, (now - (lastT || now)) / 1000)) / 2;
    lastT = now;
    var rr = root.getBoundingClientRect();
    var vh = window.innerHeight || 800;
    var scrolled = -rr.top;
    var moved = dirty || scrolled !== lastS;
    lastS = scrolled; dirty = false;
    var patch = {};
    if (moved) {
      patch.shrunk = scrolled > 100;
      var active = '';
      NAV.forEach(function (id) { var el = root.querySelector('#' + id); if (el && el.getBoundingClientRect().top <= vh * 0.4) active = id; });
      patch.active = active;
      updateJourney(scrolled, vh);
    }
    updateStory(now / 1000, vh, moved, patch);
    updateTilts(dt);
    set(patch);
  }

  window.addEventListener('scroll', function () { dirty = true; }, { passive: true, capture: true });
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    px = (e.clientX / window.innerWidth) * 2 - 1;
    py = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  var rt;
  function onResize() { clearTimeout(rt); rt = setTimeout(function () { buildJourney(); sizeCanvas(); dirty = true; }, 120); }
  window.addEventListener('resize', onResize);
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(root);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { buildJourney(); dirty = true; });

  applyRoot(); applyK(); applyMenu();
  buildJourney();
  init3D();
  if (location.hash.length > 1) setTimeout(function () { scrollToId(location.hash.slice(1)); }, 300);
  requestAnimationFrame(frame);
})();
