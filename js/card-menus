
(() => {
  const toggles = Array.from(document.querySelectorAll('.nv-card-menu-toggle'));
  const closeMenus = (except) => toggles.forEach((toggle) => {
    const menu = document.getElementById(toggle.getAttribute('aria-controls'));
    if (toggle !== except && menu) { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
  });
  toggles.forEach((toggle) => toggle.addEventListener('click', (event) => {
    event.preventDefault(); event.stopPropagation();
    const menu = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!menu) return;
    const willOpen = menu.hidden;
    closeMenus(toggle);
    menu.hidden = !willOpen;
    toggle.setAttribute('aria-expanded', String(willOpen));
  }));
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nv-card-menu') && !event.target.closest('.nv-card-menu-toggle')) closeMenus(null);
    const option = event.target.closest('.nv-card-menu button');
    if (option) closeMenus(null);
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenus(null); });
})();
