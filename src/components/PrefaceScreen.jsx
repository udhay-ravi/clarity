import { useState, useRef, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function PrefaceScreen({ template, onComplete, onBack }) {
  const [values, setValues] = useState(() => {
    const init = {};
    for (const field of template.preface) {
      init[field.key] = '';
    }
    return init;
  });
  const [exiting, setExiting] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    setExiting(true);
    setTimeout(() => {
      onComplete(values);
    }, 350);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasAnyValue = Object.values(values).some((v) => v.trim().length > 0);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 transition-opacity duration-350 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-xl animate-fade-in">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-[var(--font-ui)] text-ghost hover:text-text transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <h2 className="text-2xl font-bold font-[var(--font-ui)] text-text mb-2">
          Set up your {template.name}
        </h2>
        <p className="text-sm font-[var(--font-ui)] text-ghost mb-8">
          This context helps Clarity ask you better questions as you write. You can always edit these later.
        </p>

        <div className="space-y-5">
          {template.preface.map((field, index) => (
            <div key={field.key}>
              <label className="block text-sm font-medium font-[var(--font-ui)] text-text mb-1.5">
                {field.label}
              </label>
              <input
                ref={index === 0 ? firstInputRef : null}
                type="text"
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full text-base font-[var(--font-body)] text-text bg-white border border-border rounded-lg px-4 py-3 outline-none focus:border-amber transition-colors placeholder:text-ghost/50"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber text-white font-[var(--font-ui)] font-medium text-sm rounded-lg hover:bg-amber/90 transition-colors cursor-pointer"
          >
            Start Writing
            <ArrowRight size={16} />
          </button>
          {!hasAnyValue && (
            <span className="text-xs font-[var(--font-ui)] text-ghost">
              You can skip these and fill them in later
            </span>
          )}
        </div>
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
