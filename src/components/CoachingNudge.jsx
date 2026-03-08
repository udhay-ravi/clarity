import { Lightbulb, X } from 'lucide-react';

export default function CoachingNudge({ nudges, onDismiss }) {
  if (!nudges || nudges.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold font-[var(--font-ui)] uppercase tracking-wider text-ghost mb-4">
        Coach
      </h3>
      {nudges.map((nudge) => (
        <div
          key={nudge.id}
          className="p-3 bg-white rounded-lg shadow-sm border border-border animate-nudge-in"
        >
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="text-amber mt-0.5 shrink-0" />
            <p className="text-sm font-[var(--font-ui)] text-text/80 leading-snug flex-1">
              {nudge.text}
            </p>
            <button
              onClick={() => onDismiss(nudge.id)}
              className="p-0.5 text-ghost hover:text-text transition-colors cursor-pointer shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}

    </div>
  );
}
