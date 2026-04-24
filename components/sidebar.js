export function renderSidebar() {
  const nav = [
    { route: 'home',         label: 'Overview',     icon: gridIcon() },
    { route: 'usage',        label: 'AI Usage',     icon: chartIcon() },
    { route: 'certificates', label: 'Certificates', icon: certIcon() },
    { route: 'projects',     label: 'Projects',     icon: codeIcon() },
  ];

  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-logo">Personal <span>OS</span></div>
    <nav>
      ${nav.map(n => `
        <a class="nav-item" data-route="${n.route}" href="#${n.route}">
          ${n.icon}
          <span>${n.label}</span>
        </a>
      `).join('')}
    </nav>
  `;
}

function gridIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>`;
}
function chartIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>`;
}
function certIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>`;
}
function codeIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>`;
}
