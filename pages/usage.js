import { drawProgressRing } from '/components/progress-ring.js';
import { Modal } from '/components/modal.js';

export async function render() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="page-header">
      <h1>AI Usage</h1>
      <p>Track your subscription limits and reset dates</p>
    </div>
    <div class="grid-2" id="usage-grid">
      <p style="color:var(--text-3)">Loading...</p>
    </div>
  `;

  const res = await fetch('/api/usage');
  const entries = await res.json();
  const byService = {};
  entries.forEach(e => { byService[e.service] = e; });

  document.getElementById('usage-grid').innerHTML = `
    ${usageCard(byService.claude, 'Claude', 'Weekly messages')}
    ${usageCard(byService.figma, 'Figma', 'Monthly cycle (Student plan)')}
  `;

  entries.forEach(e => {
    const canvas = document.getElementById(`ring-${e.service}`);
    if (canvas) {
      const pct = e.max_value > 0 ? Math.round((e.used_value / e.max_value) * 100) : 0;
      drawProgressRing(canvas, pct);
    }
  });

  document.querySelectorAll('.usage-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const service = btn.dataset.service;
      const entry = byService[service];
      openEditModal(entry, async updated => {
        await fetch(`/api/usage?service=${service}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        render();
      });
    });
  });
}

function daysUntil(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return 'resets today';
  return `resets in ${diff} day${diff === 1 ? '' : 's'}`;
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function usageCard(entry, name, subtitle) {
  if (!entry) return '';
  const pct = entry.max_value > 0 ? Math.round((entry.used_value / entry.max_value) * 100) : 0;
  return `
    <div class="usage-card">
      <div class="usage-card-header">
        <div>
          <div class="usage-card-title">${name}</div>
          <div class="usage-card-sub">${subtitle}</div>
        </div>
        <button class="btn btn-ghost usage-edit-btn" data-service="${entry.service}">Edit</button>
      </div>
      <div class="usage-ring-row">
        <canvas id="ring-${entry.service}" width="100" height="100"></canvas>
        <div class="usage-ring-labels">
          <div class="main-label">${pct}%</div>
          <div class="sub-label">${entry.used_value} / ${entry.max_value} used</div>
          <div class="sub-label" style="margin-top:8px;color:var(--accent)">${daysUntil(entry.reset_date)}</div>
        </div>
      </div>
      <div class="usage-updated">Updated ${timeAgo(entry.updated_at)}</div>
    </div>
  `;
}

function openEditModal(entry, onSave) {
  Modal.open({
    title: `Update ${entry.service === 'claude' ? 'Claude' : 'Figma'} Usage`,
    body: `
      <div class="field">
        <label>Used value</label>
        <input type="number" id="edit-used" value="${entry.used_value}" min="0">
      </div>
      <div class="field">
        <label>Max value (cap)</label>
        <input type="number" id="edit-max" value="${entry.max_value}" min="1">
      </div>
      <div class="field">
        <label>Next reset date</label>
        <input type="date" id="edit-reset" value="${entry.reset_date}">
      </div>
    `,
    actions: `
      <button class="btn btn-ghost" id="modal-cancel">Cancel</button>
      <button class="btn btn-primary" id="modal-save">Save</button>
    `
  });
  document.getElementById('modal-cancel').addEventListener('click', () => Modal.close());
  document.getElementById('modal-save').addEventListener('click', () => {
    const updated = {
      used_value: parseInt(document.getElementById('edit-used').value),
      max_value: parseInt(document.getElementById('edit-max').value),
      reset_date: document.getElementById('edit-reset').value
    };
    Modal.close();
    onSave(updated);
  });
}
