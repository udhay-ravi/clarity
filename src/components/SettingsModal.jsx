import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Cpu, Sparkles, Eye, EyeOff, RefreshCw, Loader2, ChevronDown, Ban, Check, Download, Server, Package, Trash2, Shield, Type, ALargeSmall, Sun, Moon, Monitor, Upload, FileText, Plus } from 'lucide-react';
import { getProvider, setProvider, getApiKey, setApiKey, hasApiKey, getOpenAIKey, setOpenAIKey, hasOpenAIKey, checkOllama, listModels, getOllamaModel, setOllamaModel, isElectronApp, ensureOllamaReady } from '../lib/ai-provider';
import { TEMPLATES } from '../lib/templates';
import {
  loadCustomTemplateIndex,
  loadCustomTemplate,
  saveCustomTemplate,
  deleteCustomTemplate,
  getCustomTemplateStorageUsage,
} from '../lib/customTemplates';

// ── Persisted editor preferences ──────────────────────────────────
const PREFS_KEY = 'clarity-editor-prefs';

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch { return {}; }
}

export function savePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function getEditorPrefs() {
  const defaults = { fontFamily: 'serif', fontSize: 'base', lineHeight: 'relaxed', theme: 'light' };
  return { ...defaults, ...loadPrefs() };
}

export default function SettingsModal({ onClose }) {
  const [tab, setTab] = useState('ai'); // 'ai' | 'editor' | 'about'
  const [provider, setLocalProvider] = useState(getProvider());
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey());
  const [openaiKeyInput, setOpenaiKeyInput] = useState(getOpenAIKey());
  const [showKey, setShowKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(getOllamaModel());
  const [keyDeleted, setKeyDeleted] = useState(false);
  const [openaiKeyDeleted, setOpenaiKeyDeleted] = useState(false);
  const apiKeyRef = useRef(null);
  const openaiKeyRef = useRef(null);

  // Editor preferences
  const [prefs, setPrefs] = useState(getEditorPrefs);

  // ── Electron auto-setup state ──
  const isElectron = isElectronApp();
  const [setupPhase, setSetupPhase] = useState(null);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [pullPercent, setPullPercent] = useState(0);
  const [pullStatus, setPullStatus] = useState('');
  const [setupError, setSetupError] = useState(null);
  const [setupRunning, setSetupRunning] = useState(false);
  const cleanupRefs = useRef([]);

  useEffect(() => { checkOllamaStatus(); }, []);

  useEffect(() => {
    if (!isElectron || !window.electronOllama) return;
    const unsubDownload = window.electronOllama.onDownloadProgress((data) => setDownloadPercent(data.percent || 0));
    const unsubPull = window.electronOllama.onPullProgress((data) => {
      if (data.percent >= 0) setPullPercent(data.percent);
      if (data.status) setPullStatus(data.status);
    });
    const unsubStatus = window.electronOllama.onStatusChange((data) => setSetupPhase(data.phase));
    cleanupRefs.current = [unsubDownload, unsubPull, unsubStatus];
    return () => { cleanupRefs.current.forEach((fn) => fn && fn()); cleanupRefs.current = []; };
  }, [isElectron]);

  const checkOllamaStatus = async () => {
    setOllamaStatus('checking');
    const running = await checkOllama();
    if (running) {
      setOllamaStatus('connected');
      const models = await listModels();
      setOllamaModels(models);
      if (models.length > 0) {
        const modelExists = models.some((m) => m.name === selectedModel);
        if (!modelExists) setSelectedModel(models[0].name);
      }
    } else {
      setOllamaStatus('disconnected');
    }
  };

  const handleDeleteKey = () => {
    setApiKey('');
    setApiKeyInput('');
    setLocalProvider('none');
    setProvider('none');
    setKeyDeleted(true);
    setTimeout(() => setKeyDeleted(false), 2000);
  };

  const handleDeleteOpenAIKey = () => {
    setOpenAIKey('');
    setOpenaiKeyInput('');
    setLocalProvider('none');
    setProvider('none');
    setOpenaiKeyDeleted(true);
    setTimeout(() => setOpenaiKeyDeleted(false), 2000);
  };

  const handleSave = useCallback(async () => {
    // Save editor prefs
    savePrefs(prefs);
    applyEditorPrefs(prefs);

    // Save AI provider
    setProvider(provider);
    if (provider === 'ollama') {
      setOllamaModel(selectedModel);
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
            setTimeout(() => onClose(), 1500);
          }
        } catch (err) {
          setSetupPhase('error');
          setSetupError(err.message || 'Setup failed');
          setSetupRunning(false);
        }
        return;
      }
    }
    if (provider === 'claude' && apiKeyInput.trim() && apiKeyInput.trim() !== 'your_key_here') {
      setApiKey(apiKeyInput.trim());
    }
    if (provider === 'openai' && openaiKeyInput.trim()) {
      setOpenAIKey(openaiKeyInput.trim());
    }
    onClose();
  }, [provider, selectedModel, apiKeyInput, openaiKeyInput, isElectron, onClose, prefs]);

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

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget && !setupRunning) onClose(); };
  const handleKeyDown = (e) => { if (e.key === 'Escape' && !setupRunning) onClose(); };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setupRunning]);

  const getPhaseInfo = () => {
    switch (setupPhase) {
      case 'downloading': return { label: 'Downloading Ollama...', icon: Download, percent: downloadPercent };
      case 'starting': return { label: 'Starting server...', icon: Server, percent: -1 };
      case 'pulling': return { label: 'Pulling model...', icon: Package, percent: pullPercent };
      case 'ready': return { label: 'All set — AI features are active', icon: Check, percent: 100 };
      case 'error': return { label: setupError || 'Setup failed', icon: RefreshCw, percent: 0 };
      default: return null;
    }
  };

  const tabs = [
    { id: 'ai', label: 'AI Provider' },
    { id: 'templates', label: 'Templates' },
    { id: 'editor', label: 'Editor' },
    { id: 'about', label: 'About' },
  ];

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

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold font-[var(--font-ui)] transition-colors cursor-pointer border-b-2 -mb-px ${
                tab === t.id ? 'text-amber border-amber' : 'text-ghost border-transparent hover:text-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5 min-h-[280px] max-h-[calc(100vh-220px)] overflow-y-auto">

          {/* ═══════ AI Provider Tab ═══════ */}
          {tab === 'ai' && (
            <div className="space-y-4">
              {/* Ollama — Electron only */}
              {isElectron && (
                <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  provider === 'ollama' ? 'border-amber bg-amber-light/20' : 'border-border hover:border-amber/40'
                }`}>
                  <input type="radio" name="provider" checked={provider === 'ollama'} onChange={() => setLocalProvider('ollama')} disabled={setupRunning} className="mt-0.5 accent-amber cursor-pointer" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Cpu size={14} className="text-amber" />
                      <span className="text-sm font-medium font-[var(--font-ui)] text-text">Local Model (Ollama)</span>
                      {!setupPhase && ollamaStatus === 'checking' && <Loader2 size={12} className="animate-spin text-ghost" />}
                      {!setupPhase && ollamaStatus === 'connected' && <span className="w-2 h-2 rounded-full bg-green-500" />}
                    </div>
                    {provider === 'ollama' && (
                      <div className="mt-3 space-y-2">
                        {setupPhase && isElectron ? (
                          <SetupProgress phaseInfo={getPhaseInfo()} setupPhase={setupPhase} pullStatus={pullStatus} onRetry={handleRetrySetup} />
                        ) : (
                          <>
                            {ollamaStatus === 'connected' && ollamaModels.length > 0 ? (
                              <ModelSelector models={ollamaModels} selectedModel={selectedModel} onSelectModel={setSelectedModel} />
                            ) : (
                              <p className="text-xs text-ghost font-[var(--font-ui)]">Local AI will be set up automatically when you save.</p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              )}

              {/* Claude API */}
              <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                provider === 'claude' ? 'border-amber bg-amber-light/20' : 'border-border hover:border-amber/40'
              }`}>
                <input type="radio" name="provider" checked={provider === 'claude'} onChange={() => { setLocalProvider('claude'); setTimeout(() => apiKeyRef.current?.focus(), 100); }} disabled={setupRunning} className="mt-0.5 accent-amber cursor-pointer" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber" />
                    <span className="text-sm font-medium font-[var(--font-ui)] text-text">Claude API</span>
                    {hasApiKey() && <Check size={12} className="text-green-600" />}
                  </div>
                  {provider === 'claude' && (
                    <div className="mt-3">
                      <div className="relative">
                        <input ref={apiKeyRef} type={showKey ? 'text' : 'password'} value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} placeholder="sk-ant-api03-..." className="w-full text-xs font-[var(--font-ui)] text-text bg-surface border border-border rounded-md px-3 py-1.5 pr-8 outline-none focus:border-amber transition-colors" />
                        <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-ghost hover:text-text transition-colors cursor-pointer">
                          {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>

                      {/* Trust messaging */}
                      <div className="mt-2 p-2 bg-sidebar-bg rounded-md space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Shield size={10} className="text-green-600 shrink-0" />
                          <span className="text-[10px] font-[var(--font-ui)] text-text/70">Your key stays in your browser&apos;s local storage</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Shield size={10} className="text-green-600 shrink-0" />
                          <span className="text-[10px] font-[var(--font-ui)] text-text/70">Sent directly to Anthropic&apos;s API — no middleman server</span>
                        </div>
                      </div>

                      {/* Delete key */}
                      {hasApiKey() && (
                        <button
                          onClick={handleDeleteKey}
                          className="flex items-center gap-1.5 mt-2 text-[11px] font-[var(--font-ui)] text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          {keyDeleted ? <><Check size={10} /> Key deleted</> : <><Trash2 size={10} /> Delete my API key</>}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </label>

              {/* OpenAI / GPT */}
              <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                provider === 'openai' ? 'border-amber bg-amber-light/20' : 'border-border hover:border-amber/40'
              }`}>
                <input type="radio" name="provider" checked={provider === 'openai'} onChange={() => { setLocalProvider('openai'); setTimeout(() => openaiKeyRef.current?.focus(), 100); }} disabled={setupRunning} className="mt-0.5 accent-amber cursor-pointer" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber" />
                    <span className="text-sm font-medium font-[var(--font-ui)] text-text">OpenAI GPT</span>
                    {hasOpenAIKey() && <Check size={12} className="text-green-600" />}
                  </div>
                  {provider === 'openai' && (
                    <div className="mt-3">
                      <div className="relative">
                        <input ref={openaiKeyRef} type={showOpenAIKey ? 'text' : 'password'} value={openaiKeyInput} onChange={(e) => setOpenaiKeyInput(e.target.value)} placeholder="sk-..." className="w-full text-xs font-[var(--font-ui)] text-text bg-surface border border-border rounded-md px-3 py-1.5 pr-8 outline-none focus:border-amber transition-colors" />
                        <button onClick={() => setShowOpenAIKey(!showOpenAIKey)} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-ghost hover:text-text transition-colors cursor-pointer">
                          {showOpenAIKey ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>

                      <div className="mt-2 p-2 bg-sidebar-bg rounded-md space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Shield size={10} className="text-green-600 shrink-0" />
                          <span className="text-[10px] font-[var(--font-ui)] text-text/70">Your key stays in your browser&apos;s local storage</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Shield size={10} className="text-green-600 shrink-0" />
                          <span className="text-[10px] font-[var(--font-ui)] text-text/70">Sent directly to OpenAI&apos;s API — no middleman server</span>
                        </div>
                      </div>

                      {hasOpenAIKey() && (
                        <button
                          onClick={handleDeleteOpenAIKey}
                          className="flex items-center gap-1.5 mt-2 text-[11px] font-[var(--font-ui)] text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          {openaiKeyDeleted ? <><Check size={10} /> Key deleted</> : <><Trash2 size={10} /> Delete my API key</>}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </label>

              {/* No AI */}
              <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                provider === 'none' ? 'border-amber bg-amber-light/20' : 'border-border hover:border-amber/40'
              }`}>
                <input type="radio" name="provider" checked={provider === 'none'} onChange={() => setLocalProvider('none')} disabled={setupRunning} className="mt-0.5 accent-amber cursor-pointer" />
                <div>
                  <div className="flex items-center gap-2">
                    <Ban size={14} className="text-ghost" />
                    <span className="text-sm font-medium font-[var(--font-ui)] text-text">No AI</span>
                  </div>
                  <p className="text-xs font-[var(--font-ui)] text-ghost mt-1">Templates and coaching still work. Ghost text will be disabled.</p>
                </div>
              </label>

              <p className="text-[10px] font-[var(--font-ui)] text-ghost/60 text-center pt-1">
                This can be changed or deselected later under Settings.
              </p>
            </div>
          )}

          {/* ═══════ Templates Tab ═══════ */}
          {tab === 'templates' && <CustomTemplatesTab />}

          {/* ═══════ Editor Tab ═══════ */}
          {tab === 'editor' && (
            <div className="space-y-5">
              {/* Theme */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Moon size={14} className="text-amber" />
                  <span className="text-xs font-semibold font-[var(--font-ui)] text-text uppercase tracking-wider">Theme</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Monitor },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        const next = { ...prefs, theme: t.id };
                        setPrefs(next);
                        applyEditorPrefs(next);
                      }}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 text-center transition-all cursor-pointer ${
                        prefs.theme === t.id ? 'border-amber bg-amber-light/20' : 'border-border hover:border-amber/40'
                      }`}
                    >
                      <t.icon size={14} className={prefs.theme === t.id ? 'text-amber' : 'text-ghost'} />
                      <span className="text-[10px] font-[var(--font-ui)] text-ghost">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Type size={14} className="text-amber" />
                  <span className="text-xs font-semibold font-[var(--font-ui)] text-text uppercase tracking-wider">Font Style</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'serif', label: 'Serif', sample: 'Lora', style: "'Lora', serif" },
                    { id: 'sans', label: 'Sans-serif', sample: 'DM Sans', style: "'DM Sans', sans-serif" },
                    { id: 'mono', label: 'Monospace', sample: 'Mono', style: "'SF Mono', 'Fira Code', monospace" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setPrefs({ ...prefs, fontFamily: f.id })}
                      className={`p-3 rounded-lg border-2 text-center transition-all cursor-pointer ${
                        prefs.fontFamily === f.id ? 'border-amber bg-amber-light/20' : 'border-border hover:border-amber/40'
                      }`}
                    >
                      <span className="block text-base mb-0.5" style={{ fontFamily: f.style }}>Aa</span>
                      <span className="text-[10px] font-[var(--font-ui)] text-ghost">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ALargeSmall size={14} className="text-amber" />
                  <span className="text-xs font-semibold font-[var(--font-ui)] text-text uppercase tracking-wider">Font Size</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sm', label: 'Small', px: '14px' },
                    { id: 'base', label: 'Default', px: '16px' },
                    { id: 'lg', label: 'Large', px: '18px' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setPrefs({ ...prefs, fontSize: s.id })}
                      className={`p-3 rounded-lg border-2 text-center transition-all cursor-pointer ${
                        prefs.fontSize === s.id ? 'border-amber bg-amber-light/20' : 'border-border hover:border-amber/40'
                      }`}
                    >
                      <span className="block font-[var(--font-body)]" style={{ fontSize: s.px }}>{s.px.replace('px', '')}</span>
                      <span className="text-[10px] font-[var(--font-ui)] text-ghost">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Height */}
              <div>
                <span className="text-xs font-semibold font-[var(--font-ui)] text-text uppercase tracking-wider">Line Spacing</span>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { id: 'snug', label: 'Compact', val: '1.5' },
                    { id: 'relaxed', label: 'Default', val: '1.75' },
                    { id: 'loose', label: 'Spacious', val: '2' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setPrefs({ ...prefs, lineHeight: l.id })}
                      className={`p-2.5 rounded-lg border-2 text-center transition-all cursor-pointer ${
                        prefs.lineHeight === l.id ? 'border-amber bg-amber-light/20' : 'border-border hover:border-amber/40'
                      }`}
                    >
                      <span className="text-[10px] font-[var(--font-ui)] text-ghost">{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════ About Tab ═══════ */}
          {tab === 'about' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <span className="text-3xl">&#9998;</span>
                <h3 className="text-lg font-bold font-[var(--font-ui)] text-text mt-2">Clarity</h3>
                <p className="text-xs font-[var(--font-ui)] text-ghost mt-1">AI-powered thinking assistant for PMs</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Shield size={16} className="text-green-600" />
                  <div>
                    <span className="text-sm font-medium font-[var(--font-ui)] text-text">Privacy First</span>
                    <p className="text-[10px] font-[var(--font-ui)] text-ghost">All data stays in your browser. No tracking. No analytics.</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-[10px] font-[var(--font-ui)] text-ghost/50 pt-2">
                Built with React + Vite + Tailwind
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button onClick={() => { if (!setupRunning) onClose(); }} className="px-4 py-2 text-sm font-[var(--font-ui)] font-medium text-ghost hover:text-text transition-colors cursor-pointer rounded-lg">
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
        @keyframes settingsOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes settingsModal { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-settings-overlay { animation: settingsOverlay 0.15s ease-out; }
        .animate-settings-modal { animation: settingsModal 0.2s ease-out; }
      `}</style>
    </div>
  );
}

// ── Apply editor prefs to CSS variables ──────────────────────────
export function applyEditorPrefs(prefs) {
  if (!prefs) prefs = getEditorPrefs();
  const root = window.document.documentElement;

  const fontMap = {
    serif: "'Lora', serif",
    sans: "'DM Sans', sans-serif",
    mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
  };
  const sizeMap = { sm: '14px', base: '16px', lg: '18px' };
  const lineMap = { snug: '1.5', relaxed: '1.75', loose: '2' };

  root.style.setProperty('--editor-font', fontMap[prefs.fontFamily] || fontMap.serif);
  root.style.setProperty('--editor-size', sizeMap[prefs.fontSize] || sizeMap.base);
  root.style.setProperty('--editor-line-height', lineMap[prefs.lineHeight] || lineMap.relaxed);

  // Theme
  const theme = prefs.theme || 'light';
  let dark = theme === 'dark';
  if (theme === 'system') {
    dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
}

// ── Sub-components ────────────────────────────────────────────────

function ModelSelector({ models, selectedModel, onSelectModel }) {
  return (
    <div className="relative">
      <select value={selectedModel} onChange={(e) => onSelectModel(e.target.value)} className="w-full text-xs font-[var(--font-ui)] text-text bg-surface border border-border rounded-md px-3 py-1.5 pr-7 outline-none focus:border-amber transition-colors appearance-none cursor-pointer">
        {models.map((m) => (
          <option key={m.name} value={m.name}>{m.name} {m.size ? `(${m.size})` : ''}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ghost pointer-events-none" />
    </div>
  );
}

// ── Custom Templates Tab ─────────────────────────────────────────

const TYPE_OPTIONS = Object.entries(TEMPLATES).map(([key, tmpl]) => ({ value: key, label: tmpl.name }));

function CustomTemplatesTab() {
  const [templates, setTemplates] = useState(() => loadCustomTemplateIndex());
  const [usage, setUsage] = useState(() => getCustomTemplateStorageUsage());
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [templateType, setTemplateType] = useState(TYPE_OPTIONS[0]?.value || 'prd');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const refresh = () => {
    setTemplates(loadCustomTemplateIndex());
    setUsage(getCustomTemplateStorageUsage());
  };

  const handleSave = () => {
    setError(null);
    const result = saveCustomTemplate({ name, templateType, content });
    if (!result.success) {
      setError(result.message);
      return;
    }
    setShowForm(false);
    setName('');
    setContent('');
    refresh();
  };

  const handleDelete = (id) => {
    deleteCustomTemplate(id);
    refresh();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reject files > 100 KB to prevent freezing
    if (file.size > 100_000) {
      setError('File too large (max 100 KB). Paste the text directly or use a smaller file.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = (ev.target?.result || '').slice(0, 50_000);
        setContent(text);
        if (!name) setName(file.name.replace(/\.(txt|md|markdown)$/i, ''));
      } catch {
        setError('Failed to read file.');
      }
    };
    reader.onerror = () => {
      setError('Failed to read file.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Empty state
  if (templates.length === 0 && !showForm) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText size={28} className="text-ghost/40 mb-3" />
        <p className="text-sm font-[var(--font-ui)] text-text mb-1">No custom templates yet</p>
        <p className="text-xs font-[var(--font-ui)] text-ghost mb-4 max-w-[240px]">
          Upload example documents to help AI learn your writing style and structure.
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white text-xs font-[var(--font-ui)] font-medium rounded-lg hover:bg-amber/90 transition-colors cursor-pointer"
        >
          <Plus size={14} /> Add your first template
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header + usage */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold font-[var(--font-ui)] text-text uppercase tracking-wider">Custom Templates</span>
          <span className="text-[10px] font-[var(--font-ui)] text-ghost ml-2">
            {usage.count}/{usage.maxCount} &middot; {Math.round(usage.totalBytes / 1000)}/{Math.round(usage.maxBytes / 1000)} KB
          </span>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-[var(--font-ui)] font-medium text-amber border border-amber/30 rounded-md hover:bg-amber/10 transition-colors cursor-pointer"
          >
            <Plus size={10} /> Add
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="border border-amber/30 rounded-lg p-3 bg-amber/5 space-y-2.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name (e.g. My PRD Style)"
            className="w-full text-xs font-[var(--font-ui)] text-text bg-surface border border-border rounded-md px-3 py-1.5 outline-none focus:border-amber transition-colors"
          />
          <div className="relative">
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className="w-full text-xs font-[var(--font-ui)] text-text bg-surface border border-border rounded-md px-3 py-1.5 pr-7 outline-none focus:border-amber transition-colors appearance-none cursor-pointer"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ghost pointer-events-none" />
          </div>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your document text here..."
              rows={5}
              maxLength={50000}
              className="w-full text-xs font-[var(--font-ui)] text-text bg-surface border border-border rounded-md px-3 py-2 resize-y outline-none focus:border-amber transition-colors min-h-[80px] max-h-[180px]"
            />
            <span className="absolute bottom-2 right-2 text-[9px] font-[var(--font-ui)] text-ghost/50">
              {content.length.toLocaleString()} / 50,000
            </span>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 text-[10px] font-[var(--font-ui)] text-ghost hover:text-amber transition-colors cursor-pointer"
            >
              <Upload size={10} /> Upload .txt / .md
            </button>
            <input ref={fileRef} type="file" accept=".txt,.md,.markdown" className="hidden" onChange={handleFileUpload} />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowForm(false); setError(null); setName(''); setContent(''); }}
                className="px-3 py-1 text-[10px] font-[var(--font-ui)] text-ghost hover:text-text transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-amber text-white text-[10px] font-[var(--font-ui)] font-medium rounded-md hover:bg-amber/90 transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
          {error && <p className="text-[10px] font-[var(--font-ui)] text-red-500">{error}</p>}
        </div>
      )}

      {/* Template list */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {templates.map((tpl) => (
          <div key={tpl.id} className="flex items-start gap-2 p-2.5 border border-border rounded-lg bg-surface">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium font-[var(--font-ui)] text-text truncate">{tpl.name}</span>
                <span className="text-[9px] font-[var(--font-ui)] px-1.5 py-0.5 rounded bg-amber/15 text-amber uppercase shrink-0">
                  {TEMPLATES[tpl.templateType]?.name || tpl.templateType}
                </span>
              </div>
              <p className="text-[10px] font-[var(--font-ui)] text-ghost mt-0.5 truncate">
                {Math.round((tpl.contentLength || 0) / 1000)}K chars
              </p>
            </div>
            <button
              onClick={() => handleDelete(tpl.id)}
              className="p-1 text-ghost hover:text-red-500 transition-colors cursor-pointer shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
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
        {isReady ? <Check size={14} className="text-green-600" /> : isError ? <RefreshCw size={14} className="text-red-500" /> : <Icon size={14} className="text-amber animate-pulse" />}
        <span className={`text-xs font-[var(--font-ui)] ${isReady ? 'text-green-700' : isError ? 'text-red-600' : 'text-text'}`}>{label}</span>
      </div>
      {(setupPhase === 'downloading' || setupPhase === 'pulling') && percent >= 0 && (
        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
          <div className="bg-amber h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>
      )}
      {setupPhase === 'downloading' && percent > 0 && <p className="text-[10px] font-[var(--font-ui)] text-ghost">{percent}% downloaded</p>}
      {setupPhase === 'pulling' && <p className="text-[10px] font-[var(--font-ui)] text-ghost">{pullStatus}{percent > 0 ? ` — ${percent}%` : ''}</p>}
      {setupPhase === 'starting' && (
        <div className="flex items-center gap-1.5">
          <Loader2 size={10} className="animate-spin text-ghost" />
          <p className="text-[10px] font-[var(--font-ui)] text-ghost">Waiting for server...</p>
        </div>
      )}
      {isError && (
        <button onClick={onRetry} className="flex items-center gap-1.5 text-[11px] font-[var(--font-ui)] text-amber hover:text-amber/80 transition-colors cursor-pointer">
          <RefreshCw size={10} /> Try again
        </button>
      )}
    </div>
  );
}
