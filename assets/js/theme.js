'use strict';

const themeToggle = document.querySelector('[data-theme-toggle]');
const root = document.documentElement;
const positionKey = 'theme-toggle-position';
let drag = null;
let suppressClick = false;

const setTogglePosition = (x, y) => {
  const margin = 8;
  const maxX = Math.max(0, root.clientWidth - themeToggle.offsetWidth - margin);
  const maxY = Math.max(0, root.clientHeight - themeToggle.offsetHeight - margin);
  themeToggle.style.left = `${Math.min(maxX, Math.max(Math.min(margin, maxX), x))}px`;
  themeToggle.style.top = `${Math.min(maxY, Math.max(Math.min(margin, maxY), y))}px`;
  themeToggle.style.right = 'auto';
};

const saveTogglePosition = () => {
  const { left, top } = themeToggle.getBoundingClientRect();
  try {
    localStorage.setItem(positionKey, JSON.stringify({ x: left, y: top }));
  } catch (error) {}
};

try {
  const position = JSON.parse(localStorage.getItem(positionKey));
  if (position && Number.isFinite(position.x) && Number.isFinite(position.y)) {
    setTogglePosition(position.x, position.y);
  }
} catch (error) {}

themeToggle.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0 || drag) return;
  const { left, top } = themeToggle.getBoundingClientRect();
  suppressClick = false;
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left, top, moved: false };
  themeToggle.setPointerCapture(event.pointerId);
});

themeToggle.addEventListener('pointermove', (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) < 6) return;
  drag.moved = true;
  suppressClick = true;
  themeToggle.classList.add('is-dragging');
  setTogglePosition(drag.left + dx, drag.top + dy);
});

const finishDrag = (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  if (drag.moved) saveTogglePosition();
  drag = null;
  themeToggle.classList.remove('is-dragging');
  if (themeToggle.hasPointerCapture(event.pointerId)) {
    themeToggle.releasePointerCapture(event.pointerId);
  }
};

themeToggle.addEventListener('pointerup', finishDrag);
themeToggle.addEventListener('pointercancel', finishDrag);
themeToggle.addEventListener('lostpointercapture', finishDrag);

window.addEventListener('resize', () => {
  const { left, top } = themeToggle.getBoundingClientRect();
  setTogglePosition(left, top);
});

const updateThemeToggle = () => {
  const isLight = root.dataset.theme === 'light';
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  themeToggle.title = isLight ? 'Dark mode' : 'Light mode';
};

themeToggle.addEventListener('click', (event) => {
  // Keyboard activation has detail 0 and should still work after a drag.
  if (suppressClick && event.detail !== 0) {
    suppressClick = false;
    event.preventDefault();
    return;
  }
  const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';

  if (nextTheme === 'light') {
    root.dataset.theme = 'light';
  } else {
    delete root.dataset.theme;
  }

  try {
    localStorage.setItem('theme', nextTheme);
  } catch (error) {}

  updateThemeToggle();
});

updateThemeToggle();
