import { useState, useEffect, useCallback } from 'react';
import {
  PenLine,
  LayoutTemplate,
  Sparkles,
  BarChart3,
  FileText,
  ShieldCheck,
  MessageSquareText,
  ArrowRight,
  Zap,
  Eye,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function LandingPage({ onGetStarted, authEnabled }) {
  return (
    <div className="min-h-screen bg-bg">
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center">
            <PenLine size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-[var(--font-ui)] text-lg font-bold tracking-tight text-text">
            Clarity
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onGetStarted}
            className="text-sm font-[var(--font-ui)] font-medium text-amber hover:text-amber/80 transition-colors cursor-pointer"
          >
            Start Writing &rarr;
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-8 pt-20 pb-24 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-light/60 border border-amber/20 mb-8">
          <Zap size={13} className="text-amber" />
          <span className="text-xs font-[var(--font-ui)] font-medium text-amber">
            AI-powered writing assistant for PMs
          </span>
        </div>

        <h1 className="font-[var(--font-body)] text-5xl sm:text-6xl font-bold tracking-tight text-text leading-[1.1] mb-6">
          Think Sharper.{' '}
          <span className="text-amber">Write Clearer.</span>
        </h1>

        <p className="font-[var(--font-ui)] text-lg text-text/90 max-w-xl mx-auto leading-relaxed mb-4">
          Other AI tools write for you. Clarity makes you think.
        </p>

        <p className="font-[var(--font-ui)] text-sm text-text/80 max-w-md mx-auto leading-relaxed mb-10">
          Built for Product Managers.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-7 py-3 bg-amber text-white font-[var(--font-ui)] font-semibold text-sm rounded-xl hover:bg-amber/90 transition-all cursor-pointer shadow-lg shadow-amber/20 hover:shadow-xl hover:shadow-amber/30 hover:-translate-y-0.5"
          >
            Start Writing
            <ArrowRight size={16} />
          </button>
          <span className="text-xs font-[var(--font-ui)] text-ghost">
            {authEnabled ? 'Free \u00b7 Sign up to get started' : 'Free \u00b7 No account needed'}
          </span>
        </div>
      </section>

      {/* ── Product Demo ── */}
      <section className="px-8 pb-20 max-w-4xl mx-auto">
        <ProductDemo />
      </section>

      {/* ── Value Props ── */}
      <section className="px-8 pb-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ValueCard
            icon={<ShieldCheck size={20} />}
            title="100% Local"
            description="Your documents and API keys never leave your machine. Everything runs client-side."
          />
          <ValueCard
            icon={<LayoutTemplate size={20} />}
            title="11 PM Templates"
            description="PRFAQ, PRD, Product Pitch, Pricing Proposal, Packaging Rec, One-Pager, Launch Brief, and more — ready to go."
          />
          <ValueCard
            icon={<Sparkles size={20} />}
            title="AI Optional"
            description="Works without AI. Add a local model or Claude API when you want coaching."
          />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-8 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-[var(--font-body)] text-3xl font-bold text-text mb-3">
            Everything you need to write clearly
          </h2>
          <p className="font-[var(--font-ui)] text-sm text-ghost max-w-md mx-auto">
            Built for the way PMs actually work — fast iteration, structured thinking, real feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FeatureCard
            icon={<LayoutTemplate size={18} />}
            title="Structure Guides"
            description="Each section shows a bracket-placeholder template so you know exactly what to cover. Never miss a key dimension."
          />
          <FeatureCard
            icon={<MessageSquareText size={18} />}
            title="Ghost Text Coaching"
            description="AI suggests the next sentence as you write — not to write for you, but to prompt your thinking. Press Tab to accept."
          />
          <FeatureCard
            icon={<Eye size={18} />}
            title="Clarity Check"
            description="One-click AI review per section. Finds buried ledes, vague scope, missing specifics, and logical gaps."
          />
          <FeatureCard
            icon={<BarChart3 size={18} />}
            title="Readability Scoring"
            description="Live Flesch-Kincaid grade level. Targets college sophomore reading level — clear enough for any stakeholder."
          />
          <FeatureCard
            icon={<Zap size={18} />}
            title="Coaching Nudges"
            description="Rule-based alerts when you spend too long on a section, miss key elements, or repeat patterns across docs."
          />
          <FeatureCard
            icon={<FileText size={18} />}
            title="Multi-Format Export"
            description="Export to Markdown, PDF, or Word (.docx) with one click. Or export all three at once."
          />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-8 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-[var(--font-body)] text-3xl font-bold text-text mb-3">
            Three steps to a better doc
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Pick a template"
            description='Type "PRD" or "one-pager" and Clarity sets up the right structure with all the right sections.'
          />
          <StepCard
            number="2"
            title="Write with guidance"
            description="Each section has a template, AI ghost text, and coaching nudges to keep your thinking sharp."
          />
          <StepCard
            number="3"
            title="Review and export"
            description="Run Clarity Check for AI feedback, hit your target readability, then export to PDF, Word, or Markdown."
          />
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="px-8 pt-12 pb-24 max-w-3xl mx-auto text-center">
        <div className="bg-surface border border-border rounded-2xl px-10 py-14 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mx-auto mb-5">
            <PenLine size={24} className="text-amber" />
          </div>
          <h2 className="font-[var(--font-body)] text-2xl font-bold text-text mb-3">
            Ready to write something clear?
          </h2>
          <p className="font-[var(--font-ui)] text-sm text-ghost mb-8 max-w-sm mx-auto">
            No sign-up, no API key required. Your documents stay on your machine.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-7 py-3 bg-amber text-white font-[var(--font-ui)] font-semibold text-sm rounded-xl hover:bg-amber/90 transition-all cursor-pointer shadow-lg shadow-amber/20 hover:shadow-xl hover:shadow-amber/30 hover:-translate-y-0.5"
          >
            Start Writing
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-8 py-8 max-w-5xl mx-auto border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-amber/80 flex items-center justify-center">
              <PenLine size={11} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-[var(--font-ui)] text-xs font-semibold text-ghost">
              Clarity
            </span>
          </div>
          <p className="text-xs font-[var(--font-ui)] text-ghost/60">
            Open source PM writing assistant &middot; Built with React &amp; Vite
          </p>
        </div>
      </footer>

      {/* ── Animations ── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        section {
          animation: fadeInUp 0.5s ease-out both;
        }
        section:nth-child(2) { animation-delay: 0.05s; }
        section:nth-child(3) { animation-delay: 0.1s; }
        section:nth-child(4) { animation-delay: 0.15s; }
        section:nth-child(5) { animation-delay: 0.2s; }
        section:nth-child(6) { animation-delay: 0.25s; }
        section:nth-child(7) { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}

// ── Product Demo ──────────────────────────────────────────────────

const DEMO_SCREENS = [
  {
    label: 'Pick a template',
    content: (
      <div className="p-5 space-y-3">
        <div className="text-center mb-4">
          <div className="text-sm font-semibold text-text/80 mb-1">What are you writing?</div>
          <div className="w-64 mx-auto h-9 rounded-lg border border-amber/40 bg-surface flex items-center px-3">
            <span className="text-xs text-text/70">PRD for checkout redesign</span>
            <span className="ml-auto text-[10px] text-amber font-medium">PRD detected</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {['PRD', 'PRFAQ', 'One-Pager', 'Product Pitch', 'Launch Brief', 'Pricing Rec'].map((t) => (
            <div
              key={t}
              className={`text-[10px] font-medium text-center py-2 rounded-lg border transition-all ${
                t === 'PRD'
                  ? 'bg-amber/10 border-amber text-amber'
                  : 'bg-surface border-border text-ghost'
              }`}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: 'Write with ghost text',
    content: (
      <div className="p-5">
        <div className="text-xs font-semibold text-text/60 mb-1">Executive Summary</div>
        <div className="space-y-1 mb-3">
          <div className="h-[3px] bg-text/20 rounded w-full" />
          <div className="h-[3px] bg-text/20 rounded w-11/12" />
          <div className="h-[3px] bg-text/20 rounded w-9/12" />
        </div>
        <div className="text-xs font-semibold text-text/60 mb-1 mt-4">Problem Statement</div>
        <div className="text-[11px] text-text/70 leading-relaxed mb-2">
          Today, users abandon checkout at a 68% rate because the flow requires too many steps and...
        </div>
        <div className="space-y-1.5 animate-ghost-in">
          <div className="text-[10px] text-ghost/60">
            <span className="text-amber/70 font-semibold mr-1">Q:</span>
            What specific user segments are most affected?
          </div>
          <div className="text-[10px] text-ghost italic">
            <span className="not-italic text-amber/70 font-semibold mr-1">R:</span>
            Mobile users on iOS experience a 12% higher drop-off rate...
            <span className="ml-1 text-[8px] not-italic text-ghost/50 bg-bg px-1 py-0.5 rounded">Tab</span>
          </div>
        </div>
        {/* Progress dots */}
        <div className="flex items-center gap-1 mt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-amber" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber" />
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
          <span className="text-[8px] text-ghost/50 ml-1">2 of 4 dimensions</span>
        </div>
      </div>
    ),
  },
  {
    label: 'Run Clarity Check',
    content: (
      <div className="p-5">
        <div className="text-xs font-semibold text-text/60 mb-1">Goals & Success Metrics</div>
        <div className="space-y-1 mb-3">
          <div className="h-[3px] bg-text/20 rounded w-full" />
          <div className="h-[3px] bg-text/20 rounded w-10/12" />
          <div className="h-[3px] bg-text/20 rounded w-8/12" />
        </div>
        {/* Clarity Check result */}
        <div className="border-l-2 border-l-amber bg-amber-light/30 rounded-r-lg px-3 py-2.5 mt-2">
          <div className="text-[8px] font-semibold text-amber uppercase tracking-wider mb-1.5">
            Clarity Check
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] text-text/70 leading-snug">
              <span className="text-amber mr-1">→</span>
              Success metrics lack baselines — what is the current checkout completion rate?
            </p>
            <p className="text-[10px] text-text/70 leading-snug">
              <span className="text-amber mr-1">→</span>
              "Improve conversion" is vague — specify a target percentage and timeframe.
            </p>
            <p className="text-[10px] text-text/70 leading-snug">
              <span className="text-amber mr-1">→</span>
              Consider adding a counter-metric to guard against quality trade-offs.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: 'Export anywhere',
    content: (
      <div className="p-5 flex flex-col items-center justify-center h-full">
        <div className="w-48 bg-surface border border-border rounded-lg p-3 mb-4 shadow-sm">
          <div className="text-[10px] font-semibold text-text/70 mb-2">Checkout Redesign PRD</div>
          <div className="space-y-1.5">
            <div className="h-[3px] bg-text/15 rounded w-full" />
            <div className="h-[3px] bg-text/15 rounded w-11/12" />
            <div className="h-[3px] bg-text/15 rounded w-9/12" />
            <div className="h-[3px] bg-text/15 rounded w-full" />
            <div className="h-[3px] bg-text/15 rounded w-7/12" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {[
            { ext: '.md', color: 'bg-text/80' },
            { ext: '.pdf', color: 'bg-red-500' },
            { ext: '.docx', color: 'bg-blue-500' },
          ].map((f) => (
            <div key={f.ext} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface">
              <div className={`w-4 h-5 rounded-sm ${f.color} flex items-center justify-center`}>
                <span className="text-[6px] font-bold text-white">{f.ext}</span>
              </div>
              <span className="text-[10px] font-medium text-text/70">{f.ext.slice(1).toUpperCase()}</span>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-ghost/50 mt-3">One-click export to all formats</div>
      </div>
    ),
  },
];

function ProductDemo() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActiveIdx((i) => (i + 1) % DEMO_SCREENS.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Browser chrome */}
      <div className="bg-surface rounded-2xl border border-border shadow-xl overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-sidebar-bg border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="text-[10px] font-[var(--font-ui)] text-ghost/60 bg-bg rounded-md px-3 py-0.5 border border-border/60">
              clarity.app
            </div>
          </div>
        </div>

        {/* Screen content */}
        <div className="relative h-[260px] bg-bg overflow-hidden">
          {DEMO_SCREENS.map((screen, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-all duration-500 ease-in-out"
              style={{
                opacity: i === activeIdx ? 1 : 0,
                transform: i === activeIdx ? 'translateY(0)' : 'translateY(12px)',
                pointerEvents: i === activeIdx ? 'auto' : 'none',
              }}
            >
              {screen.content}
            </div>
          ))}
        </div>
      </div>

      {/* Step indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-5 justify-items-center">
        {DEMO_SCREENS.map((screen, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`flex items-center gap-1.5 text-xs font-[var(--font-ui)] transition-all cursor-pointer ${
              i === activeIdx
                ? 'text-amber font-semibold'
                : 'text-ghost/50 hover:text-ghost'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                i === activeIdx ? 'bg-amber' : 'bg-border'
              }`}
            />
            {screen.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function ValueCard({ icon, title, description }) {
  return (
    <div className="text-center px-4 py-6">
      <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center mx-auto mb-3 text-amber">
        {icon}
      </div>
      <h3 className="font-[var(--font-ui)] text-sm font-bold text-text mb-1.5">
        {title}
      </h3>
      <p className="font-[var(--font-ui)] text-xs text-ghost leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-5 bg-surface rounded-xl border border-border hover:border-amber/30 hover:shadow-sm transition-all group">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center text-amber group-hover:bg-amber group-hover:text-white transition-colors">
          {icon}
        </div>
        <h3 className="font-[var(--font-ui)] text-sm font-bold text-text">
          {title}
        </h3>
      </div>
      <p className="font-[var(--font-ui)] text-xs text-ghost leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 rounded-full bg-amber text-white font-[var(--font-ui)] text-sm font-bold flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-[var(--font-ui)] text-sm font-bold text-text mb-2">
        {title}
      </h3>
      <p className="font-[var(--font-ui)] text-xs text-ghost leading-relaxed">
        {description}
      </p>
    </div>
  );
}
