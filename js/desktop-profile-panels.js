
(() => {
  const profileCard = document.querySelector('[data-purpose="user-status-card"]');
  const rulesCard = document.querySelector('[data-purpose="rules-banner"]');
  if (!profileCard || !rulesCard) return;
  const makePanel = (id, after) => {
    let panel = document.getElementById(id);
    if (!panel) { panel = document.createElement('div'); panel.id = id; panel.className = 'nv-inline-card-panel'; after.insertAdjacentElement('afterend', panel); }
    return panel;
  };
  const profilePanel = makePanel('nvProfileInlinePanel', profileCard);
  const rulesPanel = makePanel('nvRulesInlinePanel', rulesCard);
  const profileToggle = profileCard.querySelector('.nv-card-menu-toggle');
  const rulesToggle = rulesCard.querySelector('.nv-card-menu-toggle');
  const profileMenu = document.getElementById('nvProfileCardMenu');
  const rulesMenu = document.getElementById('nvRulesCardMenu');
  const profileEditor = document.getElementById('nvProfileEditor');
  const rulesViewer = document.getElementById('nvRulesViewer');
  const closePanel = (panel, toggle, overlay) => {
    panel.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.hidden = true;
  };
  const closeAll = () => {
    closePanel(profilePanel, profileToggle, profileEditor);
    closePanel(rulesPanel, rulesToggle, rulesViewer);
  };
  const expand = (kind) => {
    const isProfile = kind === 'profile';
    const panel = isProfile ? profilePanel : rulesPanel;
    const toggle = isProfile ? profileToggle : rulesToggle;
    const menu = isProfile ? profileMenu : rulesMenu;
    const overlay = isProfile ? profileEditor : rulesViewer;
    if (panel.classList.contains('is-open')) { closePanel(panel, toggle, overlay); return; }
    closeAll();
    panel.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    if (!menu || !menu.querySelector('button')) return;
    // Open the existing editor through its original handler; populate the rules panel directly.
    if (isProfile) { menu.querySelector('button').click(); } else { showRules(); }
    if (overlay) {
      panel.appendChild(overlay);
      overlay.hidden = false;
      overlay.style.display = 'block';
      const closeButton = overlay.querySelector('.nv-close');
      if (closeButton && !closeButton.dataset.inlineCloseWired) {
        closeButton.dataset.inlineCloseWired = 'true';
        closeButton.addEventListener('click', () => closePanel(panel, toggle, overlay));
      }
    }
  };
  if (profileToggle) profileToggle.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); expand('profile'); });
  if (rulesToggle) rulesToggle.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); expand('rules'); });
  document.addEventListener('click', event => {
    if (event.target.closest('#nvProfileInlinePanel') || event.target.closest('#nvRulesInlinePanel')) return;
    if (!event.target.closest('.nv-card-menu-toggle')) {
      // Keep the expanded panels open when interacting elsewhere; only the arrows collapse them.
    }
  });
  document.addEventListener('submit', event => {
    if (event.target && event.target.id === 'nvProfileForm') {
      setTimeout(() => {
        if (profileEditor && profileEditor.hidden) closePanel(profilePanel, profileToggle, profileEditor);
      }, 0);
    }
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closePanel(profilePanel, profileToggle, profileEditor);
      closePanel(rulesPanel, rulesToggle, rulesViewer);
    }
  });
})();
