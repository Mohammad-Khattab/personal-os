export const Modal = {
  open({ title, body, actions }) {
    this.close();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'active-modal';
    overlay.innerHTML = `
      <div class="modal-box">
        <h3>${title}</h3>
        <div class="modal-body">${body}</div>
        <div class="modal-actions">${actions}</div>
      </div>
    `;
    overlay.addEventListener('click', e => { if (e.target === overlay) this.close(); });
    document.body.appendChild(overlay);
  },

  confirm({ title, message, confirmLabel = 'Confirm', onConfirm }) {
    this.open({
      title,
      body: `<p style="color:var(--text-2)">${message}</p>`,
      actions: `
        <button class="btn btn-ghost" id="modal-cancel">Cancel</button>
        <button class="btn btn-danger" id="modal-confirm">${confirmLabel}</button>
      `
    });
    document.getElementById('modal-cancel').addEventListener('click', () => this.close());
    document.getElementById('modal-confirm').addEventListener('click', () => {
      this.close();
      onConfirm();
    });
  },

  close() {
    document.getElementById('active-modal')?.remove();
  }
};
