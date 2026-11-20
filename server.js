import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadLeaderboard, addEntry, exportLeaderboard } from './src/leaderboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle CLI export flag: node server.js --export-leaderboard out.json
const args = process.argv.slice(2);
const exportIdx = args.indexOf('--export-leaderboard');
if (exportIdx !== -1) {
  const outFile = args[exportIdx + 1];
  if (!outFile) {
    console.error('Error: missing output file name for --export-leaderboard');
    process.exit(1);
  }
  try {
    exportLeaderboard(outFile);
    process.exit(0);
  } catch (err) {
    console.error('Failed to export leaderboard:', err.message);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const urlParts = req.url.split('?');
  const reqPath = urlParts[0];

  // API Routes
  if (reqPath === '/api/leaderboard') {
    if (req.method === 'GET') {
      const entries = loadLeaderboard();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ entries }));
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const data = JSON.parse(body || '{}');
          const updated = addEntry(data);
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ success: true, entries: updated }));
        } catch (err) {
          res.writeHead(400, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }
  }

  // Static File Serving
  let targetPath = reqPath === '/' ? '/index.html' : reqPath;
  const filePath = path.join(__dirname, targetPath);
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(` 🏮 Game Đảo Đèn Lồng - 3D Web UI đang chạy tại:`);
  console.log(`    http://localhost:${PORT}`);
  console.log(`=================================================\n`);
});
