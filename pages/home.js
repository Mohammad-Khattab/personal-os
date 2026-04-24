import { drawProgressRing } from '/components/progress-ring.js';

export async function render() {
  const content = document.getElementById('content');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  content.innerHTML = `
    <div class="page-header">
      <h1>${greeting}, Mohammad</h1>
      <p>Here's your overview for today</p>
    </div>
    <div class="stat-row" id="stat-row">
      <div class="stat-card"><div class="stat-label">Claude Usage</div><div class="stat-value" id="stat-claude">–</div><div class="stat-sub" id="stat-claude-sub">loading...</div></div>
      <div class="stat-card"><div class="stat-label">Figma Reset</div><div class="stat-value" id="stat-figma">–</div><div class="stat-sub">days remaining</div></div>
      <div class="stat-card"><div class="stat-label">In Progress</div><div class="stat-value" id="stat-in-progress">–</div><div class="stat-sub">certificates</div></div>
      <div class="stat-card"><div class="stat-label">Active Projects</div><div class="stat-value" id="stat-projects">–</div><div class="stat-sub">projects</div></div>
    </div>
    <div class="grid-2">
      <div>
        <div class="section-title">Upcoming Certificates</div>
        <div id="upcoming-certs"></div>
      </div>
      <div>
        <div class="section-title">In Progress</div>
        <div id="inprogress-certs"></div>
      </div>
    </div>
  `;

  const [usageRes, certsRes, projectsRes] = await Promise.all([
    fetch('/api/usage'),
    fetch('/api/certificates'),
    fetch('/api/projects')
  ]);
  const [usage, certs, projects] = await Promise.all([usageRes.json(), certsRes.json(), projectsRes.json()]);

  const claude = usage.find(u => u.service === 'claude');
  const figma = usage.find(u => u.service === 'figma');

  if (claude) {
    const pct = claude.max_value > 0 ? Math.round((claude.used_value / claude.max_value) * 100) : 0;
    document.getElementById('stat-claude').textContent = `${pct}%`;
    document.getElementById('stat-claude-sub').textContent = `${claude.used_value}/${claude.max_value} messages`;
  }
  if (figma) {
    const days = Math.max(0, Math.ceil((new Date(figma.reset_date) - new Date()) / 86400000));
    document.getElementById('stat-figma').textContent = days;
  }

  const inProgress = certs.filter(c => c.status === 'in_progress');
  const activeProjects = projects.filter(p => p.status === 'active');
  document.getElementById('stat-in-progress').textContent = inProgress.length;
  document.getElementById('stat-projects').textContent = activeProjects.length;

  const upcoming = certs
    .filter(c => c.status === 'not_started')
    .sort((a, b) => new Date(a.target_date) - new Date(b.target_date))
    .slice(0, 3);

  const upcomingEl = document.getElementById('upcoming-certs');
  if (upcoming.length === 0) {
    upcomingEl.innerHTML = `<p style="color:var(--text-3);font-size:13px">No upcoming certificates. <a href="#certificates" style="color:var(--accent)">Add one →</a></p>`;
  } else {
    upcomingEl.innerHTML = upcoming.map(c => `
      <div class="card" style="margin-bottom:12px">
        <div style="font-weight:600;font-size:14px">${c.name}</div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
          <span class="platform">${c.platform}</span>
          ${c.target_date ? `<span style="font-size:12px;color:var(--text-3)">${dateLabel(c.target_date)}</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  const inProgressEl = document.getElementById('inprogress-certs');
  if (inProgress.length === 0) {
    inProgressEl.innerHTML = `<p style="color:var(--text-3);font-size:13px">No certificates in progress.</p>`;
  } else {
    inProgressEl.innerHTML = inProgress.map(c => `
      <div class="card" style="margin-bottom:12px">
        <div style="font-weight:600;font-size:14px">${c.name}</div>
        <div style="font-size:12px;color:var(--text-3);margin:4px 0 8px">${c.platform}</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${c.progress_percent || 0}%"></div>
        </div>
        <div style="font-size:12px;color:var(--text-2);margin-top:6px">${c.progress_percent || 0}% complete</div>
      </div>
    `).join('');
  }
}

function dateLabel(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'due today';
  return `in ${diff}d`;
}
