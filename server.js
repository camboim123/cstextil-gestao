const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// ── BANCO DE DADOS ────────────────────────────────────────────
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch(e) {}
  return { pedidos: [], clientes: [] };
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Inicializa banco se vazio
let db = loadDB();
if (!db.pedidos) db.pedidos = [];
if (!db.clientes) db.clientes = [];
if (!db.clientes.length) {
  db.clientes = [
    {id:1,nome:"Cliente Exemplo",tel:"(11) 99999-0000",obs:"",criado:"2026-04-01"}
  ];
  saveDB(db);
}

// ── MIME TYPES ────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.json': 'application/json',
  '.ico':  'image/x-icon',
};

// ── SERVIDOR ──────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method;

  // CORS para acesso na rede local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── API ───────────────────────────────────────────────────
  if (url.pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let parsed = {};
      try { parsed = body ? JSON.parse(body) : {}; } catch(e) {}
      db = loadDB();

      // PEDIDOS
      if (url.pathname === '/api/pedidos') {
        if (method === 'GET') {
          res.writeHead(200); res.end(JSON.stringify(db.pedidos)); return;
        }
        if (method === 'POST') {
          const maxId = db.pedidos.length ? Math.max(...db.pedidos.map(p=>p.id)) : 0;
          parsed.id = maxId + 1;
          parsed.criado = parsed.criado || new Date().toISOString().substring(0,10);
          db.pedidos.unshift(parsed);
          saveDB(db);
          res.writeHead(201); res.end(JSON.stringify(parsed)); return;
        }
      }

      if (url.pathname.match(/^\/api\/pedidos\/\d+$/)) {
        const id = parseInt(url.pathname.split('/').pop());
        if (method === 'PUT') {
          const idx = db.pedidos.findIndex(p=>p.id===id);
          if (idx >= 0) { db.pedidos[idx] = {...db.pedidos[idx], ...parsed}; saveDB(db); res.writeHead(200); res.end(JSON.stringify(db.pedidos[idx])); }
          else { res.writeHead(404); res.end(JSON.stringify({error:'não encontrado'})); }
          return;
        }
        if (method === 'DELETE') {
          db.pedidos = db.pedidos.filter(p=>p.id!==id);
          saveDB(db); res.writeHead(200); res.end(JSON.stringify({ok:true})); return;
        }
      }

      // CLIENTES
      if (url.pathname === '/api/clientes') {
        if (method === 'GET') {
          res.writeHead(200); res.end(JSON.stringify(db.clientes)); return;
        }
        if (method === 'POST') {
          const maxId = db.clientes.length ? Math.max(...db.clientes.map(c=>c.id)) : 0;
          parsed.id = maxId + 1;
          parsed.criado = parsed.criado || new Date().toISOString().substring(0,10);
          db.clientes.push(parsed);
          saveDB(db);
          res.writeHead(201); res.end(JSON.stringify(parsed)); return;
        }
      }

      if (url.pathname.match(/^\/api\/clientes\/\d+$/)) {
        const id = parseInt(url.pathname.split('/').pop());
        if (method === 'DELETE') {
          const temPedido = db.pedidos.find(p=>p.clienteId===id);
          if (temPedido) { res.writeHead(409); res.end(JSON.stringify({error:'cliente possui pedidos'})); return; }
          db.clientes = db.clientes.filter(c=>c.id!==id);
          saveDB(db); res.writeHead(200); res.end(JSON.stringify({ok:true})); return;
        }
      }

      res.writeHead(404); res.end(JSON.stringify({error:'rota não encontrada'}));
    });
    return;
  }

  // ── ARQUIVOS ESTÁTICOS ────────────────────────────────────
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = path.join(PUBLIC_DIR, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Arquivo não encontrado'); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

// ── EXIBIR IPs DA REDE ────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
  const ifaces = os.networkInterfaces();
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║        CS-TINGIMENTOS — SERVIDOR ATIVO       ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Acesse em qualquer computador da rede:      ║`);
  Object.values(ifaces).flat().filter(i => i.family==='IPv4' && !i.internal).forEach(i => {
    const url = `http://${i.address}:${PORT}`;
    const pad = ' '.repeat(Math.max(0, 44 - url.length - 2));
    console.log(`║  ${url}${pad}║`);
  });
  console.log(`║  Local: http://localhost:${PORT}                  ║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  Para encerrar: pressione CTRL + C           ║');
  console.log('╚══════════════════════════════════════════════╝\n');
});
