import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Cpu, Sparkles, Eye, EyeOff, RefreshCw, Loader2, ChevronDown, Ban, Check, Download, Server, Package } from 'lucide-react';
import { getProvider, setProvider, getApiKey, setApiKey, hasApiKey, checkOllama, listModels, getOllamaModel, setOllamaModel, isElectronApp, ensureOllamaReady } from '../lib/ai-provider';

export default function SettingsModal({ onClose }) {
  const [provider, setLocalProvider] = useState(getProvider());
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey());
  const [showKey, setShowKey] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState(null); // null | 'checking' | 'connected' | 'disconnected'
  const [ollamaModels, setOllamaModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(getOllamaModel());
  const apiKeyRef = useRef(null);

  // ── Electron auto-setup state ──
  const isElectron = isElectronApp();
  const [setupPhase, setSetupPhase] = useState(null); // null | 'downloading' | 'starting' | 'pulling' | 'ready' | 'error'
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [pullPercent, setPullPercent] = useState(0);
  const [pullStatus, setPullStatus] = useState('');
  const [setupError, setSetupError] = useState(null);
  const [setupRunning, setSetupRunning] = useState(false);
  const cleanupRefs = useRef([]);

  // Check Ollama on mount
  useEffect(() => {
    checkOllamaStatus();
  }, []);

  // Listen for IPC progress events in Electron
  useEffect(() => {
    if (!isElectron || !window.electronOllama) return;

    const unsubDownload = window.electronOllama.onDownloadProgress((data) => {
      setDownloadPercent(data.percent || 0);
    });
    const unsubPull = window.electronOllama.onPullProgress((data) => {
      if (data.percent >= 0) setPullPercent(data.percent);
      if (data.status) setPullStatus(data.status);
    });
    const unsubStatus = window.electronOllama.onStatusChange((data) => {
      setSetupPhase(data.phase);
    });

    cleanupRefs.current = [unsubDownload, unsubPull, unsubStatus];

    return () => {
      cleanupRefs.current.forEach((fn) => fn && fn());
      cleanupRefs.current = [];
    };
  }, [isElectron]);

  const checkOllamaStatus = async () => {
    setOllamaStatus('checking');
    const running = await checkOllama();
    if (running) {
      setOllamaStatus('connected');
      const models = await listModels();
      setOllamaModels(models);
      // Auto-select first model if the stored model isn't in the list
      if (models.length > 0) {
        const currentModel = selectedModel;
        const modelExists = models.some((m) => m.name === currentModel);
        if (!modelExists) {
          setSelectedModel(models[0].name);
        }
      }
    } else {
      setOllamaStatus('disconnected');
    }
  };

  const handleSave = useCallback(async () => {
    setProvider(provider);

    if (provider === 'ollama') {
      setOllamaModel(selectedModel);

      // In Electron mode, trigger auto-setup
      if (isElectron) {
        setSetupRunning(true);
        setSetupPhase('downloading');
        setSetupError(null);
        setDownloadPercent(0);
        setPullPercent(0);

        try {
          const result = await ensureOllamaReady(selectedModel);
          if (result && result.success === false) {
            setSetupPhase('error');
            setSetupError(result.error || 'Setup failed');
            setSetupRunning(false);
          } else {
            setSetupPhase('ready');
            setSetupRunning(false);
            // Auto-close after a short delay
            setTimeout(() => {
              onClose();
            }, 1500);
          }
        } catch (err) {
          setSetupPhase('error');
          setSetupError(err.message || 'Setup failed');
          setSetupRunning(false);
        }
        return; // Don't close immediately — wait for setup
      }
    }

    if (provider === 'claude' && apiKeyInput.trim() && apiKeyInput.trim() !== 'your_key_here') {
      setApiKey(apiKeyInput.trim());
    }
    onClose();
  }, [provider, selectedModel, apiKeyInput, isElectron, onClose]);

  const handleRetrySetup = useCallback(async () => {
    setSetupRunning(true);
    setSetupPhase('downloading');
    setSetupError(null);
    setDownloadPercent(0);
    setPullPercent(0);

    try {
      const result = await ensureOllamaReady(selectedModel);
      if (result && result.success === false) {
        setSetupPhase('error');
        setSetupError(result.error || 'Setup failed');
      } else {
        setSetupPhase('ready');
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setSetupPhase('error');
      setSetupError(err.message || 'Setup failed');
    }
    setSetupRunning(false);
  }, [selectedModel, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !setupRunning) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !setupRunning) onClose();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setupRunning]);

  // ── Phase label and icon for progress display ──
  const getPhaseInfo = () => {
    switch (setupPhase) {
      case 'downloading':
        return { label: 'Downloading Ollama...', icon: Download, percent: downloadPercent };
      case 'starting':
        return { label: 'Starting server...', icon: Server, percent: -1 };
      case 'pulling':
        return { label: `Pulling model...`, icon: Package, percent: pullPercent };
      case 'ready':
        return { label: 'All set — AI features are active', icon: Check, percent: 100 };
      case 'error':
        return { label: setupError || 'Setup failed', icon: RefreshCw, percent: 0 };
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-settings-overlay"
      onClick={handleOverlayClick}
    >
      <div className="bg-bg border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 animate-settings-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold font-[var(--font-ui)] text-text">Settings</h2>
          <button
            onClick={() => { if (!setupRunning) onClose(); }}
            className="p-1 text-ghost hover:text-text transition-colors cursor-pointer rounded-md hover:bg-sidebar-bg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="text-xs font-semibold font-[var(--font-ui)] text-ghost uppercase tracking-wider mb-3">
            AI Provider
          </div>

          {/* ── Ollama Option ── */}
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              provider === 'ollama' ? 'border-amber bg-amber-light/20' : 'border-border hover:border-amber/40'
            }`}
          >
            <input
              type="radio"
              name="provider"
              checked={provider === 'ollama'}
              onChange={() => setLocalProvider('ollama')}
              disabled={setupRunning}
              className="mt-0.5 accent-amber cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-amber" />
                <span className="text-sm font-medium font-[var(--font-ui)] text-text">Local Model (Ollama)</span>
                {!setupPhase && ollamaStatus === 'checking' && <Loader2 size={12} className="animate-spin text-ghost" />}
                {!setupPhase && ollamaStatus === 'connected' && <span className="w-2 h-2 rounded-full bg-green-500" />}
                {!setupPhase && ollamaStatus === 'disconnected' && !isElectron && <span className="w-2 h-2 rounded-full bg-red-500" />}
              </div>

              {provider === 'ollama' && (
                <div className="mt-3 space-y-2">
                  {/* ── Setup progress (Electron only) ── */}
                  {setupPhase && isElectron ? (
                    <SetupProgress
                      phaseInfo={getPhaseInfo()}
                      setupPhase={setupPhase}
                      pullStatus={pullStatus}
                      onRetry={handleRetrySetup}
                    />
                  ) : isElectron ? (
                    <>
                      {/* Electron: no manual install needed — show model selector if connected, or friendly message */}
                      {ollamaStatus === 'connected' && ollamaModels.length > 0 ? (
                        <ModelSelector
                          models={ollamaModels}
                          selectedModel={selectedModel}
                          onSelectModel={setSelectedModel}
                        />
                      ) : (
                        <p className="text-xs text-ghost font-[var(--font-ui)]">
                          Local AI will be set up automatically when you save.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Web mode: existing manual flow */}
                      {ollamaStatus === 'connected' && ollamaModels.length > 0 ? (
                        <ModelSelector
                          models={ollamaModels}
                          selectedModel={selectedModel}
                          onSelectModel={setSelectedModel}
                        />
                      ) : ollamaStatus === 'connected' ? (
                        <p className="text-xs text-ghost font-[var(--font-ui)]">
                          No models found. Run: <code className="bg-sidebar-bg px-1 rounded text-text">ollama pull llama3.2:3b</code>
                        </p>
                      ) : ollamaStatus === 'disconnected' ? (
                        <p className="text-xs text-ghost font-[var(--font-ui)]">
                          Ollama is not running.{' '}
                          <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-amber underline">
                            Install Ollama
                          </a>
                        </p>
                      ) : null}
                      <button
                        onClick={checkOllamaStatus}
                        className="flex items-center gap-1 text-[11px] font-[var(--font-ui)] text-amber hover:text-amber/80 transition-colors cursor-pointer"
                      >
                        <RefreshCw size={10} /> Refresh
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </label>

          {/* ── Claude Option ── */}
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              provider === 'claude' ? 'border-amber bg-amber-light/20' : 'border-border hover:border-amber/40'
            }`}
          >
            <input
              type="radio"
              name="provider"
              checked={provider === 'claude'}
              onChange={() => {
                setLocalProvider('claude');
                setTimeout(() => apiKeyRef.current?.focus(), 100);
              }}
              disabled={setupRunning}
              className="mt-0.5 accent-amber cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber" />
                <span className="text-sm font-medium font-[var(--font-ui)] text-text">Claude API</span>
                {hasApiKey() && <Check size={12} className="text-green-600" />}
              </div>

              {provider === 'claude' && (
                <div className="mt-3">
                  <div className="relative">
                    <input
                      ref={apiKeyRef}
                      type={showKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="sk-ant-api03-..."
                      className="w-full text-xs font-[var(--font-ui)] text-text bg-white border border-border rounded-md px-3 py-1.5 pr-8 outline-none focus:border-amber transition-colors"
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-ghost hover:text-text transition-colors cursor-pointer"
                    >
                      {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                  <p className="text-[10px] font-[var(--font-ui)] text-ghost mt-1.5">
                    Stored locally. Never sent anywhere except Anthropic.
                  </p>
                </div>
              )}
            </div>
          </label>

          {/* ── No AI Option ── */}
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              provider === 'none' ? 'border-amber bg-amber-light/20' : 'border-border hover:border-amber/40'
            }`}
          >
            <input
              type="radio"
              name="provider"
              checked={provider === 'none'}
              onChange={() => setLocalProvider('none')}
              disabled={setupRunning}
              className="mt-0.5 accent-amber cursor-pointer"
            />
            <div>
              <div className="flex items-center gap-2">
                <Ban size={14} className="text-ghost" />
                <span className="text-sm font-medium font-[var(--font-ui)] text-text">No AI</span>
              </div>
              <p className="text-xs font-[var(--font-ui)] text-ghost mt-1">
                Ghost text and Clarity Check will be disabled.
              </p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button
            onClick={() => { if (!setupRunning) onClose(); }}
            className="px-4 py-2 text-sm font-[var(--font-ui)] font-medium text-ghost hover:text-text transition-colors cursor-pointer rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={setupRunning}
            className={`px-5 py-2 text-white text-sm font-[var(--font-ui)] font-medium rounded-lg transition-colors cursor-pointer ${
              setupRunning ? 'bg-amber/50 cursor-not-allowed' : 'bg-amber hover:bg-amber/90'
            }`}
          >
            {setupRunning ? 'Setting up...' : 'Save'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes settingsOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes settingsModal {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-settings-overlay {
          animation: settingsOverlay 0.15s ease-out;
        }
        .animate-settings-modal {
          animation: settingsModal 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function ModelSelector({ models, selectedModel, onSelectModel }) {
  return (
    <div className="relative">
      <select
        value={selectedModel}
        onChange={(e) => onSelectModel(e.target.value)}
        className="w-full text-xs font-[var(--font-ui)] text-text bg-white border border-border rounded-md px-3 py-1.5 pr-7 outline-none focus:border-amber transition-colors appearance-none cursor-pointer"
      >
        {models.map((m) => (
          <option key={m.name} value={m.name}>
            {m.name} {m.size ? `(${m.size})` : ''}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ghost pointer-events-none" />
    </div>
  );
}

function SetupProgress({ phaseInfo, setupPhase, pullStatus, onRetry }) {
  if (!phaseInfo) return null;

  const { label, icon: Icon, percent } = phaseInfo;
  const isError = setupPhase === 'error';
  const isReady = setupPhase === 'ready';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {isReady ? (
          <Check size={14} className="text-green-600" />
        ) : isError ? (
          <RefreshCw size={14} className="text-red-500" />
        ) : (
          <Icon size={14} className="text-amber animate-pulse" />
        )}
        <span className={`text-xs font-[var(--font-ui)] ${isReady ? 'text-green-700' : isError ? 'text-red-600' : 'text-text'}`}>
          {label}
        </span>
      </div>

      {/* Progress bar — show for download and pull phases */}
      {(setupPhase === 'downloading' || setupPhase === 'pulling') && percent >= 0 && (
        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-amber h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      )}

      {/* Percentage + status text */}
      {setupPhase === 'downloading' && percent > 0 && (
        <p className="text-[10px] font-[var(--font-ui)] text-ghost">{percent}% downloaded</p>
      )}
      {setupPhase === 'pulling' && (
        <p className="text-[10px] font-[var(--font-ui)] text-ghost">
          {pullStatus}{percent > 0 ? ` — ${percent}%` : ''}
        </p>
      )}
      {setupPhase === 'starting' && (
        <div className="flex items-center gap-1.5">
          <Loader2 size={10} className="animate-spin text-ghost" />
          <p className="text-[10px] font-[var(--font-ui)] text-ghost">Waiting for server...</p>
        </div>
      )}

      {/* Error retry button */}
      {isError && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-[11px] font-[var(--font-ui)] text-amber hover:text-amber/80 transition-colors cursor-pointer"
        >
          <RefreshCw size={10} />
          Try again
        </button>
      )}
    </div>
  );
}
