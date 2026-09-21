// Show the first finished skin as a rotating 3D preview on the studio home page.
(() => {
  const host = document.getElementById('heroSkinViewer');
  const firstSkin = window.LD_CATALOG?.skins?.[0];

  if (!host || !firstSkin || !window.LDCssSkinViewer) return;

  window.LDCssSkinViewer.mount(host, {
    skinFile: firstSkin.file,
    model: firstSkin.model || 'classic',
    zoom: 11,
    view: '3d',
    label: `Rotating 3D preview of ${firstSkin.name || 'Minecraft skin'}`
  });
})();
