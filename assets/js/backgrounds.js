/* =========================================================
   Scroll-driven photographic backgrounds
   ---------------------------------------------------------
   Each <section data-scene="x"> has a matching
   <div class="bg" data-scene="x"> in .bgstage.
   - With GSAP: as a section scrolls in, its photo wipes in from the
     bottom with a feathered edge and settles from 112% to 100% scale,
     over the previous photo. Each photo drifts (parallax) while its
     section is on screen. Fully reversible when scrolling back up.
   - Without GSAP / reduced motion: a simple crossfade per section.
   Photos are loaded progressively: the first eagerly, the rest after load.
   ========================================================= */
(function () {
  'use strict';

  const stage = document.querySelector('.bgstage');
  if (!stage) return;
  const layers = Array.from(stage.querySelectorAll('.bg'));
  const byScene = new Map(layers.map((el) => [el.dataset.scene, el]));
  const sections = Array.from(document.querySelectorAll('[data-scene]')).filter((el) => !el.classList.contains('bg'));

  /* ---------- progressive loading ---------- */
  function load(layer) {
    const img = layer && layer.querySelector('img');
    if (!img || img.dataset.loaded) return;
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    if (img.dataset.src) img.src = img.dataset.src;
    img.dataset.loaded = '1';
  }
  load(layers[0]);
  const loadRest = () => layers.forEach((l, i) => setTimeout(() => load(l), i * 120));
  if (document.readyState === 'complete') loadRest();
  else window.addEventListener('load', loadRest);

  /* ---------- order layers by first appearance ---------- */
  layers.forEach((l, i) => (l.style.zIndex = i + 1));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = window.gsap && window.ScrollTrigger;

  /* ---------- fallback: crossfade ---------- */
  if (!hasGsap || reduce) {
    const show = (scene) => layers.forEach((l) => l.classList.toggle('is-active', l.dataset.scene === scene));
    show(layers[0].dataset.scene);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { load(byScene.get(e.target.dataset.scene)); show(e.target.dataset.scene); } });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach((s) => io.observe(s));
    return;
  }

  /* ---------- motion ---------- */
  // Called by main.js after all pinned sections exist, so trigger positions include pin spacing.
  window.FCM_initBackgrounds = function () {
    const { gsap, ScrollTrigger } = window;
    let first = true;
    sections.forEach((section) => {
      const layer = byScene.get(section.dataset.scene);
      if (!layer) return;
      const img = layer.querySelector('img');

      if (!first) {
        // feathered wipe-in + settle, scrubbed to scroll
        gsap.fromTo(layer,
          { '--p': 0, opacity: 0.35, scale: 1.12 },
          {
            '--p': 1, opacity: 1, scale: 1, ease: 'none',
            scrollTrigger: {
              trigger: section, start: 'top bottom', end: 'top 25%', scrub: 0.8,
              onEnter: () => load(layer),
            },
          });
      }
      first = false;

      // parallax drift while the section is in view
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    ScrollTrigger.refresh();
  };
})();
