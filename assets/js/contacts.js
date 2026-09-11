'use strict';

(() => {
  const sidebar = document.querySelector('[data-sidebar]');
  const button = document.querySelector('[data-sidebar-btn]');

  if (!sidebar || !button) return;

  button.addEventListener('click', () => {
    const expanded = sidebar.classList.toggle('active');
    button.setAttribute('aria-expanded', String(expanded));
    button.querySelector('span').textContent = expanded ? 'Hide Contacts' : 'Show Contacts';
  });
})();
