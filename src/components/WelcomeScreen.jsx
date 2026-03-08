import { useState, useRef, useEffect } from 'react';
import { PenLine, Key, Eye, EyeOff, Check } from 'lucide-react';
import { useDocumentTemplate } from '../hooks/useDocumentTemplate';
import { hasApiKey, getApiKey, setApiKey } from '../lib/anthropic';

export default function WelcomeScreen({ onStart }) {
  const [input, setInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey());
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(hasApiKey());
  const inputRef = useRef(null);
  const apiKeyRef = useRef(null);
  const { detection, detect } = useDocumentTemplate();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (keySaved) {
      inputRef.current?.focus();
    } else {
      apiKeyRef.current?.focus();
    }
  }, [keySaved]);

  const handleSaveKey = () => {
    if (apiKeyInput.trim() && apiKeyInput.trim() !== 'your_key_here') {
      setApiKey(apiKeyInput.trim());
      setKeySaved(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveKey();
    }
  };

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
        {/* Step 1: API Key */}
        {!keySaved ? (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Key size={16} className="text-amber" />
              <label className="text-sm font-[var(--font-ui)] font-medium text-text">
                Anthropic API Key
              </label>
            </div>
            <p className="text-sm font-[var(--font-ui)] text-ghost mb-4">
              Clarity uses Claude to power ghost text suggestions as you write. Enter your API key to get started.
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
                Stored locally in your browser. Never sent anywhere except Anthropic.
              </p>
            </div>
          </div>
        ) : (
          /* Step 2: Document type */
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
                Try: product requirement document, one-pager, launch brief, competitive analysis
              </p>
              <button
                onClick={() => setKeySaved(false)}
                className="flex items-center gap-1 text-xs font-[var(--font-ui)] text-ghost hover:text-amber transition-colors cursor-pointer shrink-0 ml-4"
                title="Change API key"
              >
                <Key size={12} />
                <Check size={12} className="text-green-600" />
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
