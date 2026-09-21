// Discord order confirmation.
// The link still points to Discord directly, so it remains usable if JavaScript is disabled.
(() => {
  const orderLinks = document.querySelectorAll('[data-discord-order]');
  const modal = document.querySelector('[data-discord-modal]');
  const continueLink = document.querySelector('[data-discord-continue]');
  const closeButtons = document.querySelectorAll('[data-discord-close]');

  if (!modal || !orderLinks.length) return;

  function openModal(event) {
    event.preventDefault();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  orderLinks.forEach((link) => link.addEventListener('click', openModal));
  closeButtons.forEach((button) => button.addEventListener('click', closeModal));

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  if (continueLink) {
    continueLink.addEventListener('click', () => closeModal());
  }
})();
