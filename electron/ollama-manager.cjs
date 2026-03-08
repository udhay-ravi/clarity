// electron/ollama-manager.cjs
// Manages Ollama binary download, server lifecycle, and model pulling.
// Runs in Electron main process — uses only Node.js built-ins.

const { app } = require('electron');
const { spawn, execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ── Config ────────────────────────────────────────────────────────

const OLLAMA_VERSION = '0.6.2';
const DOWNLOAD_URL = `https://github.com/ollama/ollama/releases/download/v${OLLAMA_VERSION}/ollama-darwin`;
const OLLAMA_HOST = '127.0.0.1:11434';
const DEFAULT_MODEL = 'llama3.2:3b';

let serverProcess = null;
let currentPhase = 'idle'; // idle | downloading | starting | pulling | ready | error

// ── Paths ─────────────────────────────────────────────────────────

function getDataDir() {
  const isDev = !app.isPackaged;
  if (isDev) {
    return path.join(app.getAppPath(), '.ollama-dev');
  }
  return path.join(app.getPath('userData'), 'ollama-bin');
}

function getModelsDir() {
  const isDev = !app.isPackaged;
  if (isDev) {
    return path.join(app.getAppPath(), '.ollama-dev', 'models');
  }
  return path.join(app.getPath('userData'), 'ollama-models');
}

function getBinaryPath() {
  return path.join(getDataDir(), 'ollama');
}

function isBinaryInstalled() {
  return fs.existsSync(getBinaryPath());
}

// ── HTTP helpers ──────────────────────────────────────────────────

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }
      resolve(res);
    }).on('error', reject);
  });
}

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, resolve);
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── Download binary ───────────────────────────────────────────────

function downloadBinary(win) {
  return new Promise(async (resolve, reject) => {
    try {
      const binDir = getDataDir();
      const binPath = getBinaryPath();

      // Create directory
      fs.mkdirSync(binDir, { recursive: true });

      // If already exists, skip
      if (fs.existsSync(binPath)) {
        sendStatus(win, 'download-complete');
        return resolve();
      }

      sendStatus(win, 'downloading');
      currentPhase = 'downloading';

      const tempPath = binPath + '.tmp';

      const res = await httpGet(DOWNLOAD_URL);

      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: HTTP ${res.statusCode}`));
        return;
      }

      const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
      let downloadedBytes = 0;

      const file = fs.createWriteStream(tempPath);

      res.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        file.write(chunk);
        if (totalBytes > 0) {
          const percent = Math.round((downloadedBytes / totalBytes) * 100);
          sendProgress(win, 'ollama:download-progress', {
            percent,
            downloaded: downloadedBytes,
            total: totalBytes,
          });
        }
      });

      res.on('end', () => {
        file.end(() => {
          try {
            // Rename temp to final
            fs.renameSync(tempPath, binPath);
            // Make executable
            fs.chmodSync(binPath, 0o755);
            sendStatus(win, 'download-complete');
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });

      res.on('error', (err) => {
        file.destroy();
        try { fs.unlinkSync(tempPath); } catch {}
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// ── Start server ──────────────────────────────────────────────────

function startServer() {
  return new Promise((resolve, reject) => {
    if (serverProcess) {
      // Already running — check if it's responsive
      return pollServer(5000).then(resolve).catch(reject);
    }

    const binPath = getBinaryPath();
    if (!fs.existsSync(binPath)) {
      return reject(new Error('Ollama binary not found'));
    }

    currentPhase = 'starting';

    const modelsDir = getModelsDir();
    fs.mkdirSync(modelsDir, { recursive: true });

    serverProcess = spawn(binPath, ['serve'], {
      env: {
        ...process.env,
        OLLAMA_HOST,
        OLLAMA_MODELS: modelsDir,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    serverProcess.stdout.on('data', (data) => {
      console.log('[ollama]', data.toString().trim());
    });

    serverProcess.stderr.on('data', (data) => {
      console.log('[ollama]', data.toString().trim());
    });

    serverProcess.on('error', (err) => {
      console.error('[ollama] Process error:', err.message);
      serverProcess = null;
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      console.log('[ollama] Server exited with code', code);
      serverProcess = null;
    });

    // Poll until server responds (up to 15s)
    pollServer(15000)
      .then(resolve)
      .catch((err) => {
        stopServer();
        reject(err);
      });
  });
}

function pollServer(timeoutMs) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.get(`http://${OLLAMA_HOST}`, (res) => {
        if (res.statusCode === 200) {
          res.resume();
          resolve();
        } else {
          res.resume();
          retry();
        }
      });
      req.on('error', retry);
      req.setTimeout(2000, () => { req.destroy(); retry(); });
    };
    const retry = () => {
      if (Date.now() - start >= timeoutMs) {
        reject(new Error('Ollama server did not start in time'));
      } else {
        setTimeout(check, 500);
      }
    };
    check();
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (!serverProcess) return resolve();

    const proc = serverProcess;
    serverProcess = null;

    proc.on('exit', () => resolve());

    // SIGTERM first
    proc.kill('SIGTERM');

    // Force kill after 3 seconds
    setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch {}
      resolve();
    }, 3000);
  });
}

// ── Model management ──────────────────────────────────────────────

function isModelAvailable(modelName) {
  return new Promise((resolve) => {
    const req = http.get(`http://${OLLAMA_HOST}/api/tags`, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          const models = Array.isArray(data) ? data : (data.models || []);
          const found = models.some((m) => {
            const name = m.name || m.model || '';
            return name === modelName || name.startsWith(modelName + ':');
          });
          resolve(found);
        } catch {
          resolve(false);
        }
      });
    });
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => { req.destroy(); resolve(false); });
  });
}

function pullModel(modelName, win) {
  return new Promise((resolve, reject) => {
    currentPhase = 'pulling';
    sendStatus(win, 'pulling');

    const postData = JSON.stringify({ name: modelName, stream: true });

    const req = http.request({
      hostname: '127.0.0.1',
      port: 11434,
      path: '/api/pull',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let buffer = '';

      res.on('data', (chunk) => {
        buffer += chunk.toString();

        // Parse NDJSON lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const obj = JSON.parse(line);
            if (obj.total && obj.completed !== undefined) {
              const percent = Math.round((obj.completed / obj.total) * 100);
              sendProgress(win, 'ollama:pull-progress', {
                percent,
                status: obj.status || 'downloading',
                completed: obj.completed,
                total: obj.total,
              });
            } else if (obj.status) {
              sendProgress(win, 'ollama:pull-progress', {
                percent: -1,
                status: obj.status,
              });
            }
            // Check for error in response
            if (obj.error) {
              reject(new Error(obj.error));
              req.destroy();
              return;
            }
          } catch {}
        }
      });

      res.on('end', () => {
        // Process any remaining buffer
        if (buffer.trim()) {
          try {
            const obj = JSON.parse(buffer);
            if (obj.error) {
              reject(new Error(obj.error));
              return;
            }
          } catch {}
        }
        resolve();
      });

      res.on('error', reject);
    });

    req.on('error', reject);
    req.setTimeout(600000); // 10 minute timeout for large models
    req.write(postData);
    req.end();
  });
}

// ── IPC helpers ───────────────────────────────────────────────────

function sendProgress(win, channel, data) {
  try {
    if (win && !win.isDestroyed()) {
      win.webContents.send(channel, data);
    }
  } catch {}
}

function sendStatus(win, phase) {
  currentPhase = phase;
  try {
    if (win && !win.isDestroyed()) {
      win.webContents.send('ollama:status-change', { phase });
    }
  } catch {}
}

// ── Orchestrator ──────────────────────────────────────────────────

async function setupOllama(modelName, win) {
  try {
    // Step 1: Download binary if needed
    if (!isBinaryInstalled()) {
      await downloadBinary(win);
    }

    // Step 2: Start server
    sendStatus(win, 'starting');
    await startServer();

    // Step 3: Pull model if needed
    const model = modelName || DEFAULT_MODEL;
    const available = await isModelAvailable(model);
    if (!available) {
      await pullModel(model, win);
    }

    // Done!
    currentPhase = 'ready';
    sendStatus(win, 'ready');
    return { success: true };
  } catch (err) {
    currentPhase = 'error';
    sendStatus(win, 'error');
    console.error('[ollama] Setup failed:', err.message);
    return { success: false, error: err.message };
  }
}

async function autoStart() {
  try {
    if (!isBinaryInstalled()) return false;

    // Check if something is already serving on the port
    const alreadyRunning = await pollServer(2000).then(() => true).catch(() => false);
    if (alreadyRunning) {
      currentPhase = 'ready';
      return true;
    }

    await startServer();
    currentPhase = 'ready';
    return true;
  } catch (err) {
    console.warn('[ollama] Auto-start failed:', err.message);
    return false;
  }
}

function cleanup() {
  return stopServer();
}

function getStatus() {
  return {
    phase: currentPhase,
    binaryInstalled: isBinaryInstalled(),
    serverRunning: serverProcess !== null,
  };
}

// ── Exports ───────────────────────────────────────────────────────

module.exports = {
  setupOllama,
  autoStart,
  cleanup,
  getStatus,
  stopServer,
};
