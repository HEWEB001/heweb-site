/**
 * Servidor local HEWEB — site estático + API de mensagens
 * Uso: node server.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 8888;
const ROOT = __dirname;
const MESSAGES_FILE = path.join(ROOT, 'data', 'messages.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function loadMessages() {
  try {
    return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveMessages(messages) {
  fs.mkdirSync(path.dirname(MESSAGES_FILE), { recursive: true });
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function serveStatic(req, res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 — Não encontrado');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

async function handleApi(req, res, url) {
  const id = url.searchParams.get('id');
  let messages = loadMessages();

  if (req.method === 'GET') {
    messages.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sendJson(res, 200, messages);
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    const { name, company, email, message } = body;
    if (!name || !company || !email || !message) {
      return sendJson(res, 400, { error: 'Campos obrigatórios em falta.' });
    }
    const entry = {
      id: generateId(),
      name: String(name).trim(),
      company: String(company).trim(),
      email: String(email).trim(),
      message: String(message).trim(),
      date: new Date().toISOString(),
      read: false
    };
    messages.unshift(entry);
    saveMessages(messages);
    return sendJson(res, 201, { message: entry });
  }

  if (!id) return sendJson(res, 400, { error: 'ID em falta.' });

  const index = messages.findIndex(m => m.id === id);
  if (index === -1) return sendJson(res, 404, { error: 'Mensagem não encontrada.' });

  if (req.method === 'PATCH') {
    const body = await readBody(req);
    messages[index] = { ...messages[index], ...body };
    saveMessages(messages);
    return sendJson(res, 200, { message: messages[index] });
  }

  if (req.method === 'DELETE') {
    const removed = messages[index];
    messages.splice(index, 1);
    saveMessages(messages);
    return sendJson(res, 200, { message: removed });
  }

  return sendJson(res, 405, { error: 'Método não permitido.' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  if (url.pathname === '/api/messages') {
    try {
      await handleApi(req, res, url);
    } catch {
      sendJson(res, 500, { error: 'Erro interno.' });
    }
    return;
  }

  let filePath = path.join(ROOT, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!path.extname(filePath)) filePath += '.html';
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('403');
  }
  serveStatic(req, res, filePath);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`HEWEB a correr em http://127.0.0.1:${PORT}`);
});
