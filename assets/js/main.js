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
