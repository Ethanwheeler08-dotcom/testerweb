// Accordion
function toggleAcc(header) {
  const item = header.parentElement;
  const body = item.querySelector('.accordion__body');
  const isOpen = item.classList.contains('open');

  const parent = item.closest('.accordion');
  parent.querySelectorAll('.accordion__item').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.accordion__body').style.maxHeight = '0';
  });

  if (!isOpen) {
    item.classList.add('open');
    body.style.maxHeight = body.scrollHeight + 'px';
  }
}

// Mobile nav toggle
function toggleNav() {
  const nav = document.querySelector('.nav');
  nav.classList.toggle('open');
}

// Initial open state on load
window.addEventListener('load', () => {
  document.querySelectorAll('.accordion__item.open .accordion__body').forEach(open => {
    open.style.maxHeight = open.scrollHeight + 'px';
  });
});

// Close mobile nav on link click
document.addEventListener('click', (e) => {
  if (e.target.matches('.nav__menu a')) {
    document.querySelector('.nav')?.classList.remove('open');
  }
});

// Custom select — accessible dropdown matching site design
function initCustomSelect(root) {
  const trigger = root.querySelector('.custom-select__trigger');
  const valueEl = root.querySelector('.custom-select__value');
  const menu = root.querySelector('.custom-select__menu');
  const hidden = root.querySelector('input[type="hidden"]');
  const options = Array.from(root.querySelectorAll('.custom-select__option'));
  if (!trigger || !menu || !options.length) return;

  const placeholder = root.dataset.placeholder || '';
  let activeIndex = options.findIndex(o => o.classList.contains('selected'));
  if (activeIndex === -1) activeIndex = 0;

  function setActive(i) {
    activeIndex = (i + options.length) % options.length;
    options.forEach(o => o.classList.remove('active'));
    options[activeIndex].classList.add('active');
    options[activeIndex].focus({ preventScroll: false });
  }

  function open() {
    root.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    const selected = options.findIndex(o => o.classList.contains('selected'));
    setActive(selected >= 0 ? selected : 0);
  }

  function close() {
    root.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    options.forEach(o => o.classList.remove('active'));
  }

  function select(opt) {
    options.forEach(o => {
      o.classList.remove('selected');
      o.setAttribute('aria-selected', 'false');
    });
    opt.classList.add('selected');
    opt.setAttribute('aria-selected', 'true');
    valueEl.textContent = opt.textContent.trim();
    valueEl.classList.remove('custom-select__value--placeholder');
    if (hidden) hidden.value = opt.dataset.value ?? opt.textContent.trim();
    close();
    trigger.focus();
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    root.classList.contains('open') ? close() : open();
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });

  options.forEach((opt, i) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      select(opt);
    });
    opt.addEventListener('mouseenter', () => setActive(i));
    opt.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActive(activeIndex + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActive(activeIndex - 1);
          break;
        case 'Home':
          e.preventDefault();
          setActive(0);
          break;
        case 'End':
          e.preventDefault();
          setActive(options.length - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          select(opt);
          break;
        case 'Escape':
          e.preventDefault();
          close();
          trigger.focus();
          break;
        case 'Tab':
          close();
          break;
        default:
          if (e.key.length === 1 && /\S/.test(e.key)) {
            const match = options.findIndex(
              (o, idx) =>
                idx > activeIndex &&
                o.textContent.trim().toLowerCase().startsWith(e.key.toLowerCase())
            );
            if (match >= 0) setActive(match);
            else {
              const wrap = options.findIndex(o =>
                o.textContent.trim().toLowerCase().startsWith(e.key.toLowerCase())
              );
              if (wrap >= 0) setActive(wrap);
            }
          }
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) close();
  });

  if (!hidden) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = root.dataset.name || 'select';
    const initial = options.find(o => o.classList.contains('selected')) || options[0];
    input.value = initial.dataset.value ?? initial.textContent.trim();
    root.appendChild(input);
  }
  if (placeholder && !options.some(o => o.classList.contains('selected'))) {
    valueEl.textContent = placeholder;
    valueEl.classList.add('custom-select__value--placeholder');
  }
}

document.querySelectorAll('.custom-select').forEach(initCustomSelect);

/* ============================================
   Contact form, Formspree AJAX submission
   ============================================ */
document.querySelectorAll('form[data-formspree]').forEach((form) => {
  const wrap = form.parentElement;
  const success = wrap.querySelector('.form-success');
  const error = wrap.querySelector('.form-error');
  const btn = form.querySelector('button[type="submit"]');
  const btnDefault = btn && btn.querySelector('.contact__form-btn-default');
  const btnSending = btn && btn.querySelector('.contact__form-btn-sending');

  function setSending(state) {
    if (!btn) return;
    btn.disabled = state;
    if (btnDefault && btnSending) {
      btnDefault.hidden = state;
      btnSending.hidden = !state;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    success && (success.hidden = true);
    error && (error.hidden = true);
    setSending(true);
    try {
      const res = await fetch(form.action, {
        method: form.method || 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        form.hidden = true;
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        let detail = '';
        try {
          const data = await res.json();
          detail = (data.errors || []).map((x) => x.message).join(', ');
        } catch (_) {}
        if (error) {
          if (detail) error.querySelector('p').textContent = detail;
          error.hidden = false;
        }
      }
    } catch (err) {
      if (error) error.hidden = false;
    } finally {
      setSending(false);
    }
  });
});

/* ============================================
   Custom cursor — small trailing dot, desktop only
   ============================================ */
(function () {
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!supportsHover || reducedMotion) return;

  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);
  document.body.classList.add('has-custom-cursor');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let hasMoved = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!hasMoved) {
      hasMoved = true;
      cursor.classList.add('is-visible');
    }
  });
  window.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
  window.addEventListener('mouseenter', () => {
    if (hasMoved) cursor.classList.add('is-visible');
  });

  const EASE = 0.18;
  function tick() {
    cursorX += (mouseX - cursorX) * EASE;
    cursorY += (mouseY - cursorY) * EASE;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  const HOVER_TARGETS = [
    'a', 'button', '[role="button"]',
    '.btn', '.work-card', '.diff-card',
    '.case__link', '.why__link',
    '.custom-select__trigger', '.custom-select__option',
    '.accordion__header', '.nav__toggle'
  ].join(',');

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest && e.target.closest(HOVER_TARGETS)) {
      cursor.classList.add('is-hover');
    }
    // Adapt color on dark sections so the cursor stays visible
    const onDark = e.target.closest && e.target.closest('.section--dark, .cs-banner, footer.footer, .calendar-embed__placeholder');
    if (onDark) cursor.classList.add('is-dark');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest && e.target.closest(HOVER_TARGETS)) {
      cursor.classList.remove('is-hover');
    }
    const onDark = e.target.closest && e.target.closest('.section--dark, .cs-banner, footer.footer, .calendar-embed__placeholder');
    if (onDark) cursor.classList.remove('is-dark');
  });
})();

/* ============================================
   Lenis smooth scroll (with anchor support, mobile-safe)
   ============================================ */
(function () {
  if (typeof window.Lenis !== 'function') return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false, // native scroll on touch — keeps mobile snappy
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Route in-page anchor clicks through Lenis so they animate smoothly
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -16 });
  });

  // Expose for other modules / debugging
  window.__lenis = lenis;
})();
