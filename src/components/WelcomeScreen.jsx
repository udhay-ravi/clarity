import { useState, useRef, useEffect } from 'react';
import { PenLine, Key, Eye, EyeOff, Cpu, Sparkles, ArrowLeft, RefreshCw, Loader2, Check, ChevronDown } from 'lucide-react';
import { useDocumentTemplate } from '../hooks/useDocumentTemplate';
import { hasApiKey, getApiKey, setApiKey, getProvider, setProvider, checkOllama, listModels, getOllamaModel, setOllamaModel } from '../lib/ai-provider';

export default function WelcomeScreen({ onStart, onOpenSettings }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const { detection, detect } = useDocumentTemplate();
  const [exiting, setExiting] = useState(false);

  // Provider selection state
  const providerConfigured = getProvider() !== 'none' || hasApiKey();
  const [step, setStep] = useState(providerConfigured ? 'document' : 'provider');

  // Sub-steps for provider setup
  const [providerChoice, setProviderChoice] = useState(null); // 'ollama' | 'claude'
  const [ollamaStatus, setOllamaStatus] = useState(null); // null | 'checking' | 'connected' | 'disconnected'
  const [ollamaModels, setOllamaModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(getOllamaModel());
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey());
  const [showKey, setShowKey] = useState(false);
  const apiKeyRef = useRef(null);

  useEffect(() => {
    if (step === 'document') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step]);

  // ── Ollama flow ───────────────────────────────────────────────
  const handleChooseOllama = async () => {
    setProviderChoice('ollama');
    setOllamaStatus('checking');
    const running = await checkOllama();
    if (running) {
      setOllamaStatus('connected');
      const models = await listModels();
      setOllamaModels(models);
      if (models.length > 0 && !models.find((m) => m.name === selectedModel)) {
        setSelectedModel(models[0].name);
      }
    } else {
      setOllamaStatus('disconnected');
    }
  };

  const handleCheckAgain = async () => {
    setOllamaStatus('checking');
    const running = await checkOllama();
    if (running) {
      setOllamaStatus('connected');
      const models = await listModels();
      setOllamaModels(models);
      if (models.length > 0 && !models.find((m) => m.name === selectedModel)) {
        setSelectedModel(models[0].name);
      }
    } else {
      setOllamaStatus('disconnected');
    }
  };

  const handleOllamaContinue = () => {
    setOllamaModel(selectedModel);
    setProvider('ollama');
    setStep('document');
  };

  // ── Claude flow ───────────────────────────────────────────────
  const handleChooseClaude = () => {
    setProviderChoice('claude');
    setTimeout(() => apiKeyRef.current?.focus(), 100);
  };

  const handleSaveKey = () => {
    if (apiKeyInput.trim() && apiKeyInput.trim() !== 'your_key_here') {
      setApiKey(apiKeyInput.trim());
      setProvider('claude');
      setStep('document');
    }
  };

  const handleKeyInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveKey();
    }
  };

  // ── Skip AI ───────────────────────────────────────────────────
  const handleSkipAi = () => {
    setProvider('none');
    setStep('document');
  };

  // ── Document type (Step 2) ────────────────────────────────────
  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    detect(value);
  };

  const handleStart = () => {
    setExiting(true);
    setTimeout(() => {
      onStart(detection, input);
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleStart();
    }
  };

  const providerLabel = () => {
    const p = getProvider();
    if (p === 'ollama') return 'Local Model';
    if (p === 'claude') return 'Claude API';
    return 'No AI';
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 transition-opacity duration-400 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-3 mb-12">
        <PenLine className="w-8 h-8 text-amber" />
        <h1 className="font-[var(--font-ui)] text-3xl font-bold tracking-tight text-text">
          Clarity
        </h1>
      </div>

      <div className="w-full max-w-xl">

        {/* ─────── Step 1: Provider Selection ─────── */}
        {step === 'provider' && !providerChoice && (
          <div className="animate-fade-in">
            <p className="text-center text-sm font-[var(--font-ui)] text-ghost mb-8">
              How would you like to power AI coaching?
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Ollama card */}
              <button
                onClick={handleChooseOllama}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border-2 border-border hover:border-amber hover:shadow-md transition-all cursor-pointer group"
              >
                <Cpu size={28} className="text-ghost group-hover:text-amber transition-colors" />
                <span className="text-sm font-semibold font-[var(--font-ui)] text-text">
                  Local Model
                </span>
                <span className="text-xs font-[var(--font-ui)] text-ghost text-center leading-snug">
                  Free &amp; private<br />Runs on your Mac via Ollama
                </span>
              </button>

              {/* Claude card */}
              <button
                onClick={handleChooseClaude}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border-2 border-border hover:border-amber hover:shadow-md transition-all cursor-pointer group"
              >
                <Sparkles size={28} className="text-ghost group-hover:text-amber transition-colors" />
                <span className="text-sm font-semibold font-[var(--font-ui)] text-text">
                  Claude API
                </span>
                <span className="text-xs font-[var(--font-ui)] text-ghost text-center leading-snug">
                  Best quality<br />Requires Anthropic API key
                </span>
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={handleSkipAi}
                className="text-xs font-[var(--font-ui)] text-ghost hover:text-amber transition-colors cursor-pointer"
              >
                Continue without AI &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ─────── Ollama Setup Sub-screen ─────── */}
        {step === 'provider' && providerChoice === 'ollama' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setProviderChoice(null)}
              className="flex items-center gap-1 text-xs font-[var(--font-ui)] text-ghost hover:text-text transition-colors cursor-pointer mb-6"
            >
              <ArrowLeft size={14} /> Back
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Cpu size={16} className="text-amber" />
              <span className="text-sm font-semibold font-[var(--font-ui)] text-text">
                Local Model via Ollama
              </span>
            </div>

            {ollamaStatus === 'checking' && (
              <div className="flex items-center gap-2 text-sm font-[var(--font-ui)] text-ghost py-4">
                <Loader2 size={16} className="animate-spin" />
                Checking Ollama...
              </div>
            )}

            {ollamaStatus === 'connected' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-[var(--font-ui)] text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Ollama is running
                </div>

                {ollamaModels.length > 0 ? (
                  <div>
                    <label className="block text-xs font-[var(--font-ui)] font-medium text-text mb-1.5">
                      Model
                    </label>
                    <div className="relative">
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full text-sm font-[var(--font-ui)] text-text bg-white border border-border rounded-lg px-4 py-2.5 pr-8 outline-none focus:border-amber transition-colors appearance-none cursor-pointer"
                      >
                        {ollamaModels.map((m) => (
                          <option key={m.name} value={m.name}>
                            {m.name} {m.size ? `(${m.size})` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ghost pointer-events-none" />
                    </div>
                    <button
                      onClick={handleOllamaContinue}
                      className="mt-4 px-5 py-2.5 bg-amber text-white font-[var(--font-ui)] font-medium text-sm rounded-lg hover:bg-amber/90 transition-colors cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                ) : (
                  <div className="text-sm font-[var(--font-ui)] text-ghost">
                    <p className="mb-2">No models found. Pull one first:</p>
                    <code className="block bg-white border border-border rounded-lg px-3 py-2 text-xs font-mono text-text mb-3">
                      ollama pull llama3.2:3b
                    </code>
                    <button
                      onClick={handleCheckAgain}
                      className="flex items-center gap-1.5 text-xs font-[var(--font-ui)] text-amber hover:text-amber/80 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={12} /> Check again
                    </button>
                  </div>
                )}
              </div>
            )}

            {ollamaStatus === 'disconnected' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-[var(--font-ui)] text-red-500">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Ollama is not running
                </div>

                <div className="bg-white border border-border rounded-lg p-4 text-sm font-[var(--font-ui)] text-text space-y-2">
                  <p className="font-medium">Quick setup:</p>
                  <ol className="list-decimal list-inside space-y-1 text-ghost text-xs leading-relaxed">
                    <li>
                      Install from{' '}
                      <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-amber underline">
                        ollama.com
                      </a>
                      {' '}or run: <code className="bg-sidebar-bg px-1 rounded text-text">brew install ollama</code>
                    </li>
                    <li>Start Ollama (it runs in your menu bar)</li>
                    <li>
                      Pull a model: <code className="bg-sidebar-bg px-1 rounded text-text">ollama pull llama3.2:3b</code>
                    </li>
                  </ol>
                </div>

                <button
                  onClick={handleCheckAgain}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-[var(--font-ui)] font-medium text-amber border border-amber/40 rounded-lg hover:bg-amber-light/50 transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} /> Check Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─────── Claude API Setup Sub-screen ─────── */}
        {step === 'provider' && providerChoice === 'claude' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setProviderChoice(null)}
              className="flex items-center gap-1 text-xs font-[var(--font-ui)] text-ghost hover:text-text transition-colors cursor-pointer mb-6"
            >
              <ArrowLeft size={14} /> Back
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Key size={16} className="text-amber" />
              <label className="text-sm font-[var(--font-ui)] font-medium text-text">
                Anthropic API Key
              </label>
            </div>
            <p className="text-sm font-[var(--font-ui)] text-ghost mb-4">
              Clarity uses Claude to power ghost text and coaching. Enter your API key to get started.
            </p>
            <div className="relative">
              <input
                ref={apiKeyRef}
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onKeyDown={handleKeyInputKeyDown}
                placeholder="sk-ant-api03-..."
                className="w-full text-base font-[var(--font-ui)] text-text bg-white border border-border rounded-lg px-4 py-3 pr-20 outline-none focus:border-amber transition-colors"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-ghost hover:text-text transition-colors cursor-pointer"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSaveKey}
                disabled={!apiKeyInput.trim() || apiKeyInput.trim() === 'your_key_here'}
                className="px-5 py-2.5 bg-amber text-white font-[var(--font-ui)] font-medium text-sm rounded-lg hover:bg-amber/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
              <p className="text-xs font-[var(--font-ui)] text-ghost">
                Stored locally. Never sent anywhere except Anthropic.
              </p>
            </div>
          </div>
        )}

        {/* ─────── Step 2: Document Type ─────── */}
        {step === 'document' && (
          <div className="animate-fade-in">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="What do you want to write today?"
              className="w-full text-xl font-[var(--font-body)] text-text bg-transparent border-b-2 border-border focus:border-amber outline-none pb-3 placeholder:text-ghost transition-colors"
            />

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm font-[var(--font-ui)] text-ghost">
                Try: PRFAQ, PRD, product pitch, pricing proposal, packaging, one-pager, launch brief
              </p>
              <button
                onClick={onOpenSettings || (() => setStep('provider'))}
                className="flex items-center gap-1.5 text-xs font-[var(--font-ui)] text-ghost hover:text-amber transition-colors cursor-pointer shrink-0 ml-4"
                title="Change AI provider"
              >
                <span>{providerLabel()}</span>
                {getProvider() !== 'none' && <Check size={12} className="text-green-600" />}
              </button>
            </div>

            {detection && (
              <div className="mt-6 flex items-center gap-3 animate-fade-in">
                <span className="text-sm font-[var(--font-ui)] text-text/70">
                  Looks like a <span className="font-semibold text-amber">{detection.name}</span> — press Enter to start
                </span>
              </div>
            )}

            {input.trim().length > 0 && (
              <button
                onClick={handleStart}
                className="mt-8 px-6 py-2.5 bg-amber text-white font-[var(--font-ui)] font-medium text-sm rounded-lg hover:bg-amber/90 transition-colors cursor-pointer"
              >
                Start Writing
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
