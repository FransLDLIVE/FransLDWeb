// LD Skin Studio adapter for Robert Koszewski's pure-CSS Minecraft skin viewer.
// The vendor library handles the 3D model itself; this file only creates the HTML
// structure and applies the selected skin texture/model/view.
(() => {
  const FACE_NAMES = ['top', 'left', 'front', 'right', 'back', 'bottom'];
  const BODY_PARTS = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];

  function createFaces() {
    const fragment = document.createDocumentFragment();

    FACE_NAMES.forEach((faceName) => {
      const face = document.createElement('div');
      face.className = faceName;
      fragment.appendChild(face);
    });

    return fragment;
  }

  function createBodyPart(partName) {
    const part = document.createElement('div');
    part.className = partName;
    part.appendChild(createFaces());

    const accessory = document.createElement('div');
    accessory.className = 'accessory';
    accessory.appendChild(createFaces());
    part.appendChild(accessory);

    return part;
  }

  function applyTexture(viewer, skinFile) {
    const texture = `url("${skinFile.replace(/"/g, '\\"')}")`;

    viewer.querySelectorAll('.front, .back, .left, .right, .top, .bottom').forEach((face) => {
      face.style.backgroundImage = texture;
    });
  }

  function setView(viewer, view = '3d') {
    const player = viewer.querySelector(':scope > .player');
    if (!player) return;

    viewer.classList.toggle('spin', view === '3d');

    if (view === 'front') {
      player.style.transform = 'rotateY(0deg)';
    } else if (view === 'back') {
      player.style.transform = 'rotateY(180deg)';
    } else if (view === 'angle') {
      player.style.transform = 'rotateX(-4deg) rotateY(-24deg)';
    } else {
      player.style.transform = '';
    }
  }

  function createViewer({
    skinFile,
    model = 'classic',
    zoom = 11,
    view = '3d',
    label = 'Minecraft skin 3D preview'
  }) {
    const viewer = document.createElement('div');
    viewer.className = `ld-css-skin-viewer mc-skin-viewer-${zoom}x`;
    viewer.setAttribute('role', 'img');
    viewer.setAttribute('aria-label', label);

    if (model === 'slim') {
      viewer.classList.add('slim');
    }

    const player = document.createElement('div');
    player.className = 'player';

    BODY_PARTS.forEach((partName) => {
      player.appendChild(createBodyPart(partName));
    });

    viewer.appendChild(player);
    applyTexture(viewer, skinFile);
    setView(viewer, view);

    return viewer;
  }

  function mount(host, options) {
    if (!host || !options?.skinFile) return null;

    host.replaceChildren();
    const viewer = createViewer(options);
    host.appendChild(viewer);
    return viewer;
  }

  window.LDCssSkinViewer = {
    createViewer,
    mount,
    setView
  };
})();
