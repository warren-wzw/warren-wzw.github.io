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
  if (event.pointerType === 'touch' || !event.isPrimary || event.button !== 0 || drag) return;
  const { left, top } = themeToggle.getBoundingClientRect();
  suppressClick = false;
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left, top, moved: false };
  themeToggle.setPointerCapture(event.pointerId);
});

const moveDrag = (x, y) => {
  const dx = x - drag.x;
  const dy = y - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) < 6) return;
  drag.moved = true;
  suppressClick = true;
  themeToggle.classList.add('is-dragging');
  setTogglePosition(drag.left + dx, drag.top + dy);
};

themeToggle.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch' || !drag || drag.touch || event.pointerId !== drag.id) return;
  moveDrag(event.clientX, event.clientY);
});

const finishDrag = (event) => {
  if (event.pointerType === 'touch' || !drag || drag.touch || event.pointerId !== drag.id) return;
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

// Handle touch directly so mobile browsers do not take over the drag as scrolling.
themeToggle.addEventListener('touchstart', (event) => {
  if (drag || event.touches.length !== 1) return;
  const touch = event.changedTouches[0];
  const { left, top } = themeToggle.getBoundingClientRect();
  suppressClick = false;
  drag = { id: touch.identifier, x: touch.clientX, y: touch.clientY, left, top, moved: false, touch: true };
}, { passive: true });

themeToggle.addEventListener('touchmove', (event) => {
  if (!drag || !drag.touch) return;
  const touch = Array.from(event.changedTouches).find((item) => item.identifier === drag.id);
  if (!touch) return;
  if (event.cancelable) event.preventDefault();
  moveDrag(touch.clientX, touch.clientY);
}, { passive: false });

const finishTouchDrag = (event) => {
  if (!drag || !drag.touch) return;
  if (!Array.from(event.changedTouches).some((item) => item.identifier === drag.id)) return;
  if (drag.moved) {
    if (event.cancelable) event.preventDefault();
    saveTogglePosition();
  }
  drag = null;
  themeToggle.classList.remove('is-dragging');
};

themeToggle.addEventListener('touchend', finishTouchDrag, { passive: false });
themeToggle.addEventListener('touchcancel', finishTouchDrag, { passive: false });


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
