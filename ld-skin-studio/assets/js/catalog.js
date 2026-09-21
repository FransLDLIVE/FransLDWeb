// LD Skin Studio catalog page.
// All four categories are browsed here, while each category keeps its own data file.
(() => {
  const catalog = window.LD_CATALOG || {};
  const skinViewer = window.LDCssSkinViewer;

  const categoryLabels = {
    skins: 'Skins',
    base: 'Base',
    'skin-packs': 'Skin Packs',
    'coming-soon': 'Coming Soon'
  };

  const categoryEmptyMessages = {
    skins: 'No skins match your search.',
    base: 'No bases have been added yet.',
    'skin-packs': 'No skin packs have been added yet.',
    'coming-soon': 'Nothing has been announced here yet.'
  };

  const grid = document.querySelector('[data-catalog-grid]');
  const searchInput = document.querySelector('[data-catalog-search]');
  const count = document.querySelector('[data-catalog-count]');
  const emptyState = document.querySelector('[data-catalog-empty]');
  const categoryButtons = [...document.querySelectorAll('[data-category-filter]')];
  const modelFilterGroup = document.querySelector('[data-model-filters]');
  const modelButtons = [...document.querySelectorAll('[data-model-filter]')];

  const modal = document.querySelector('[data-skin-modal]');
  const modalTitle = document.querySelector('[data-modal-title]');
  const modalDescription = document.querySelector('[data-modal-description]');
  const modalViewerHost = document.querySelector('[data-modal-viewer]');
  const modalRaw = document.querySelector('[data-modal-raw]');
  let modalDownload = document.querySelector('[data-modal-download]');
  const modalModel = document.querySelector('[data-modal-model]');
  const modalCloseButtons = [...document.querySelectorAll('[data-modal-close]')];
  const viewButtons = [...document.querySelectorAll('[data-view]')];

  let activeCategory = 'skins';
  let activeModel = 'all';
  let activeItem = null;
  let previousFocus = null;

  function safeDownloadName(name, url) {
    if (name) {
      const cleanName = String(name)
        .replace(/[\/:*?"<>|]+/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanName) return `${cleanName}.png`;
    }

    const fallback = String(url || '').split('/').pop() || 'minecraft-skin.png';
    return fallback.split('?')[0].split('#')[0] || 'minecraft-skin.png';
  }

  async function forceDownload(url, fileName, button) {
    if (!url) return;

    const originalText = button?.textContent;
    if (button) {
      button.textContent = 'Downloading...';
      button.setAttribute('aria-busy', 'true');
    }

    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Download failed with status ${response.status}`);

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');

      downloadLink.href = objectUrl;
      downloadLink.download = fileName || safeDownloadName('', url);
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      // Keep the temporary blob alive long enough for the browser to start saving it.
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch (error) {
      // Fallback for browsers that block fetch on file:// pages.
      const fallbackLink = document.createElement('a');
      fallbackLink.href = url;
      fallbackLink.download = fileName || safeDownloadName('', url);
      fallbackLink.style.display = 'none';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      fallbackLink.remove();
      console.warn('Blob download was unavailable, so the browser fallback was used.', error);
    } finally {
      if (button) {
        button.textContent = originalText || 'Download Skin';
        button.removeAttribute('aria-busy');
      }
    }
  }

  function connectDownloadButton(button, url, itemName) {
    if (!button || !url) return;

    button.dataset.downloadUrl = url;
    button.dataset.downloadName = safeDownloadName(itemName, url);
    button.setAttribute('href', url);
    button.setAttribute('download', button.dataset.downloadName);

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      forceDownload(button.dataset.downloadUrl, button.dataset.downloadName, button);
    });
  }

  function getCategoryFromHash() {
    const requested = window.location.hash.replace('#', '').trim();
    return Object.prototype.hasOwnProperty.call(categoryLabels, requested) ? requested : 'skins';
  }

  function categorySupportsSkinModels(category) {
    return category === 'skins' || category === 'base';
  }

  function updateCategoryUI() {
    categoryButtons.forEach((button) => {
      const selected = button.dataset.categoryFilter === activeCategory;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
    });

    const supportsModels = categorySupportsSkinModels(activeCategory);
    modelFilterGroup.hidden = !supportsModels;

    if (!supportsModels) {
      activeModel = 'all';
      modelButtons.forEach((button) => {
        const selected = button.dataset.modelFilter === 'all';
        button.classList.toggle('is-active', selected);
      });
    }

    if (searchInput) {
      searchInput.placeholder = `Search ${categoryLabels[activeCategory].toLowerCase()}...`;
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function createSkinCard(item) {
    const card = document.createElement('article');
    card.className = 'skin-card';

    const name = item.name || 'Minecraft Skin';
    const description = item.description || 'Minecraft skin by LD Skin Studio.';
    const modelLabel = item.model === 'slim' ? 'Slim model' : 'Classic model';
    const updated = formatDate(item.updated);

    card.innerHTML = `
      <div class="skin-preview-wrap">
        <span class="skin-badge">${item.badge || categoryLabels[activeCategory]}</span>
        <div class="skin-card-viewer" data-card-viewer aria-label="3D preview of ${name}"></div>
      </div>
      <div class="skin-card-body">
        <p class="eyebrow">${modelLabel}</p>
        <h2>${name}</h2>
        <p class="skin-description">${description}</p>
        ${updated ? `<p class="skin-date">Updated ${updated}</p>` : ''}
        <div class="skin-actions">
          <button class="button button-secondary preview-btn" type="button">Preview</button>
          <a class="button button-primary skin-download-btn" href="${item.file}" download>Download Skin</a>
        </div>
      </div>
    `;

    const viewerHost = card.querySelector('[data-card-viewer]');
    skinViewer?.mount(viewerHost, {
      skinFile: item.file,
      model: item.model || 'classic',
      zoom: 9,
      view: 'angle',
      label: `3D preview of ${name}`
    });

    card.querySelector('.preview-btn')?.addEventListener('click', () => {
      openModal(item);
    });

    connectDownloadButton(card.querySelector('.skin-download-btn'), item.file, name);

    return card;
  }

  function createSimpleCard(item) {
    const card = document.createElement('article');
    card.className = 'catalog-simple-card';

    const title = item.name || categoryLabels[activeCategory];
    const description = item.description || 'More information will be added here soon.';

    card.innerHTML = `
      <p class="eyebrow">${item.badge || categoryLabels[activeCategory]}</p>
      <h2>${title}</h2>
      <p>${description}</p>
      ${item.file ? `<a class="button button-primary skin-download-btn" href="${item.file}" download>Download Skin</a>` : ''}
    `;

    if (item.file) {
      connectDownloadButton(card.querySelector('.skin-download-btn'), item.file, title);
    }

    return card;
  }

  function createSkinPackCard(item) {
    if (item.theme !== 'ddlc' || !Array.isArray(item.previewSkins)) {
      return createSimpleCard(item);
    }

    const card = document.createElement('article');
    card.className = 'ddlc-pack-card';

    const characterNames = item.previewSkins.map((skin) => skin.name).join(' • ');

    card.innerHTML = `
      <div class="ddlc-pack-preview" data-pack-preview></div>
      <div class="ddlc-pack-copy">
        <p class="eyebrow">${item.badge || 'Skin Pack'}</p>
        <h2>${item.name || 'DDLC Skin Pack'}</h2>
        <p>${item.description || ''}</p>
        ${item.disclaimer ? `<p class="ddlc-pack-disclaimer">${item.disclaimer}</p>` : ''}
        <div class="ddlc-pack-members" aria-label="Characters included">
          ${item.previewSkins.map((skin) => `<span>${skin.name}</span>`).join('')}
        </div>
        ${item.file ? `<a class="button button-primary" href="${item.file}" download>Download DDLC Skin Pack</a>` : ''}
      </div>
    `;

    const preview = card.querySelector('[data-pack-preview]');

    item.previewSkins.forEach((skin) => {
      const character = document.createElement('div');
      character.className = 'ddlc-pack-character';
      character.innerHTML = `
        <div class="ddlc-pack-character-viewer" data-pack-character-viewer></div>
        <span>${skin.name}</span>
      `;

      preview.appendChild(character);
      const viewerHost = character.querySelector('[data-pack-character-viewer]');

      skinViewer?.mount(viewerHost, {
        skinFile: skin.file,
        model: skin.model || 'slim',
        zoom: 9,
        view: 'angle',
        label: `3D preview of ${skin.name}`
      });
    });

    return card;
  }

  function filteredItems() {
    const searchTerm = (searchInput?.value || '').trim().toLowerCase();
    const items = Array.isArray(catalog[activeCategory]) ? catalog[activeCategory] : [];

    return items.filter((item) => {
      const searchableText = [
        item.name,
        item.description,
        item.badge,
        item.model
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
      const matchesModel =
        !categorySupportsSkinModels(activeCategory) ||
        activeModel === 'all' ||
        (item.model || 'classic').toLowerCase() === activeModel;

      return matchesSearch && matchesModel;
    });
  }

  function renderCatalog() {
    if (!grid) return;

    grid.innerHTML = '';
    updateCategoryUI();

    const visibleItems = filteredItems();

    visibleItems.forEach((item) => {
      if (categorySupportsSkinModels(activeCategory)) {
        grid.appendChild(createSkinCard(item));
      } else if (activeCategory === 'skin-packs') {
        grid.appendChild(createSkinPackCard(item));
      } else {
        grid.appendChild(createSimpleCard(item));
      }
    });

    if (count) {
      count.textContent = `${visibleItems.length} item${visibleItems.length === 1 ? '' : 's'} in ${categoryLabels[activeCategory]}`;
    }

    if (emptyState) {
      emptyState.hidden = visibleItems.length !== 0;
      emptyState.textContent = categoryEmptyMessages[activeCategory];
    }
  }

  function selectCategory(category, updateHash = true) {
    if (!Object.prototype.hasOwnProperty.call(categoryLabels, category)) return;

    activeCategory = category;
    activeModel = 'all';

    modelButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.modelFilter === 'all');
    });

    if (updateHash) {
      // file:// pages can be stricter about History API calls, so keep this safe.
      try {
        history.replaceState(null, '', `#${category}`);
      } catch {
        window.location.hash = category;
      }
    }

    renderCatalog();
  }

  function openModal(item) {
    if (!modal || !categorySupportsSkinModels(activeCategory)) return;

    activeItem = item;
    previousFocus = document.activeElement;

    modalTitle.textContent = item.name || 'Minecraft Skin';
    modalDescription.textContent = item.description || '';
    modalModel.textContent = item.model === 'slim' ? 'Slim model' : 'Classic model';
    modalRaw.src = item.file;

    // Replace the modal button so an older skin's click handler cannot linger.
    const freshModalDownload = modalDownload.cloneNode(true);
    modalDownload.replaceWith(freshModalDownload);
    modalDownload = freshModalDownload;
    connectDownloadButton(modalDownload, item.file, item.name || 'Minecraft Skin');

    viewButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.view === '3d');
    });

    modalViewerHost.hidden = false;
    modalRaw.hidden = true;

    skinViewer?.mount(modalViewerHost, {
      skinFile: item.file,
      model: item.model || 'classic',
      zoom: 11,
      view: '3d',
      label: `3D preview of ${item.name || 'Minecraft skin'}`
    });

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('[data-modal-close]')?.focus();
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    activeItem = null;
    previousFocus?.focus?.();
  }

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectCategory(button.dataset.categoryFilter || 'skins');
    });
  });

  modelButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeModel = button.dataset.modelFilter || 'all';
      modelButtons.forEach((otherButton) => {
        otherButton.classList.toggle('is-active', otherButton === button);
      });
      renderCatalog();
    });
  });

  searchInput?.addEventListener('input', renderCatalog);

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!activeItem) return;

      const view = button.dataset.view || 'front';
      const showingRawImage = view === 'raw';

      viewButtons.forEach((otherButton) => {
        otherButton.classList.toggle('is-active', otherButton === button);
      });

      modalViewerHost.hidden = showingRawImage;
      modalRaw.hidden = !showingRawImage;

      if (!showingRawImage) {
        let viewer = modalViewerHost.querySelector('.ld-css-skin-viewer');

        if (!viewer) {
          viewer = skinViewer?.mount(modalViewerHost, {
            skinFile: activeItem.file,
            model: activeItem.model || 'classic',
            zoom: 11,
            view,
            label: `3D preview of ${activeItem.name || 'Minecraft skin'}`
          });
        } else {
          skinViewer?.setView(viewer, view);
        }
      }
    });
  });

  modalCloseButtons.forEach((button) => button.addEventListener('click', closeModal));

  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.classList.contains('is-open')) {
      closeModal();
    }
  });

  window.addEventListener('hashchange', () => {
    selectCategory(getCategoryFromHash(), false);
  });

  // If we reached this point, the interactive catalog is alive. Remove the static fallback.
  document.querySelector('[data-catalog-fallback]')?.remove();

  selectCategory(getCategoryFromHash(), false);
})();
