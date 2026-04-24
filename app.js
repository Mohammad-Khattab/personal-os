import { renderSidebar } from '/components/sidebar.js';

const SESSION_KEY = 'personal_os_authed';

async function checkPassword(password) {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  return res.ok;
}

function isAuthed() {
  return localStorage.getItem(SESSION_KEY) === '1';
}

function setAuthed() {
  localStorage.setItem(SESSION_KEY, '1');
}

function showApp() {
  document.getElementById('auth-gate').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}

function showAuth() {
  document.getElementById('auth-gate').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

const ROUTES = {
  '': () => import('/pages/home.js').then(m => m.render()),
  'home': () => import('/pages/home.js').then(m => m.render()),
  'usage': () => import('/pages/usage.js').then(m => m.render()),
  'certificates': () => import('/pages/certificates.js').then(m => m.render()),
  'projects': () => import('/pages/projects.js').then(m => m.render()),
};

async function navigate() {
  const hash = location.hash.replace('#', '').replace('/', '').trim();
  const route = ROUTES[hash] || ROUTES['home'];
  const content = document.getElementById('content');
  content.innerHTML = '<p style="color:var(--text-3);padding:40px">Loading...</p>';
  try {
    await route();
  } catch (e) {
    content.innerHTML = `<p style="color:var(--red);padding:40px">Error loading page: ${e.message}</p>`;
  }
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.route === (hash || 'home'));
  });
}

async function boot() {
  if (isAuthed()) {
    showApp();
    renderSidebar();
    await navigate();
  } else {
    showAuth();
    document.getElementById('auth-submit').addEventListener('click', async () => {
      const pw = document.getElementById('auth-input').value;
      const ok = await checkPassword(pw);
      if (ok) {
        setAuthed();
        showApp();
        renderSidebar();
        await navigate();
      } else {
        document.getElementById('auth-error').classList.remove('hidden');
      }
    });
    document.getElementById('auth-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('auth-submit').click();
    });
  }
}

window.addEventListener('hashchange', () => { if (isAuthed()) navigate(); });
boot();
