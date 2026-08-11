/**
 * HEWEB — Autenticação da área privada
 * Altere as credenciais abaixo antes de publicar.
 */
window.HEWEBAuth = (function () {
  'use strict';

  const SESSION_KEY = 'heweb_admin_session';
  const CREDENTIALS = {
    username: 'Heitor Mateus Pinheiro Freitas',
    password: 'hewebpassord123098'
  };

  function login(username, password) {
    if (username.trim() === CREDENTIALS.username && password === CREDENTIALS.password) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        user: username,
        loginAt: Date.now()
      }));
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isAuthenticated() {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (!session?.user) return false;
      const maxAge = 8 * 60 * 60 * 1000;
      return Date.now() - session.loginAt < maxAge;
    } catch {
      return false;
    }
  }

  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = 'admin.html';
      return false;
    }
    return true;
  }

  return { login, logout, isAuthenticated, requireAuth };
})();
