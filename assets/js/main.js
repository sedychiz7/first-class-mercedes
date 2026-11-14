/* =========================================================
   First Class Mercedes — motion & interactions
   GSAP + ScrollTrigger + Lenis
   ========================================================= */
(function () {
  'use strict';

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const motion = hasGsap && !reduceMotion;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- text splitting (runs regardless, harmless without motion) ---------- */
  $$('.split-lines .line').forEach((line) => {
    const inner = document.createElement('span');
    inner.innerHTML = line.innerHTML;
    line.innerHTML = '';
    line.appendChild(inner);
  });

  $$('.scrub-words').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
  });

  /* ---------- mobile menu ---------- */
  const toggle = $('.nav__toggle');
  const menu = $('.menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));

  /* ---------- diagnostic screen helpers (used in both modes) ---------- */
  const typed = $('.typed');
  function typeText(done) {
    const text = typed.dataset.text;
    if (!motion) { typed.textContent = text; return; }
    let i = 0;
    const tick = () => {
      typed.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, 28 + Math.random() * 40);
      else if (done) done();
    };
    tick();
  }

  // waveform + live values, animated only while visible
  const wave = $('.wave');
  const live = {
    rpm: $('[data-live="rpm"]'),
    temp: $('[data-live="temp"]'),
    volt: $('[data-live="volt"]'),
  };
  const timeEl = $('.screen__time');
  let waveRunning = false, waveRaf = 0, waveT = 0, startTime = 0;

  function drawWave(t) {
    const pts = [];
    for (let x = 0; x <= 300; x += 4) {
      // steady signal with a glitch region → "implausible signal"
      let y = 50 + Math.sin((x + t) * 0.05) * 14 + Math.sin((x + t) * 0.13) * 5;
      const g = (x + t * 1.0) % 300;
      if (g > 180 && g < 200) y = 50 + (Math.random() - 0.5) * 80;
      pts.push(`${x},${y.toFixed(1)}`);
    }
    wave.setAttribute('d', 'M' + pts.join(' L'));
  }
  function waveLoop(now) {
    if (!waveRunning) return;
    waveT += 1.4;
    drawWave(waveT);
    if (Math.random() < 0.08) {
      live.rpm.textContent = 760 + Math.round(Math.random() * 40);
      live.volt.textContent = (13.9 + Math.random() * 0.4).toFixed(1);
    }
    if (Math.random() < 0.01) live.temp.textContent = 87 + Math.round(Math.random() * 3);
    const s = Math.floor((now - startTime) / 1000);
    timeEl.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    waveRaf = requestAnimationFrame(waveLoop);
  }
  function startWave() {
    if (waveRunning) return;
    waveRunning = true;
    if (!startTime) startTime = performance.now();
    waveRaf = requestAnimationFrame(waveLoop);
  }
  function stopWave() { waveRunning = false; cancelAnimationFrame(waveRaf); }

  /* ---------- reviews (data in assets/js/reviews.js) ---------- */
  const reviewsSection = $('.reviews');
  const reviewData = (window.FCM_REVIEWS || []).filter((r) => r && r.text && r.name);
  const reviewLinks = window.FCM_REVIEW_LINKS || {};
  const reviewsMarquee = motion && reviewData.length >= 6;

  $$('[data-review-link]').forEach((a) => {
    const url = reviewLinks[a.dataset.reviewLink];
    if (url) { a.href = url; a.hidden = false; }
    else if (a.dataset.reviewLink !== 'facebook') a.hidden = true;
  });

  function starsEl(rating) {
    const wrap = document.createElement('span');
    wrap.className = 'stars';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', `${rating.toFixed(1)} out of 5 stars`);
    for (let i = 1; i <= 5; i++) {
      const s = document.createElement('i');
      s.textContent = '★';
      if (i > Math.round(rating)) s.className = 'off';
      wrap.appendChild(s);
    }
    return wrap;
  }

  const clampRating = (r) => Math.min(5, Math.max(1, Number(r.rating) || 5));

  function reviewCard(r) {
    const el = document.createElement('article');
    el.className = 'review';
    const top = document.createElement('div');
    top.className = 'review__top';
    top.appendChild(starsEl(clampRating(r)));
    if (r.service) {
      const tag = document.createElement('span');
      tag.className = 'review__tag mono';
      tag.textContent = r.service;
      top.appendChild(tag);
    }
    const quote = document.createElement('blockquote');
    quote.textContent = r.text;
    const who = document.createElement('div');
    who.className = 'review__who';
    const avatar = document.createElement('span');
    avatar.className = 'review__avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = r.name.trim().charAt(0).toUpperCase();
    const info = document.createElement('div');
    const name = document.createElement('b');
    name.textContent = r.name;
    info.appendChild(name);
    if (r.car) {
      const car = document.createElement('span');
      car.textContent = r.car;
      info.appendChild(car);
    }
    who.append(avatar, info);
    if (r.source) {
      const src = document.createElement('span');
      src.className = 'review__src mono';
      src.textContent = 'via ' + r.source;
      who.appendChild(src);
    }
    el.append(top, quote, who);
    return el;
  }

  if (reviewData.length) {
    const empty = $('.reviews__empty');
    empty.hidden = true;
    empty.classList.remove('reveal');
    $('.reviews__summary').hidden = false;
    $('.reviews__rows').hidden = false;
    const avg = reviewData.reduce((t, r) => t + clampRating(r), 0) / reviewData.length;
    $('.reviews__avg').textContent = avg.toFixed(1);
    $('.reviews__count').textContent = reviewData.length;
    $('.reviews__summary .stars').replaceWith(starsEl(avg));

    const tracks = $$('.reviews__track');
    if (reviewsMarquee) {
      reviewData.forEach((r, i) => tracks[i % 2].appendChild(reviewCard(r)));
    } else {
      reviewsSection.classList.add('is-static');
      reviewData.forEach((r) => tracks[0].appendChild(reviewCard(r)));
    }
  } else {
    $('.reviews__summary').classList.remove('reveal');
    reviewsSection.classList.add('reviews--empty');
  }

  /* =========================================================
     NO-MOTION FALLBACK
     ========================================================= */
  let lenis = null;
  if (!motion) {
    root.classList.add('no-motion');
    $('.hscroll').classList.add('is-static');
    $$('[data-count]').forEach((el) => (el.textContent = el.dataset.count));
    $$('.step').forEach((s) => s.classList.add('is-active'));
    $$('.process__line span').forEach((s) => (s.style.transform = 'none'));
    drawWave(0);
    typeText();
    setupNavBasic();
    return;
  }

  /* =========================================================
     MOTION
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);

  // ---------- smooth scroll ----------
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  // anchor links
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      setMenu(false);
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      else window.scrollTo({ top: target === 0 ? 0 : target.offsetTop, behavior: 'smooth' });
    });
  });

  // ---------- prepare hero car ----------
  $$('.car .draw').forEach((p) => {
    const len = Math.ceil(p.getTotalLength());
    p.style.setProperty('--len', len);
  });

  // ---------- preloader → intro ----------
  const loader = $('.loader');
  const num = $('.loader__num');
  const counter = { v: 0 };

  gsap.set('.hero .split-lines .line > span', { yPercent: 110 });
  gsap.set('.nav', { yPercent: -100, autoAlpha: 0 });

  const intro = gsap.timeline({ paused: true });
  intro
    .to(loader, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' })
    .to('.hero .split-lines .line > span', { yPercent: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out' }, '-=.45')
    .to('.nav', { yPercent: 0, autoAlpha: 1, duration: 1, ease: 'expo.out' }, '<.2')
    .to('.hero .eyebrow', { autoAlpha: 1, duration: .6 }, '<')
    .to('.hero .reveal', { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: 'expo.out' }, '<.2')
    .to('.car .draw', { strokeDashoffset: 0, duration: 2.2, stagger: 0.06, ease: 'power2.inOut' }, '<-.3')
    .fromTo('.car .scan', { attr: { x: 0 }, opacity: 0 }, { attr: { x: 800 }, opacity: 1, duration: 1.8, ease: 'power1.inOut' }, '-=1.2')
    .to('.car .scan', { opacity: 0, duration: .3 })
    .to('.car .nodes circle', { opacity: 1, duration: .4, stagger: { each: 0.08, from: 'random' } }, '-=1.4')
    .from('.hero__readout span', { autoAlpha: 0, y: 10, stagger: 0.12, duration: .5 }, '-=.8')
    .add(() => { loader.style.display = 'none'; if (lenis) lenis.start(); }, 1.1);
  gsap.set('.hero .eyebrow', { autoAlpha: 0 });

  gsap.timeline()
    .to(counter, {
      v: 100, duration: 1.6, ease: 'power2.inOut',
      onUpdate: () => (num.textContent = Math.round(counter.v)),
    })
    .to('.loader__bar span', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
    .add(() => intro.play());

  // ---------- hero on scroll ----------
  gsap.to('.hero__content', {
    yPercent: -30, autoAlpha: 0.1, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__car', {
    scale: 1.12, xPercent: -6, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__glow', {
    yPercent: -40, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // ---------- nav + progress ----------
  setupNavBasic();
  gsap.to('.progress span', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });

  // ---------- marquee, speed reacts to scroll velocity ----------
  const track = $('.marquee__track');
  track.innerHTML += track.innerHTML; // duplicate for seamless loop
  const marquee = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = self.getVelocity() / 300;
      const dir = self.direction;
      gsap.to(marquee, { timeScale: dir * Math.max(1, Math.min(Math.abs(v), 6)), duration: 0.2, overwrite: true });
      gsap.to(marquee, { timeScale: dir, duration: 1.2, delay: 0.2 });
    },
  });

  // ---------- split-line headings (non-hero) ----------
  $$('.split-lines').forEach((h) => {
    if (h.closest('.hero')) return;
    gsap.from($$('.line > span', h), {
      yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: h, start: 'top 85%' },
    });
  });

  // ---------- generic reveals ----------
  $$('.reveal').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.to(el, {
      autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // ---------- clip-path media reveals ----------
  $$('.clip-reveal').forEach((el) => {
    gsap.to(el, {
      clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
    gsap.fromTo($('svg', el), { scale: 1.25 }, {
      scale: 1, duration: 1.8, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // ---------- statement: word-by-word scrub ----------
  $$('.scrub-words').forEach((el) => {
    gsap.to($$('.w', el), {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
    });
  });

  // ---------- counters ----------
  $$('[data-count]').forEach((el) => {
    const obj = { v: 0 };
    gsap.to(obj, {
      v: +el.dataset.count, duration: 2, ease: 'power3.out',
      onUpdate: () => (el.textContent = Math.round(obj.v)),
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  // ---------- side cards: list items ----------
  $$('.side').forEach((side) => {
    gsap.from($$('.ticks li', side), {
      x: -24, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: 'expo.out',
      scrollTrigger: { trigger: $('.ticks', side), start: 'top 85%' },
    });
  });

  // ---------- responsive pieces ----------
  const mm = gsap.matchMedia();

  mm.add('(min-width: 901px)', () => {
    // horizontal pinned services
    const section = $('.hscroll');
    const pin = $('.hscroll__pin');
    const inner = [$('.hscroll__intro'), $('.hscroll__track')];
    const getDist = () => {
      const total = $('.hscroll__intro').offsetWidth + $('.hscroll__track').scrollWidth;
      return Math.max(0, total - window.innerWidth);
    };
    const tween = gsap.to(inner, {
      x: () => -getDist(), ease: 'none',
      scrollTrigger: {
        trigger: section, pin, start: 'top top', end: () => '+=' + getDist(),
        scrub: 1, invalidateOnRefresh: true,
      },
    });
    $$('.card').forEach((card) => {
      gsap.from(card, {
        rotate: 4, y: 60, autoAlpha: 0.2, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 95%', end: 'left 60%', scrub: true },
      });
    });

    // process: pin + line fill
    const steps = $$('.step');
    gsap.to('.process__line span', {
      scaleX: 1, ease: 'none',
      scrollTrigger: {
        trigger: '.process', pin: '.process__pin', start: 'top top', end: '+=1400', scrub: 0.6,
        onUpdate: (self) => steps.forEach((s, i) => s.classList.toggle('is-active', self.progress >= i / steps.length + 0.02)),
      },
    });
    gsap.from(steps, {
      y: 50, autoAlpha: 0, stagger: 0.12, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.process', start: 'top 60%' },
    });
  });

  mm.add('(max-width: 900px)', () => {
    $('.hscroll').classList.add('is-static');
    ScrollTrigger.refresh();
    const steps = $$('.step');
    gsap.to('.process__line span', {
      scaleY: 1, ease: 'none',
      scrollTrigger: {
        trigger: '.process__rail', start: 'top 70%', end: 'bottom 60%', scrub: 0.4,
        onUpdate: (self) => steps.forEach((s, i) => s.classList.toggle('is-active', self.progress >= i / steps.length)),
      },
    });
    return () => $('.hscroll').classList.remove('is-static');
  });

  // ---------- diagnostics screen ----------
  gsap.from('.screen', {
    y: 80, rotateX: 18, autoAlpha: 0, transformPerspective: 1200, duration: 1.4, ease: 'expo.out',
    scrollTrigger: { trigger: '.diag__screen', start: 'top 85%' },
  });
  ScrollTrigger.create({
    trigger: '.diag__screen', start: 'top 70%', once: true,
    onEnter: () => {
      gsap.to('.unit', { opacity: 1, duration: 0.3, stagger: 0.22, ease: 'none', onComplete: () => typeText() });
    },
  });
  ScrollTrigger.create({
    trigger: '.diag__screen', start: 'top bottom', end: 'bottom top',
    onToggle: (self) => (self.isActive ? startWave() : stopWave()),
  });
  drawWave(0);
  gsap.to('.diag__screen', {
    yPercent: -8, ease: 'none',
    scrollTrigger: { trigger: '.diag', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  // ---------- team ----------
  gsap.from('.member', {
    y: 100, autoAlpha: 0, rotate: (i) => (i % 2 ? 3 : -3), duration: 1.2, stagger: 0.12, ease: 'expo.out',
    scrollTrigger: { trigger: '.team__grid', start: 'top 80%' },
  });

  // ---------- models ----------
  gsap.from('.models__list li', {
    yPercent: 60, autoAlpha: 0, duration: 1, stagger: 0.06, ease: 'expo.out',
    scrollTrigger: { trigger: '.models__list', start: 'top 80%' },
  });

  // ---------- reviews marquee ----------
  if (reviewsMarquee) {
    const cloneInto = (track, card) => {
      const k = card.cloneNode(true);
      k.setAttribute('aria-hidden', 'true');
      track.appendChild(k);
    };
    const loops = $$('.reviews__track').map((track, i) => {
      // repeat the cards until one set is wider than the screen, then clone the whole set once
      const originals = Array.from(track.children);
      let guard = 0;
      while (track.scrollWidth < window.innerWidth * 1.2 && guard++ < 10) originals.forEach((c) => cloneInto(track, c));
      Array.from(track.children).forEach((c) => cloneInto(track, c));
      const dur = track.children.length * 4.5;
      const tl = i % 2
        ? gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration: dur, ease: 'none', repeat: -1 })
        : gsap.to(track, { xPercent: -50, duration: dur, ease: 'none', repeat: -1 });
      track.parentElement.addEventListener('pointerenter', () => gsap.to(tl, { timeScale: 0, duration: 0.6, overwrite: true }));
      track.parentElement.addEventListener('pointerleave', () => gsap.to(tl, { timeScale: 1, duration: 0.6, overwrite: true }));
      return tl;
    });
    // only run while on screen
    ScrollTrigger.create({
      trigger: '.reviews', start: 'top bottom', end: 'bottom top',
      onToggle: (self) => loops.forEach((tl) => (self.isActive ? tl.play() : tl.pause())),
    });
    gsap.from('.reviews__row', {
      xPercent: (i) => (i % 2 ? -12 : 12), autoAlpha: 0, duration: 1.6, stagger: 0.15, ease: 'expo.out',
      scrollTrigger: { trigger: '.reviews__rows', start: 'top 85%' },
    });
  } else if (reviewData.length) {
    gsap.from('.reviews__track .review', {
      y: 60, autoAlpha: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.reviews__rows', start: 'top 85%' },
    });
  }
  if (reviewData.length) {
    const avgEl = $('.reviews__avg');
    const target = parseFloat(avgEl.textContent);
    const o = { v: 0 };
    gsap.to(o, {
      v: target, duration: 1.8, ease: 'power3.out',
      onUpdate: () => (avgEl.textContent = o.v.toFixed(1)),
      scrollTrigger: { trigger: '.reviews__summary', start: 'top 90%' },
    });
    gsap.from('.reviews__summary .stars i', {
      scale: 0, rotate: -90, duration: 0.6, stagger: 0.08, ease: 'back.out(3)',
      scrollTrigger: { trigger: '.reviews__summary', start: 'top 90%' },
    });
  }

  // ---------- contact ----------
  gsap.from('.cta-row', {
    x: -40, autoAlpha: 0, duration: 1, stagger: 0.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.contact__actions', start: 'top 80%' },
  });
  gsap.from('.contact__map', {
    clipPath: 'inset(0 0 100% 0 round 18px)', duration: 1.4, ease: 'expo.inOut',
    scrollTrigger: { trigger: '.contact__map', start: 'top 85%' },
  });

  // ---------- footer big type ----------
  gsap.fromTo('.footer__big', { xPercent: 10 }, {
    xPercent: -6, ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true },
  });

  // ---------- cursor + magnetic ----------
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursor = $('.cursor');
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); });
    $$('a, button').forEach((el) => {
      el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
    });

    $$('.magnetic').forEach((el) => {
      const strength = el.classList.contains('cta-row') ? 0.08 : 0.35;
      const inner = el.querySelector('span');
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: x * strength, y: y * strength, duration: 0.6, ease: 'power3.out' });
        if (inner && !el.classList.contains('cta-row')) gsap.to(inner, { x: x * 0.15, y: y * 0.15, duration: 0.6, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, .4)' });
        if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, .4)' });
      });
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());

  /* ---------- nav behaviour (both modes) ---------- */
  function setupNavBasic() {
    const nav = $('.nav');
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 40);
      nav.classList.toggle('is-hidden', y > last && y > 400 && !document.body.classList.contains('menu-open'));
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
