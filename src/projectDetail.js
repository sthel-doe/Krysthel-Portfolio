const FSKPM_SLIDES = [8, 9, 10, 11, 12, 13].map((n) => `/files(fskpm)/${n}.jpg`);
const TROMBOL_SLIDES = [19, 20, 21, 22].map((n) => `/files2(trombol)/${n}.jpg`);

function qs(id) {
  return document.getElementById(id);
}

function openModal(el) {
  if (!el) return;
  el.setAttribute('aria-hidden', 'false');
  el.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeModal(el) {
  if (!el) return;
  el.setAttribute('aria-hidden', 'true');
  el.classList.remove('is-open');
  document.body.style.overflow = '';
}

function bindCarousel(modal, slides, altPrefix, sel) {
  const viewport = modal.querySelector(sel.viewport);
  const dots = [...modal.querySelectorAll(sel.dot)];
  const prev = modal.querySelector(sel.prev);
  const next = modal.querySelector(sel.next);
  const currEl = modal.querySelector(sel.curr);
  const totalEl = modal.querySelector(sel.total);
  if (!viewport || !prev || !next) return;
  if (viewport.querySelector('.carousel__track')) return;

  const len = slides.length;
  if (totalEl) totalEl.textContent = String(len);

  const track = document.createElement('div');
  track.className = 'carousel__track';

  slides.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel__slide';
    slide.style.flex = `0 0 ${100 / len}%`;
    const inner = document.createElement('div');
    inner.className = 'carousel__slide-inner';
    const img = document.createElement('img');
    img.className = 'carousel__img';
    img.src = src;
    img.alt = `${altPrefix} ${i + 1} of ${len}`;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.draggable = false;
    inner.appendChild(img);
    slide.appendChild(inner);
    track.appendChild(slide);
  });

  track.style.width = `${len * 100}%`;

  const shine = document.createElement('div');
  shine.className = 'carousel__shine';
  shine.setAttribute('aria-hidden', 'true');

  viewport.appendChild(track);
  viewport.appendChild(shine);

  let idx = 0;

  function render() {
    const pct = (idx * 100) / len;
    track.style.transform = `translate3d(-${pct}%, 0, 0)`;
    if (currEl) currEl.textContent = String(idx + 1);
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === idx);
      d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
  }

  function go(delta) {
    idx = (idx + delta + len) % len;
    render();
  }

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  dots.forEach((d, i) =>
    d.addEventListener('click', () => {
      idx = i;
      render();
    }),
  );

  let tx = null;
  viewport.addEventListener(
    'touchstart',
    (e) => {
      tx = e.touches[0].clientX;
    },
    { passive: true },
  );
  viewport.addEventListener(
    'touchend',
    (e) => {
      if (tx == null) return;
      const dx = e.changedTouches[0].clientX - tx;
      tx = null;
      if (dx > 56) go(-1);
      else if (dx < -56) go(1);
    },
    { passive: true },
  );

  function onKey(e) {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    }
  }
  window.addEventListener('keydown', onKey);

  render();
}

const modalFskpm = qs('modal-fskpm');
const modalTrombol = qs('modal-trombol');

if (modalFskpm) {
  bindCarousel(modalFskpm, FSKPM_SLIDES, 'MyFSKPM screen', {
    viewport: '.js-carousel-viewport',
    prev: '.js-carousel-prev',
    next: '.js-carousel-next',
    dot: '.js-carousel-dot',
    curr: '.js-carousel-curr',
    total: '.js-carousel-total',
  });
}

if (modalTrombol) {
  bindCarousel(modalTrombol, TROMBOL_SLIDES, 'Kampung Trombol screen', {
    viewport: '.js-carousel-viewport-trombol',
    prev: '.js-carousel-prev-trombol',
    next: '.js-carousel-next-trombol',
    dot: '.js-carousel-dot-trombol',
    curr: '.js-carousel-curr-trombol',
    total: '.js-carousel-total-trombol',
  });
}

document.querySelectorAll('[data-open-modal]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = btn.getAttribute('data-open-modal');
    if (id === 'fskpm') openModal(modalFskpm);
    if (id === 'trombol') openModal(modalTrombol);
  });
});

document.querySelectorAll('[data-close-modal]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-close-modal');
    if (id === 'fskpm') closeModal(modalFskpm);
    if (id === 'trombol') closeModal(modalTrombol);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (modalFskpm?.classList.contains('is-open')) closeModal(modalFskpm);
  if (modalTrombol?.classList.contains('is-open')) closeModal(modalTrombol);
});
