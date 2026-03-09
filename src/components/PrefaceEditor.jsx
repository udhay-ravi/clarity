import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function PrefaceEditor({ preface, onChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const fields = Object.entries(preface);

  if (fields.length === 0) return null;

  return (
    <div className="mb-6 border border-border rounded-lg bg-surface/50 animate-section-in">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full px-4 py-3 text-left cursor-pointer hover:bg-amber-light/30 transition-colors rounded-t-lg"
      >
        {collapsed ? <ChevronRight size={14} className="text-ghost" /> : <ChevronDown size={14} className="text-ghost" />}
        <span className="text-xs font-semibold font-[var(--font-ui)] text-ghost uppercase tracking-wider">
          Document Context
        </span>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 grid grid-cols-1 gap-3">
          {fields.map(([key, field]) => (
            <div key={key} className="flex items-center gap-3">
              <label className="text-sm font-medium font-[var(--font-ui)] text-text/70 w-40 shrink-0">
                {field.label}
              </label>
              <input
                type="text"
                value={field.value || ''}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={field.placeholder}
                className="flex-1 text-sm font-[var(--font-body)] text-text bg-transparent border-b border-border focus:border-amber outline-none py-1 placeholder:text-ghost/40 transition-colors"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
