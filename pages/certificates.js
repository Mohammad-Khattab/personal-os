import { Modal } from '/components/modal.js';

let allCerts = [];
let activeFilter = 'all';

export async function render() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="page-header">
      <h1>Certificates</h1>
      <p>Track your learning progress and upcoming certifications</p>
    </div>
    <div class="page-actions">
      <div class="filter-bar" id="filter-bar">
        ${['all','in_progress','not_started','done'].map(f =>
          `<button class="filter-btn ${f === activeFilter ? 'active' : ''}" data-filter="${f}">
            ${filterLabel(f)}
          </button>`
        ).join('')}
      </div>
      <button class="btn btn-primary" id="add-cert-btn">+ Add Certificate</button>
    </div>
    <div id="cert-grid"></div>
  `;

  await loadAndRender();
  bindEvents();
}

async function loadAndRender() {
  const res = await fetch('/api/certificates');
  allCerts = await res.json();
  renderGrid();
}

function renderGrid() {
  const filtered = activeFilter === 'all' ? allCerts : allCerts.filter(c => c.status === activeFilter);
  const grid = document.getElementById('cert-grid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>No certificates here yet.</p>
        <button class="btn btn-primary" id="empty-add-btn">Add your first certificate</button>
      </div>
    `;
    document.getElementById('empty-add-btn')?.addEventListener('click', openAddModal);
    return;
  }

  grid.innerHTML = `<div class="grid-3">${filtered.map(certCard).join('')}</div>`;
  grid.querySelectorAll('.cert-card').forEach(card => {
    card.addEventListener('click', () => {
      const cert = allCerts.find(c => c.id === card.dataset.id);
      if (cert) openEditModal(cert);
    });
  });
  grid.querySelectorAll('.cert-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const cert = allCerts.find(c => c.id === btn.dataset.id);
      Modal.confirm({
        title: 'Delete certificate',
        message: `Delete "${cert.name}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        onConfirm: async () => {
          await fetch(`/api/certificates?id=${cert.id}`, { method: 'DELETE' });
          await loadAndRender();
        }
      });
    });
  });
}

function certCard(cert) {
  const pct = cert.progress_percent || 0;
  return `
    <div class="cert-card" data-id="${cert.id}">
      <div class="cert-card-header">
        <div>
          <div class="cert-name">${cert.name}</div>
          <div class="cert-meta">
            <span class="platform">${cert.platform}</span>
            <span class="badge ${statusBadgeClass(cert.status)}">${statusLabel(cert.status)}</span>
          </div>
        </div>
        <button class="btn btn-ghost cert-delete-btn" data-id="${cert.id}" style="padding:4px 10px;font-size:12px">×</button>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" style="width:${pct}%"></div>
      </div>
      ${cert.target_date ? `<div class="cert-date">${dateLabel(cert.target_date)}</div>` : ''}
    </div>
  `;
}

function bindEvents() {
  document.getElementById('add-cert-btn')?.addEventListener('click', openAddModal);
  document.getElementById('filter-bar')?.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === activeFilter));
    renderGrid();
  });
}

function certFormHtml(cert = {}) {
  return `
    <div class="field"><label>Name</label><input type="text" id="f-name" value="${cert.name || ''}" placeholder="e.g. IBM Data Science Professional"></div>
    <div class="field"><label>Platform</label>
      <select id="f-platform">
        ${['Coursera','IBM','Google','Microsoft','DeepLearning.AI','Other'].map(p =>
          `<option ${cert.platform === p ? 'selected' : ''}>${p}</option>`
        ).join('')}
      </select>
    </div>
    <div class="field"><label>Status</label>
      <select id="f-status">
        <option value="not_started" ${cert.status === 'not_started' ? 'selected' : ''}>Not Started</option>
        <option value="in_progress" ${cert.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
        <option value="done" ${cert.status === 'done' ? 'selected' : ''}>Done</option>
      </select>
    </div>
    <div class="field"><label>Progress (0-100)</label><input type="number" id="f-progress" value="${cert.progress_percent || 0}" min="0" max="100"></div>
    <div class="field"><label>Target date</label><input type="date" id="f-date" value="${cert.target_date || ''}"></div>
    <div class="field"><label>Notes</label><input type="text" id="f-notes" value="${cert.notes || ''}" placeholder="Optional"></div>
  `;
}

function readForm() {
  return {
    name: document.getElementById('f-name').value.trim(),
    platform: document.getElementById('f-platform').value,
    status: document.getElementById('f-status').value,
    progress_percent: parseInt(document.getElementById('f-progress').value) || 0,
    target_date: document.getElementById('f-date').value || null,
    notes: document.getElementById('f-notes').value.trim() || null,
  };
}

function openAddModal() {
  Modal.open({
    title: 'Add Certificate',
    body: certFormHtml(),
    actions: `<button class="btn btn-ghost" id="modal-cancel">Cancel</button><button class="btn btn-primary" id="modal-save">Add</button>`
  });
  document.getElementById('modal-cancel').addEventListener('click', () => Modal.close());
  document.getElementById('modal-save').addEventListener('click', async () => {
    const data = readForm();
    if (!data.name) return;
    await fetch('/api/certificates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    Modal.close();
    await loadAndRender();
  });
}

function openEditModal(cert) {
  Modal.open({
    title: 'Edit Certificate',
    body: certFormHtml(cert),
    actions: `<button class="btn btn-ghost" id="modal-cancel">Cancel</button><button class="btn btn-primary" id="modal-save">Save</button>`
  });
  document.getElementById('modal-cancel').addEventListener('click', () => Modal.close());
  document.getElementById('modal-save').addEventListener('click', async () => {
    const data = readForm();
    if (!data.name) return;
    await fetch(`/api/certificates?id=${cert.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    Modal.close();
    await loadAndRender();
  });
}

function statusBadgeClass(s) {
  return { not_started: 'badge-not-started', in_progress: 'badge-progress', done: 'badge-done' }[s] || 'badge-not-started';
}
function statusLabel(s) {
  return { not_started: 'Not Started', in_progress: 'In Progress', done: 'Done' }[s] || s;
}
function filterLabel(f) {
  return { all: 'All', not_started: 'Upcoming', in_progress: 'In Progress', done: 'Done' }[f] || f;
}
function dateLabel(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff === 0) return 'due today';
  return `due in ${diff} day${diff === 1 ? '' : 's'}`;
}
