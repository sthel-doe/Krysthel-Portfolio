import { gsap } from 'gsap';

/**
 * Vanilla port of the BlurText pattern (blur + opacity + y keyframes, staggered).
 * Matches motion/react-style timing: two steps of `stepDuration`, optional word stagger.
 */
export function wrapWords(el, options = {}) {
  const { wordClass = 'blur-text__word', modifiersByIndex } = options;
  if (!el) return [];
  const raw = el.textContent.trim();
  const words = raw.split(/\s+/).filter(Boolean);
  el.textContent = '';
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = wordClass;
    const extra = modifiersByIndex?.[i];
    if (extra) {
      extra.split(/\s+/).filter(Boolean).forEach((c) => span.classList.add(c));
    }
    span.textContent = w;
    el.appendChild(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode('\u00A0'));
  });
  return [...el.querySelectorAll(`.${wordClass}`)];
}

/**
 * @param {gsap.core.Timeline} tl
 * @param {Element[]} spans
 * @param {number} position - label or time on the parent timeline
 * @param {object} [opts]
 */
export function addBlurWordsToTimeline(tl, spans, position, opts = {}) {
  const {
    stagger = 0.2,
    stepDuration = 0.35,
    direction = 'top',
    ease = 'power2.out',
  } = opts;

  if (!spans.length) return;

  const fromY = direction === 'top' ? -50 : 50;
  const midY = direction === 'top' ? 5 : -5;

  gsap.set(spans, {
    opacity: 0,
    y: fromY,
    filter: 'blur(10px)',
    force3D: true,
  });

  tl.to(
    spans,
    {
      keyframes: [
        { filter: 'blur(5px)', opacity: 0.5, y: midY, duration: stepDuration, ease },
        { filter: 'blur(0px)', opacity: 1, y: 0, duration: stepDuration, ease },
      ],
      stagger,
    },
    position,
  );
}
