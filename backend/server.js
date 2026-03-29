const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/downloads', express.static('downloads'));

// Ensure downloads dir exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

let downloadProgress = {};

app.post('/download', async (req, res) => {
  const { url, directDownload } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  const id = Date.now().toString();
  downloadProgress[id] = { id, status: 'starting', progress: 0, directDownload: directDownload || false };

  io.emit('download_update', downloadProgress[id]);

  const outputPath = path.join(downloadsDir, `${id}.%(ext)s`);
  const cmd = `yt-dlp -f "best[height<=720]" --no-warnings --restrict-filenames -o "${outputPath}" "${url}"`;

  const child = exec(cmd);

  child.stderr.on('data', (data) => {
    const progressStr = data.toString();
    const match = progressStr.match(/\[download\]\s*(\d+(?:\.\d+)?%)/);
    if (match) {
      const percent = parseFloat(match[1]);
      downloadProgress[id].progress = percent / 100;
      downloadProgress[id].status = 'downloading';
      io.emit('download_update', downloadProgress[id]);
    }
  });

  child.on('close', (code) => {
    if (code === 0) {
      const files = fs.readdirSync(downloadsDir).filter(f => f.startsWith(id));
      if (files.length > 0) {
        const filePath = path.join(downloadsDir, files[0]);
        downloadProgress[id].status = 'complete';
        downloadProgress[id].fileName = files[0];
        downloadProgress[id].size = fs.statSync(filePath).size;
        downloadProgress[id].file = `/downloads/${files[0]}`;
        
        if (downloadProgress[id].directDownload) {
          res.download(filePath, files[0], (err) => {
            if (err) {
              downloadProgress[id].status = 'error';
              downloadProgress[id].error = err.message;
            }
            delete downloadProgress[id];
          });
          return;
        }
      }
    } else {
      downloadProgress[id].status = 'error';
      downloadProgress[id].error = `Exit code ${code}`;
    }
    io.emit('download_update', downloadProgress[id]);
    res.json(downloadProgress[id]);
  });

  // Timeout
  setTimeout(() => {
    if (child.killed) return;
    child.kill();
    downloadProgress[id].status = 'error';
    downloadProgress[id].error = 'Timeout (5min)';
    io.emit('download_update', downloadProgress[id]);
    res.status(408).json(downloadProgress[id]);
  }, 5 * 60 * 1000);
});

app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/status/:id', (req, res) => {
  res.json(downloadProgress[req.params.id] || { status: 'not_found' });
});

server.listen(3000, () => {
  console.log('🎥 VidoSaver ready!');
  console.log('🌐 App: http://localhost:3000/');
  console.log('📱 Phone: http://your-ip:3000/');
  console.log('📂 Downloads in backend/downloads/');
});

