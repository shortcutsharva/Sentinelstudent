import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT ?? 3000);
const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), 'data');

function loadList(name) {
  const file = join(DATA_DIR, name);
  if (!existsSync(file)) return [];
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveList(name, items) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(join(DATA_DIR, name), `${JSON.stringify(items, null, 2)}\n`, 'utf8');
}

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 100_000) {
        reject(new Error('payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

async function parseBody(req) {
  try {
    const parsed = JSON.parse((await readBody(req)) || '{}');
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { error: 'Body must be a JSON object.' };
    }
    return { body: parsed };
  } catch (error) {
    return { error: error instanceof SyntaxError ? 'Invalid JSON body.' : 'Could not read body.' };
  }
}

function firstString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

let sequence = 0;
function nextId(prefix) {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}${sequence.toString(36)}`;
}

function normaliseSupportRequest(body) {
  const message = firstString(body.message) || firstString(body.reason);
  if (!message) return { error: 'A message is required.' };
  if (message.length > 2000) return { error: 'Message is too long (max 2000 characters).' };

  const record = {
    id: nextId('REQ-S'),
    type: firstString(body.type) || 'Support request',
    message,
    createdAt: new Date().toISOString(),
    status: 'new',
  };
  if (firstString(body.sessionId)) record.sessionId = firstString(body.sessionId);
  return { record };
}

function normaliseCheckIn(body) {
  const mood = Number(body.mood);
  if (!Number.isInteger(mood) || mood < 1 || mood > 5) {
    return { error: 'mood must be an integer from 1 to 5.' };
  }

  const influences = Array.isArray(body.influences)
    ? body.influences.filter((value) => typeof value === 'string' && value.trim()).map((value) => value.trim())
    : [];

  const record = {
    id: nextId('CHK'),
    mood,
    influences,
    note: firstString(body.note) || undefined,
    submittedAt: firstString(body.timestamp) || new Date().toISOString(),
    receivedAt: new Date().toISOString(),
  };
  return { record, suggestChat: mood <= 2 };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/support/requests') {
    send(res, 200, [...loadList('requests.json')].reverse());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/support/requests') {
    const parsed = await parseBody(req);
    if (parsed.error) {
      send(res, 400, { error: parsed.error });
      return;
    }
    const result = normaliseSupportRequest(parsed.body);
    if (result.error) {
      send(res, 400, { error: result.error });
      return;
    }
    saveList('requests.json', [...loadList('requests.json'), result.record]);
    console.log(`[requests] ${result.record.type} · ${result.record.id}`);
    send(res, 201, result.record);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/checkins') {
    send(res, 200, [...loadList('checkins.json')].reverse());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/checkins') {
    const parsed = await parseBody(req);
    if (parsed.error) {
      send(res, 400, { error: parsed.error });
      return;
    }
    const result = normaliseCheckIn(parsed.body);
    if (result.error) {
      send(res, 400, { error: result.error });
      return;
    }
    saveList('checkins.json', [...loadList('checkins.json'), result.record]);
    console.log(`[checkins] ${result.record.id} mood=${result.record.mood}`);
    send(res, 201, { suggestChat: result.suggestChat });
    return;
  }

  send(res, 404, { error: `Cannot ${req.method} ${url.pathname}` });
});

server.listen(PORT, () => {
  console.log(`Shared API listening on http://localhost:${PORT}`);
  console.log('Endpoints: GET/POST /support/requests, GET/POST /checkins');
});
