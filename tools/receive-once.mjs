/**
 * One-shot local receiver: accepts a single POST from a browser page and
 * writes the body to a file, then exits. Used to move HoYoLAB data out of the
 * signed-in page without pasting 30 KB through the chat.
 *
 *     node tools/receive-once.mjs reference/data/hoyolab-roster.json
 *
 * Binds 127.0.0.1 only. Answers the CORS and Private Network Access preflight
 * that Chrome sends when an https page posts to localhost.
 */

import { createServer } from 'node:http';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const out = process.argv[2];
if (!out) { console.error('usage: node tools/receive-once.mjs <output.json>'); process.exit(2); }

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Private-Network': 'true',
};

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
  if (req.method !== 'POST') { res.writeHead(405, cors); res.end(); return; }
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    JSON.parse(body); // refuse to write anything that is not valid JSON
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, body);
    res.writeHead(200, { ...cors, 'Content-Type': 'text/plain' });
    res.end(`wrote ${body.length} bytes`);
    console.log(`wrote ${body.length} bytes to ${out}`);
    server.close();
    clearTimeout(timer);
  });
});

server.listen(8797, '127.0.0.1', () => console.log('listening on 127.0.0.1:8797'));
const timer = setTimeout(() => { console.error('no data within 120s'); process.exit(1); }, 120000);
