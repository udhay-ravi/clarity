// Preload script — IPC bridge for Ollama auto-install and lifecycle.
// Exposes a safe API to the renderer via contextBridge.

const { contextBridge, ipcRenderer } = require('electron');

// ── Ollama bridge ─────────────────────────────────────────────────

contextBridge.exposeInMainWorld('electronOllama', {
  // Full setup: download binary + start server + pull model
  setup: (modelName) => ipcRenderer.invoke('ollama:setup', modelName),

  // Get current status snapshot
  getStatus: () => ipcRenderer.invoke('ollama:get-status'),

  // Silent server start (used on app launch)
  autoStart: () => ipcRenderer.invoke('ollama:auto-start'),

  // Progress listeners — return cleanup functions
  onDownloadProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('ollama:download-progress', handler);
    return () => ipcRenderer.removeListener('ollama:download-progress', handler);
  },

  onPullProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('ollama:pull-progress', handler);
    return () => ipcRenderer.removeListener('ollama:pull-progress', handler);
  },

  onStatusChange: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('ollama:status-change', handler);
    return () => ipcRenderer.removeListener('ollama:status-change', handler);
  },
});

// ── Platform flag ─────────────────────────────────────────────────

contextBridge.exposeInMainWorld('isElectron', true);
