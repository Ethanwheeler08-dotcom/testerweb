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
