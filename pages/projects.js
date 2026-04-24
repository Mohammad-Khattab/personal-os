import { Modal } from '/components/modal.js';

export async function render() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="page-header">
      <h1>Projects</h1>
      <p>All active and past projects</p>
    </div>
    <div class="page-actions">
      <div></div>
      <button class="btn btn-primary" id="add-project-btn">+ Add Project</button>
    </div>
    <div id="projects-grid"></div>
  `;

  await loadAndRender();
  document.getElementById('add-project-btn').addEventListener('click', openAddModal);
}

async function loadAndRender() {
  const res = await fetch('/api/projects');
  const projects = await res.json();
  renderGrid(projects);
}

function renderGrid(projects) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  if (projects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>No projects yet.</p>
        <button class="btn btn-primary" id="empty-add-btn">Add your first project</button>
      </div>
    `;
    document.getElementById('empty-add-btn')?.addEventListener('click', openAddModal);
    return;
  }

  grid.innerHTML = `<div class="grid-3">${projects.map(projectCard).join('')}</div>`;

  grid.querySelectorAll('.status-dot').forEach(dot => {
    dot.addEventListener('click', async () => {
      const id = dot.dataset.id;
      const current = dot.dataset.status;
      const next = { active: 'paused', paused: 'done', done: 'active' }[current];
      await fetch(`/api/projects?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next })
      });
      await loadAndRender();
    });
  });

  grid.querySelectorAll('.project-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      Modal.confirm({
        title: 'Delete project',
        message: `Delete "${name}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        onConfirm: async () => {
          await fetch(`/api/projects?id=${btn.dataset.id}`, { method: 'DELETE' });
          await loadAndRender();
        }
      });
    });
  });
}

function projectCard(p) {
  const tags = (p.tech_stack || []).map(t => `<span class="tag">${t}</span>`).join('');
  return `
    <div class="project-card">
      <div class="project-card-header">
        <div class="status-dot ${p.status}" data-id="${p.id}" data-status="${p.status}" title="Click to cycle status"></div>
        <div class="project-name">${p.name}</div>
        <span class="badge ${statusBadgeClass(p.status)}" style="margin-left:auto">${p.status}</span>
      </div>
      ${p.description ? `<div class="project-desc">${p.description}</div>` : ''}
      <div class="tags">${tags}</div>
      <div class="project-actions">
        <button class="btn btn-danger project-delete-btn" data-id="${p.id}" data-name="${p.name}" style="padding:5px 12px;font-size:12px">Delete</button>
      </div>
    </div>
  `;
}

function projectFormHtml(p = {}) {
  return `
    <div class="field"><label>Name</label><input type="text" id="f-name" value="${p.name || ''}" placeholder="e.g. ClinicBot"></div>
    <div class="field"><label>Status</label>
      <select id="f-status">
        <option value="active" ${p.status === 'active' ? 'selected' : ''}>Active</option>
        <option value="paused" ${p.status === 'paused' ? 'selected' : ''}>Paused</option>
        <option value="done" ${p.status === 'done' ? 'selected' : ''}>Done</option>
      </select>
    </div>
    <div class="field"><label>Description</label><input type="text" id="f-desc" value="${p.description || ''}" placeholder="One-line summary"></div>
    <div class="field"><label>Tech stack (comma-separated)</label><input type="text" id="f-stack" value="${(p.tech_stack || []).join(', ')}" placeholder="Node.js, Supabase, Vercel"></div>
  `;
}

function readForm() {
  return {
    name: document.getElementById('f-name').value.trim(),
    status: document.getElementById('f-status').value,
    description: document.getElementById('f-desc').value.trim() || null,
    tech_stack: document.getElementById('f-stack').value.split(',').map(s => s.trim()).filter(Boolean)
  };
}

function openAddModal() {
  Modal.open({
    title: 'Add Project',
    body: projectFormHtml(),
    actions: `<button class="btn btn-ghost" id="modal-cancel">Cancel</button><button class="btn btn-primary" id="modal-save">Add</button>`
  });
  document.getElementById('modal-cancel').addEventListener('click', () => Modal.close());
  document.getElementById('modal-save').addEventListener('click', async () => {
    const data = readForm();
    if (!data.name) return;
    await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    Modal.close();
    await loadAndRender();
  });
}

function statusBadgeClass(s) {
  return { active: 'badge-active', paused: 'badge-paused', done: 'badge-done-project' }[s] || 'badge-paused';
}
