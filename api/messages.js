import fs from 'fs';
import path from 'path';

const LOCAL_FILE = path.join(process.cwd(), 'data', 'messages.json');
const TMP_FILE = '/tmp/heweb-messages.json';

function getFilePath() {
  if (process.env.VERCEL) return TMP_FILE;
  return LOCAL_FILE;
}

function ensureFile() {
  const file = getFilePath();
  if (fs.existsSync(file)) return;

  if (process.env.VERCEL && fs.existsSync(LOCAL_FILE)) {
    fs.copyFileSync(LOCAL_FILE, file);
    return;
  }

  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, '[]');
}

function loadMessages() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(getFilePath(), 'utf8'));
  } catch {
    return [];
  }
}

function saveMessages(messages) {
  ensureFile();
  fs.writeFileSync(getFilePath(), JSON.stringify(messages, null, 2));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  let messages = loadMessages();

  if (req.method === 'GET') {
    messages.sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.status(200).json(messages);
  }

  if (req.method === 'POST') {
    const { name, company, email, message } = req.body || {};
    if (!name || !company || !email || !message) {
      return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
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
    return res.status(201).json({ message: entry });
  }

  if (!id) return res.status(400).json({ error: 'ID em falta.' });

  const index = messages.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ error: 'Mensagem não encontrada.' });

  if (req.method === 'PATCH') {
    messages[index] = { ...messages[index], ...req.body };
    saveMessages(messages);
    return res.status(200).json({ message: messages[index] });
  }

  if (req.method === 'DELETE') {
    const removed = messages[index];
    messages.splice(index, 1);
    saveMessages(messages);
    return res.status(200).json({ message: removed });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
