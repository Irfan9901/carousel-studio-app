const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(__dirname, '..', 'data.json');

let kv;
let useKV = false;

if (process.env.KV_URL && process.env.KV_REST_API_TOKEN) {
  try {
    const { createClient } = require('@vercel/kv');
    kv = createClient({ url: process.env.KV_URL, token: process.env.KV_REST_API_TOKEN });
    useKV = true;
  } catch (e) {
    console.error('db: KV init failed:', e.message);
  }
}

let memCache = {};

function loadFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      memCache = JSON.parse(raw);
    }
  } catch {}
}

function saveToFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memCache, null, 2), 'utf-8');
  } catch {}
}

async function get(key) {
  if (useKV) return kv.get(key);
  return memCache[key] ?? null;
}

async function set(key, value) {
  if (useKV) return kv.set(key, value);
  memCache[key] = value;
  saveToFile();
}

async function del(key) {
  if (useKV) return kv.del(key);
  delete memCache[key];
  saveToFile();
}

function initLocal() {
  loadFromFile();
  return { get, set, del };
}

module.exports = { get, set, del, initLocal };
