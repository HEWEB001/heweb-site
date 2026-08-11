/**
 * HEWEB — Painel privado de mensagens
 */
(function () {
  'use strict';

  const loginView = document.getElementById('loginView');
  const adminView = document.getElementById('adminView');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const messagesList = document.getElementById('messagesList');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const filterSelect = document.getElementById('filterSelect');
  const statTotal = document.getElementById('statTotal');
  const statUnread = document.getElementById('statUnread');
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  const deleteReadBtn = document.getElementById('deleteReadBtn');

  let allMessages = [];

  function formatDate(iso) {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(iso));
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getFilteredMessages() {
    const query = searchInput?.value.trim().toLowerCase() || '';
    const filter = filterSelect?.value || 'all';

    return allMessages.filter(msg => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'unread' && !msg.read) ||
        (filter === 'read' && msg.read);

      const matchesQuery = !query || [
        msg.name,
        msg.company,
        msg.email,
        msg.message
      ].some(field => field.toLowerCase().includes(query));

      return matchesFilter && matchesQuery;
    });
  }

  function updateStats() {
    const unread = allMessages.filter(m => !m.read).length;
    if (statTotal) statTotal.textContent = allMessages.length;
    if (statUnread) statUnread.textContent = unread;
  }

  function renderMessages() {
    const filtered = getFilteredMessages();
    updateStats();

    if (!messagesList || !emptyState) return;

    if (filtered.length === 0) {
      messagesList.innerHTML = '';
      emptyState.hidden = allMessages.length > 0;
      emptyState.textContent = allMessages.length > 0
        ? 'Nenhuma mensagem corresponde à pesquisa.'
        : 'Ainda não existem mensagens de contacto.';
      return;
    }

    emptyState.hidden = true;
    messagesList.innerHTML = filtered.map(msg => `
      <article class="message-card ${msg.read ? 'read' : 'unread'}" data-id="${msg.id}">
        <div class="message-header">
          <div class="message-meta">
            <h3>${escapeHtml(msg.name)}</h3>
            <span class="message-company">${escapeHtml(msg.company)}</span>
            <a href="mailto:${escapeHtml(msg.email)}" class="message-email">${escapeHtml(msg.email)}</a>
            <time class="message-date">${formatDate(msg.date)}</time>
          </div>
          <span class="message-status ${msg.read ? 'status-read' : 'status-unread'}">
            ${msg.read ? 'Lida' : 'Nova'}
          </span>
        </div>
        <p class="message-body">${escapeHtml(msg.message)}</p>
        <div class="message-actions">
          <button type="button" class="btn btn-sm btn-outline" data-action="toggle-read" data-id="${msg.id}">
            ${msg.read ? 'Marcar como não lida' : 'Marcar como lida'}
          </button>
          <a href="mailto:${escapeHtml(msg.email)}?subject=Re: Contacto HEWEB — ${encodeURIComponent(msg.company)}" class="btn btn-sm btn-outline">Responder</a>
          <button type="button" class="btn btn-sm btn-danger" data-action="delete" data-id="${msg.id}">Excluir</button>
        </div>
      </article>
    `).join('');
  }

  async function loadMessages() {
    allMessages = await HEWEBMessages.getAll();
    renderMessages();
  }

  function showLogin() {
    loginView?.removeAttribute('hidden');
    adminView?.setAttribute('hidden', '');
  }

  function showAdmin() {
    loginView?.setAttribute('hidden', '');
    adminView?.removeAttribute('hidden');
    loadMessages();
  }

  loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value;

    if (HEWEBAuth.login(username, password)) {
      loginError.hidden = true;
      showAdmin();
    } else {
      loginError.hidden = false;
      loginError.textContent = 'Utilizador ou palavra-passe incorretos.';
    }
  });

  logoutBtn?.addEventListener('click', () => {
    HEWEBAuth.logout();
    showLogin();
    loginForm?.reset();
  });

  messagesList?.addEventListener('click', async e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const { action, id } = btn.dataset;
    if (!id) return;

    if (action === 'toggle-read') {
      const msg = allMessages.find(m => m.id === id);
      if (msg) await HEWEBMessages.update(id, { read: !msg.read });
      await loadMessages();
    }

    if (action === 'delete') {
      if (confirm('Tem a certeza que deseja excluir esta mensagem?')) {
        await HEWEBMessages.remove(id);
        await loadMessages();
      }
    }
  });

  searchInput?.addEventListener('input', renderMessages);
  filterSelect?.addEventListener('change', renderMessages);

  markAllReadBtn?.addEventListener('click', async () => {
    await HEWEBMessages.markAllRead();
    await loadMessages();
  });

  deleteReadBtn?.addEventListener('click', async () => {
    const readCount = allMessages.filter(m => m.read).length;
    if (!readCount) return;
    if (confirm(`Excluir ${readCount} mensagem(ns) lida(s)?`)) {
      await HEWEBMessages.removeRead();
      await loadMessages();
    }
  });

  if (HEWEBAuth.isAuthenticated()) {
    showAdmin();
  } else {
    showLogin();
  }

  setInterval(() => {
    if (HEWEBAuth.isAuthenticated() && !adminView?.hidden) {
      loadMessages();
    }
  }, 15000);
})();
