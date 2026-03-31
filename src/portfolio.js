import { gsap } from 'gsap';
import Lenis from 'lenis';
import { TextType } from './textType.js';
import { wrapWords, addBlurWordsToTimeline } from './utils/blurText.js';

const SPLASH_TITLE = 'Krysthel Lua Peterus';

document.body.classList.add('splash-active');

const splashEl = document.getElementById('splash');
const textEl = document.getElementById('splash-text');
const barFill = document.getElementById('splash-bar-fill');

async function animateSplash() {
  if (!textEl) return;
  await document.fonts.ready;

  const eyebrowEl = document.getElementById('splash-eyebrow');
  const taglineEl = document.getElementById('splash-tagline');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const eyebrowSpans = eyebrowEl ? wrapWords(eyebrowEl, { wordClass: 'splash__eyebrow-word' }) : [];
  textEl.textContent = SPLASH_TITLE;
  const titleSpans = wrapWords(textEl, {
    wordClass: 'splash__name-word',
    modifiersByIndex: [
      'splash__name-word--accent',
      'splash__name-word--mid',
      'splash__name-word--trail',
    ],
  });
  const taglineSpans = taglineEl ? wrapWords(taglineEl, { wordClass: 'splash__tag-word' }) : [];

  const allSpans = [...eyebrowSpans, ...titleSpans, ...taglineSpans];

  if (reduceMotion) {
    gsap.set(allSpans, { opacity: 0, y: 8, filter: 'none' });
    if (barFill) {
      barFill.style.transition = 'width 0.9s linear';
      requestAnimationFrame(() => {
        barFill.style.width = '100%';
      });
    }
    await new Promise((resolve) => {
      gsap.to(allSpans, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.035,
        ease: 'power2.out',
        onComplete: resolve,
      });
    });
    return;
  }

  const tl = gsap.timeline();

  addBlurWordsToTimeline(tl, eyebrowSpans, 0, {
    stagger: 0.12,
    stepDuration: 0.35,
    direction: 'top',
    ease: 'power2.out',
  });
  addBlurWordsToTimeline(tl, titleSpans, 0.05, {
    stagger: 0.22,
    stepDuration: 0.35,
    direction: 'top',
    ease: 'power2.out',
  });
  addBlurWordsToTimeline(tl, taglineSpans, 0.22, {
    stagger: 0.09,
    stepDuration: 0.32,
    direction: 'top',
    ease: 'power2.out',
  });

  const barDur = Math.max(tl.duration(), 1.05);
  if (barFill) {
    barFill.style.width = '0%';
    barFill.style.transition = 'none';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        barFill.style.transition = `width ${barDur}s linear`;
        barFill.style.width = '100%';
      });
    });
  }

  await new Promise((resolve) => {
    tl.eventCallback('onComplete', resolve);
  });
}

/** Brief pause after splash content, then hero + splash crossfade in sync (see --splash-fade-dur / --app-reveal-dur). */
const SPLASH_HANDOFF_MS = 220;
const SPLASH_TRANSITION_FALLBACK_MS = 1600;

function exitSplash() {
  return new Promise((resolve) => {
    if (!splashEl) {
      resolve();
      return;
    }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      splashEl.classList.add('done');
      resolve();
    };

    const startCrossfade = () => {
      document.body.classList.add('app-ready');
      requestAnimationFrame(() => {
        splashEl.classList.add('exit');
        splashEl.setAttribute('aria-hidden', 'true');
        splashEl.setAttribute('aria-busy', 'false');
        document.body.classList.remove('splash-active');
        const onTe = (e) => {
          if (e.target !== splashEl || e.propertyName !== 'opacity') return;
          splashEl.removeEventListener('transitionend', onTe);
          finish();
        };
        splashEl.addEventListener('transitionend', onTe);
        setTimeout(finish, SPLASH_TRANSITION_FALLBACK_MS);
      });
    };

    setTimeout(startCrossfade, SPLASH_HANDOFF_MS);
  });
}

function initTextRoll(titleEl) {
  if (!titleEl) return;
  const words = titleEl.querySelectorAll('.tr-word');
  const allChars = [];

  words.forEach((wordEl) => {
    const text = wordEl.textContent;
    wordEl.textContent = '';
    [...text].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'tr-char';
      span.textContent = ch;
      wordEl.appendChild(span);
      allChars.push(span);
    });
  });

  gsap.set(allChars, {
    rotateX: 90,
    y: 40,
    scale: 0.8,
    filter: 'blur(8px)',
    opacity: 0,
    transformPerspective: 600,
    transformOrigin: 'bottom center',
  });

  gsap.to(allChars, {
    rotateX: 0,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    opacity: 1,
    duration: 1.0,
    ease: 'power3.out',
    stagger: 0.04,
    force3D: true,
  });
}

function bootApp() {
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) initTextRoll(heroTitle);

  const heroTyped = document.getElementById('hero-typed');
  if (heroTyped) {
    new TextType(heroTyped, {
      texts: [
        'Research-led interfaces. Experiences that feel obvious.',
        'Evidence first. Design that respects how minds work.',
        'From insight to interface—without the noise.',
        'Clarity isn’t accidental. It’s tested.',
        'Human-centered craft, built on real data.',
      ],
      typingSpeed: 55,
      deletingSpeed: 30,
      pauseDuration: 2400,
      initialDelay: 800,
      loop: true,
      showCursor: true,
      cursorCharacter: '|',
      cursorBlinkDuration: 0.53,
    });
  }

  const staggerEls = [
    document.querySelector('.hero__label'),
    document.querySelector('.hero__typing-wrapper'),
    document.querySelector('.hero__actions'),
  ].filter(Boolean);

  gsap.fromTo(
    staggerEls,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15, delay: 0.3 },
  );

  const lenis = new Lenis({
    duration: 1.35,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    syncTouch: false,
    touchInertiaMultiplier: 30,
  });

  let scrollY = 0;
  lenis.on('scroll', ({ scroll }) => {
    scrollY = scroll;
  });

  (function raf(t) {
    lenis.raf(t);
    requestAnimationFrame(raf);
  })(performance.now());

  const heroHeadline = document.querySelector('.hero__headline');
  const heroSub = document.querySelector('.hero__sub');
  const heroActions = document.querySelector('.hero__actions');
  const heroLabel = document.querySelector('.hero__label');

  function tickDrift() {
    const d = scrollY * 0.25;
    if (heroHeadline) heroHeadline.style.transform = `translateY(${-d * 0.6}px)`;
    if (heroSub) heroSub.style.transform = `translateY(${-d * 0.45}px)`;
    if (heroActions) heroActions.style.transform = `translateY(${-d * 0.3}px)`;
    if (heroLabel) heroLabel.style.transform = `translateY(${-d * 0.2}px)`;
    requestAnimationFrame(tickDrift);
  }
  requestAnimationFrame(tickDrift);

  const mockupFrames = [...document.querySelectorAll('.mockup-frame[data-parallax]')];
  function tickMockups() {
    mockupFrames.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax, 10);
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
    requestAnimationFrame(tickMockups);
  }
  requestAnimationFrame(tickMockups);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: -56, duration: 1.4 });
    });
  });

  const obs = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          obs.unobserve(e.target);
        }
      }),
    { threshold: 0.08, rootMargin: '0px 0px -50px 0px' },
  );
  document.querySelectorAll('.reveal-fade, .reveal-slide-up').forEach((el) => obs.observe(el));

  const dockItems = document.querySelectorAll('.dock-item[href^="#"]');
  ['home', 'about', 'skills', 'projects', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean)
    .forEach((section) => {
      new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              dockItems.forEach((l) => {
                const isActive = l.getAttribute('href') === `#${e.target.id}`;
                l.classList.toggle('active', isActive);
              });
            }
          }),
        { threshold: 0.4 },
      ).observe(section);
    });

  document.querySelectorAll('.mockup-frame').forEach((frame) => {
    frame.addEventListener('mousemove', (e) => {
      const r = frame.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const py = (frame.style.transform.match(/translateY\(([^)]+)\)/) || ['', '0px'])[1];
      frame.style.transform = `translateY(${py}) perspective(1200px) rotateY(${x * 10}deg) rotateX(${-y * 7}deg)`;
    });
    frame.addEventListener('mouseleave', () => {
      frame.style.transition = 'transform .7s cubic-bezier(.25,.46,.45,.94)';
      setTimeout(() => {
        frame.style.transition = '';
      }, 750);
    });
  });

  const cObs = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const raw = el.textContent.trim();
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        const sfx = raw.replace(/[0-9.]/g, '');
        if (Number.isNaN(num)) {
          cObs.unobserve(el);
          return;
        }
        const t0 = performance.now();
        (function tick(now) {
          const p = Math.min((now - t0) / 1400, 1);
          el.textContent = `${Math.round((1 - Math.pow(1 - p, 3)) * num * 10) / 10}${sfx}`;
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
        cObs.unobserve(el);
      }),
    { threshold: 0.6 },
  );
  document.querySelectorAll('.stat__num').forEach((s) => cObs.observe(s));
}

if (splashEl && textEl) {
  animateSplash().then(exitSplash).then(bootApp);
} else {
  document.body.classList.add('app-ready');
  bootApp();
}
