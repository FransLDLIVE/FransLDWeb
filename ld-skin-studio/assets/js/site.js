// Shared LD Skin Studio behavior: mobile navigation and current year.
(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');

  function closeMenu() {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  }

  if (menuButton && menu) {
    menuButton.addEventListener('click', (event) => {
      event.stopPropagation();

      const shouldOpen = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(shouldOpen));
      menu.classList.toggle('is-open', shouldOpen);
    });

    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  document.querySelectorAll('[data-year]').forEach((year) => {
    year.textContent = new Date().getFullYear();
  });
})();
