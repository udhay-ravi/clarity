import { useState, useRef, useEffect } from 'react';
import { PenLine, Key, Eye, EyeOff, Cpu, Sparkles, ArrowLeft, ArrowRight, RefreshCw, Loader2, Check, ChevronDown, ChevronRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useDocumentTemplate } from '../hooks/useDocumentTemplate';
import { TEMPLATES } from '../lib/templates';
import { hasApiKey, getApiKey, setApiKey, getProvider, setProvider, checkOllama, listModels, getOllamaModel, setOllamaModel, isElectronApp } from '../lib/ai-provider';

const FEATURED_KEYS = ['prd', 'prfaq', 'onePager', 'productPitch', 'launchBrief', 'pricingProposal'];
const SECONDARY_KEYS = Object.keys(TEMPLATES).filter((k) => !FEATURED_KEYS.includes(k));

export default function WelcomeScreen({ onStart, onOpenSettings, onGoToLanding }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const { detection, detect } = useDocumentTemplate();
  const [exiting, setExiting] = useState(false);
  const isElectron = isElectronApp();

  // Template selection + preface
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [prefaceValues, setPrefaceValues] = useState({});
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const prefaceRefs = useRef([]);
  const prefaceContainerRef = useRef(null);

  // Provider selection state — skip if user already made a choice (even 'none')
  const providerConfigured = localStorage.getItem('clarity-ai-provider') !== null || hasApiKey();
  const [step, setStep] = useState(providerConfigured ? 'document' : 'provider');

  // Sub-steps for provider setup
  const [providerChoice, setProviderChoice] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState(null);
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

  // Scroll preface into view when it appears
  useEffect(() => {
    if (selectedTemplate?.preface?.length > 0 && prefaceContainerRef.current) {
      setTimeout(() => {
        prefaceContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        prefaceRefs.current[0]?.focus();
      }, 100);
    }
  }, [selectedTemplate?.key]);

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

  // ── Template selection ────────────────────────────────────────
  const handleSelectTemplate = (key) => {
    if (selectedTemplate?.key === key) {
      // Deselect
      setSelectedTemplate(null);
      setPrefaceValues({});
      setInput('');
      return;
    }
    const template = { key, ...TEMPLATES[key] };
    setSelectedTemplate(template);
    setInput(template.name);
    const init = {};
    for (const field of template.preface) {
      init[field.key] = '';
    }
    setPrefaceValues(init);
  };

  // ── Text input + detection ────────────────────────────────────
  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    const result = detect(value);
    if (result) {
      setSelectedTemplate(result);
      const init = {};
      for (const field of result.preface) {
        init[field.key] = '';
      }
      setPrefaceValues(init);
    } else {
      setSelectedTemplate(null);
      setPrefaceValues({});
    }
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = () => {
    setExiting(true);
    setTimeout(() => {
      if (selectedTemplate) {
        onStart(selectedTemplate, input, prefaceValues);
      } else {
        onStart(null, input, {});
      }
    }, 400);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedTemplate?.preface?.length > 0) {
        // Focus first preface field
        prefaceRefs.current[0]?.focus();
      } else if (input.trim().length > 0) {
        handleSubmit();
      }
    }
  };

  const handlePrefaceKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < selectedTemplate.preface.length - 1) {
        prefaceRefs.current[index + 1]?.focus();
      } else {
        handleSubmit();
      }
    }
  };

  const providerLabel = () => {
    const p = getProvider();
    if (p === 'ollama') return 'Local Model';
    if (p === 'claude') return 'Claude API';
    return 'No AI';
  };

  const hasPreface = selectedTemplate?.preface?.length > 0;

  return (
    <div
      className={`min-h-screen flex flex-col items-center ${
        hasPreface ? 'justify-start pt-16 pb-16' : 'justify-center'
      } px-6 transition-opacity duration-400 relative ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute top-5 right-6">
        <ThemeToggle />
      </div>
      <button
        onClick={onGoToLanding}
        className="flex items-center gap-3 mb-10 hover:opacity-70 transition-opacity cursor-pointer"
        title="Back to Home"
      >
        <PenLine className="w-8 h-8 text-amber" />
        <h1 className="font-[var(--font-ui)] text-3xl font-bold tracking-tight text-text">
          Clarity
        </h1>
      </button>

      <div className="w-full max-w-xl">

        {/* ─────── Step 1: Provider Selection ─────── */}
        {step === 'provider' && !providerChoice && (
          <div className="animate-fade-in">
            <p className="text-center text-sm font-[var(--font-ui)] text-ghost mb-8">
              How would you like to power AI features?
            </p>

            <div className={`grid ${isElectron ? 'grid-cols-2' : 'grid-cols-1 max-w-xs mx-auto'} gap-4 mb-6`}>
              {isElectron && (
                <button
                  onClick={handleChooseOllama}
                  className="flex flex-col items-center gap-3 p-6 bg-surface rounded-xl border-2 border-border hover:border-amber hover:shadow-md transition-all cursor-pointer group"
                >
                  <Cpu size={28} className="text-ghost group-hover:text-amber transition-colors" />
                  <span className="text-sm font-semibold font-[var(--font-ui)] text-text">
                    Local Model
                  </span>
                  <span className="text-xs font-[var(--font-ui)] text-ghost text-center leading-snug">
                    Free &amp; private<br />Runs on your Mac via Ollama
                  </span>
                </button>
              )}

              <button
                onClick={handleChooseClaude}
                className="flex flex-col items-center gap-3 p-6 bg-surface rounded-xl border-2 border-border hover:border-amber hover:shadow-md transition-all cursor-pointer group"
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
                        className="w-full text-sm font-[var(--font-ui)] text-text bg-surface border border-border rounded-lg px-4 py-2.5 pr-8 outline-none focus:border-amber transition-colors appearance-none cursor-pointer"
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
                    <code className="block bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-text mb-3">
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

                <div className="bg-surface border border-border rounded-lg p-4 text-sm font-[var(--font-ui)] text-text space-y-2">
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
              Clarity uses Claude to power ghost text and writing assistance. Enter your API key to get started.
            </p>
            <div className="relative">
              <input
                ref={apiKeyRef}
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onKeyDown={handleKeyInputKeyDown}
                placeholder="sk-ant-api03-..."
                className="w-full text-base font-[var(--font-ui)] text-text bg-surface border border-border rounded-lg px-4 py-3 pr-20 outline-none focus:border-amber transition-colors"
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

        {/* ─────── Step 2: Document Type (Unified) ─────── */}
        {step === 'document' && (
          <div className="animate-fade-in">
            {/* Zone A: Title + Text Input */}
            <h2 className="text-center text-xl font-bold font-[var(--font-ui)] text-text mb-6">
              What are you writing?
            </h2>

            <div className="relative mb-6">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Type or pick a template below"
                className="w-full text-lg font-[var(--font-body)] text-text bg-surface border-2 border-border rounded-xl px-5 py-3.5 pr-40 outline-none focus:border-amber transition-colors placeholder:text-ghost/50"
              />
              {detection && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium font-[var(--font-ui)] text-amber bg-amber/10 px-2.5 py-1 rounded-full">
                  {detection.name} detected
                </span>
              )}
            </div>

            {/* Zone B: Template Card Grid */}
            <div className="grid grid-cols-3 gap-3 mb-2">
              {FEATURED_KEYS.map((key) => {
                const t = TEMPLATES[key];
                const isSelected = selectedTemplate?.key === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectTemplate(key)}
                    className={`flex items-center justify-center px-4 py-3.5 rounded-xl border-2 text-sm font-semibold font-[var(--font-ui)] transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber bg-amber/5 text-amber shadow-sm'
                        : 'border-border bg-surface text-text hover:border-amber/50 hover:shadow-sm'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>

            {/* Secondary templates toggle */}
            {!showAllTemplates ? (
              <button
                onClick={() => setShowAllTemplates(true)}
                className="flex items-center gap-1 mx-auto mt-2 mb-2 text-xs font-[var(--font-ui)] text-ghost hover:text-amber transition-colors cursor-pointer"
              >
                <ChevronRight size={12} />
                {SECONDARY_KEYS.length} more templates
              </button>
            ) : (
              <div className="animate-fade-in mt-3 mb-2">
                <div className="grid grid-cols-3 gap-3">
                  {SECONDARY_KEYS.map((key) => {
                    const t = TEMPLATES[key];
                    const isSelected = selectedTemplate?.key === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectTemplate(key)}
                        className={`flex items-center justify-center px-3 py-3 rounded-xl border-2 text-xs font-semibold font-[var(--font-ui)] transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber bg-amber/5 text-amber shadow-sm'
                            : 'border-border bg-surface text-text/80 hover:border-amber/50 hover:shadow-sm'
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Zone C: Inline Preface Fields */}
            {hasPreface && (
              <div
                key={selectedTemplate.key}
                ref={prefaceContainerRef}
                className="mt-6 pt-6 border-t border-border animate-fade-in"
              >
                <h3 className="text-lg font-bold font-[var(--font-ui)] text-text mb-1">
                  Set up your {selectedTemplate.name}
                </h3>
                <p className="text-sm font-[var(--font-ui)] text-ghost mb-5">
                  This helps Clarity coach you as you write. You can always edit these later.
                </p>

                <div className="space-y-4">
                  {selectedTemplate.preface.map((field, index) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium font-[var(--font-ui)] text-text mb-1.5">
                        {field.label}
                      </label>
                      <input
                        ref={(el) => { prefaceRefs.current[index] = el; }}
                        type="text"
                        value={prefaceValues[field.key] || ''}
                        onChange={(e) => setPrefaceValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        onKeyDown={(e) => handlePrefaceKeyDown(e, index)}
                        placeholder={field.placeholder}
                        className="w-full text-base font-[var(--font-body)] text-text bg-surface border border-border rounded-lg px-4 py-3 outline-none focus:border-amber transition-colors placeholder:text-ghost/50"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-6">
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-2.5 bg-amber text-white font-[var(--font-ui)] font-medium text-sm rounded-lg hover:bg-amber/90 transition-colors cursor-pointer"
                  >
                    Start Writing
                    <ArrowRight size={16} />
                  </button>
                  {!Object.values(prefaceValues).some((v) => v.trim().length > 0) && (
                    <span className="text-xs font-[var(--font-ui)] text-ghost">
                      You can skip these and fill them in later
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Start Writing for blank docs (no template selected but has text) */}
            {!hasPreface && input.trim().length > 0 && !selectedTemplate && (
              <button
                onClick={handleSubmit}
                className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-amber text-white font-[var(--font-ui)] font-medium text-sm rounded-lg hover:bg-amber/90 transition-colors cursor-pointer"
              >
                Start Writing
                <ArrowRight size={16} />
              </button>
            )}

            {/* Provider label */}
            <div className="flex justify-end mt-6">
              <button
                onClick={onOpenSettings || (() => setStep('provider'))}
                className="flex items-center gap-1.5 text-xs font-[var(--font-ui)] text-ghost hover:text-amber transition-colors cursor-pointer"
                title="Change AI provider"
              >
                <span>{providerLabel()}</span>
                {getProvider() !== 'none' && <Check size={12} className="text-green-600" />}
              </button>
            </div>
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
