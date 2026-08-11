/**
 * HEWEB — Armazenamento de mensagens de contacto
 * Usa API serverless quando disponível; localStorage como fallback local.
 */
window.HEWEBMessages = (function () {
  'use strict';

  const STORAGE_KEY = 'heweb_messages';
  const API_BASE = '/api/messages';

  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function readLocal() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function writeLocal(messages) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }

  async function apiRequest(method, body, id) {
    const url = id ? `${API_BASE}?id=${encodeURIComponent(id)}` : API_BASE;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  }

  async function getAll() {
    try {
      const data = await apiRequest('GET');
      if (Array.isArray(data)) {
        writeLocal(data);
        return data;
      }
    } catch {
      /* fallback */
    }
    return readLocal().sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async function add(message) {
    const entry = {
      id: generateId(),
      name: message.name.trim(),
      company: message.company.trim(),
      email: message.email.trim(),
      message: message.message.trim(),
      date: new Date().toISOString(),
      read: false
    };

    try {
      const data = await apiRequest('POST', entry);
      if (data?.message) {
        const local = readLocal();
        local.unshift(data.message);
        writeLocal(local);
        return data.message;
      }
    } catch {
      /* fallback */
    }

    const local = readLocal();
    local.unshift(entry);
    writeLocal(local);
    return entry;
  }

  async function update(id, updates) {
    try {
      const data = await apiRequest('PATCH', updates, id);
      if (data?.message) {
        const local = readLocal().map(m => m.id === id ? data.message : m);
        writeLocal(local);
        return data.message;
      }
    } catch {
      /* fallback */
    }

    const local = readLocal();
    const index = local.findIndex(m => m.id === id);
    if (index === -1) return null;
    local[index] = { ...local[index], ...updates };
    writeLocal(local);
    return local[index];
  }

  async function remove(id) {
    try {
      await apiRequest('DELETE', null, id);
    } catch {
      /* fallback */
    }
    writeLocal(readLocal().filter(m => m.id !== id));
  }

  async function removeRead() {
    const all = await getAll();
    const readIds = all.filter(m => m.read).map(m => m.id);
    await Promise.all(readIds.map(id => remove(id)));
  }

  async function markAllRead() {
    const all = await getAll();
    await Promise.all(all.filter(m => !m.read).map(m => update(m.id, { read: true })));
  }

  return { getAll, add, update, remove, removeRead, markAllRead };
})();
