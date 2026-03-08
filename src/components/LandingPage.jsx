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

export default function LandingPage({ onGetStarted }) {
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
        <button
          onClick={onGetStarted}
          className="text-sm font-[var(--font-ui)] font-medium text-amber hover:text-amber/80 transition-colors cursor-pointer"
        >
          Start Writing &rarr;
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="px-8 pt-20 pb-24 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-light/60 border border-amber/20 mb-8">
          <Zap size={13} className="text-amber" />
          <span className="text-xs font-[var(--font-ui)] font-medium text-amber">
            AI-powered writing coach for PMs
          </span>
        </div>

        <h1 className="font-[var(--font-body)] text-5xl sm:text-6xl font-bold tracking-tight text-text leading-[1.1] mb-6">
          Write PM docs that{' '}
          <span className="text-amber">actually ship</span>
        </h1>

        <p className="font-[var(--font-ui)] text-lg text-ghost max-w-xl mx-auto leading-relaxed mb-10">
          Structured templates, real-time coaching nudges, and AI feedback —
          so every PRD, one-pager, and strategy doc is clear, complete, and convincing.
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
            Free &middot; No account needed
          </span>
        </div>
      </section>

      {/* ── Value Props ── */}
      <section className="px-8 pb-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          <ValueCard
            icon={<ShieldCheck size={20} />}
            title="100% Local"
            description="Your documents and API keys never leave your machine. Everything runs client-side."
          />
          <ValueCard
            icon={<LayoutTemplate size={20} />}
            title="6 PM Templates"
            description="PRD, One-Pager, Launch Brief, Competitive Analysis, Strategy Doc, and Retro — ready to go."
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

        <div className="grid grid-cols-2 gap-5">
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

        <div className="grid grid-cols-3 gap-8">
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
        <div className="bg-white border border-border rounded-2xl px-10 py-14 shadow-sm">
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
            Open source PM writing coach &middot; Built with React &amp; Vite
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
      `}</style>
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
    <div className="p-5 bg-white rounded-xl border border-border hover:border-amber/30 hover:shadow-sm transition-all group">
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
