/* ============================================================
   الخليل للصغار — main.js
   تحية حسب الوقت · التاريخ · لعبة جمع النجوم · مبدّل التطريز
   ============================================================ */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  /* ---------------------------------------------------------
     1) التاريخ بالعربية
     --------------------------------------------------------- */
  function renderDate() {
    const el = $('#liveDate');
    if (!el) return;

    try {
      el.textContent = new Intl.DateTimeFormat('ar', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date());
    } catch {
      el.textContent = new Date().toLocaleDateString('ar');
    }
  }

  /* ---------------------------------------------------------
     2) التحية حسب ساعة اليوم
     --------------------------------------------------------- */
  const GREETINGS = [
    { until: 5,  text: 'تصبح على خير يا صغير' },
    { until: 11, text: 'صباح الخير يا بطل' },
    { until: 16, text: 'نهارك سعيد يا صديق' },
    { until: 20, text: 'مساء الخير ونور بيتك' },
    { until: 24, text: 'تصبح على خير يا صغير' }
  ];

  function renderGreeting() {
    const el = $('#greetingText');
    if (!el) return;
    el.textContent = pick(GREETINGS.filter(g => new Date().getHours() < g.until)).text;
  }

  /* ---------------------------------------------------------
     3) مبدّل نمط التطريز
     --------------------------------------------------------- */
  const THEME_KEY = 'alkhaleel.theme';

  function initTheme() {
    const buttons = $$('[data-theme-set]');
    const root = document.documentElement;

    const apply = name => {
      root.dataset.theme = name;
      buttons.forEach(b => b.classList.toggle('is-active', b.dataset.themeSet === name));
      try { localStorage.setItem(THEME_KEY, name); } catch { /* الوضع الخاص */ }
    };

    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch { /* تجاهل */ }
    apply(saved || 'red');

    buttons.forEach(b => b.addEventListener('click', () => apply(b.dataset.themeSet)));
  }

  /* ---------------------------------------------------------
     4) لعبة جمع النجوم
     --------------------------------------------------------- */
  const STAR_PATH =
    'M50 2 60 32 88 20 68 44 98 50 68 56 88 80 60 68 50 98 40 68 12 80 32 56 2 50 32 44 12 20 40 32Z';

  const GOAL    = 10;
  const ON_FIELD = 7;
  const BEST_KEY = 'alkhaleel.best';

  function initGame() {
    const field = $('#playfield');
    if (!field) return;

    const scoreEl = $('#scoreCount');
    const bestEl  = $('#bestCount');
    const medalEl = $('#medal');
    const resetEl = $('#resetBtn');

    /* --- تحويل الأرقام إلى عربية-هندية --- */
    const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
    const toArabic = n => String(n).replace(/\d/g, d => AR_DIGITS[+d]);

    let score = 0;
    let best  = Number(localStorage.getItem(BEST_KEY) || 0);
    const setBest = () => { if (bestEl) bestEl.textContent = toArabic(best); };
    setBest();

    /* --- إنشاء نجمة --- */
    function spawnStar() {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'star';
      btn.setAttribute('aria-label', 'اجمع هذه النجمة');
      btn.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`;

      const size = rand(34, 62);
      btn.style.setProperty('--size', `${size}px`);
      btn.style.left = `${rand(4, 100 - size / 4.8)}%`;
      btn.style.top  = `${rand(6, 86)}%`;

      if (!reducedMotion) {
        btn.style.setProperty('--dur',   `${rand(5, 9).toFixed(2)}s`);
        btn.style.setProperty('--delay', `${rand(0, 3).toFixed(2)}s`);
        btn.style.setProperty('--spin',  `${rand(7, 14).toFixed(2)}s`);
        btn.style.setProperty('--dx',    `${rand(-70, 70).toFixed(0)}px`);
        btn.style.setProperty('--dy',    `${rand(-60, 30).toFixed(0)}px`);
        btn.style.setProperty('--dr',    `${rand(-25, 25).toFixed(0)}deg`);
      }

      btn.addEventListener('click', () => hit(btn));
      field.appendChild(btn);
    }

    /* --- نجمة انضغطت --- */
    function hit(star) {
      if (star.classList.contains('is-hit')) return;
      star.classList.add('is-hit');

      score += 1;
      if (scoreEl) {
        scoreEl.textContent = toArabic(score);
        scoreEl.classList.add('is-bump');
        setTimeout(() => scoreEl.classList.remove('is-bump'), 300);
      }

      if (score > best) {
        best = score;
        setBest();
        try { localStorage.setItem(BEST_KEY, String(best)); } catch { /* تجاهل */ }
      }

      const life = reducedMotion ? 0 : 420;
      setTimeout(() => {
        star.remove();
        if (field.children.length < ON_FIELD) spawnStar();
      }, life);

      if (score === GOAL && medalEl) {
        medalEl.hidden = false;
      }
    }

    /* --- إعادة --- */
    function reset() {
      score = 0;
      if (scoreEl) scoreEl.textContent = toArabic(0);
      field.querySelectorAll('.star').forEach(s => s.remove());
      if (medalEl) medalEl.hidden = true;
      for (let i = 0; i < ON_FIELD; i++) spawnStar();
    }

    reset();
    resetEl?.addEventListener('click', reset);
  }

  /* ---------------------------------------------------------
     5) الإقلاع
     --------------------------------------------------------- */
  function init() {
    renderDate();
    renderGreeting();
    initTheme();
    initGame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
