// Shared FransLDLIVE website behavior.
// This file handles the mobile menu, texture-pack search, and external-link warning.
document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupTexturePackSearch();
  setupExternalLinkModal();
});

function setupMobileMenu() {
  const menuButton = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');

  if (!menuButton || !menu) return;

  function closeMenu() {
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }

  menuButton.addEventListener('click', (event) => {
    event.stopPropagation();

    const menuIsOpen = menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(menuIsOpen));
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

function setupTexturePackSearch() {
  const searchInput = document.getElementById('packSearch');
  const packsGrid = document.getElementById('packsGrid');
  const emptyMessage = document.getElementById('searchEmpty');

  if (!searchInput || !packsGrid) return;

  const packCards = [...packsGrid.querySelectorAll('.pack-card')];

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    packCards.forEach((card) => {
      const searchableText = (card.dataset.search || card.textContent).toLowerCase();
      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);

      card.style.display = matchesSearch ? '' : 'none';
      if (matchesSearch) visibleCount += 1;
    });

    if (emptyMessage) {
      emptyMessage.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  });
}

function setupExternalLinkModal() {
  const modal = document.getElementById('externalModal');
  const urlText = document.getElementById('externalModalUrl');
  const cancelButton = document.getElementById('externalCancelBtn');
  const continueButton = document.getElementById('externalContinueBtn');

  if (!modal) return;

  let pendingUrl = '';
  let previousFocus = null;

  function openModal(url, sourceLink) {
    pendingUrl = url;
    previousFocus = sourceLink;

    if (urlText) urlText.textContent = pendingUrl;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    cancelButton?.focus();
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    pendingUrl = '';
    previousFocus?.focus?.();
  }

  document.querySelectorAll('a[target="_blank"][href^="http"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(link.href, link);
    });
  });

  cancelButton?.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  continueButton?.addEventListener('click', () => {
    if (pendingUrl) {
      window.open(pendingUrl, '_blank', 'noopener,noreferrer');
    }
    closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}
