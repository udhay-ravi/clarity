import { useState, useMemo, useCallback } from 'react';

const TYPE_LABELS = {
  prd: 'PRD', prfaq: 'PRFAQ', onePager: '1P', launchBrief: 'LAUNCH',
  competitiveAnalysis: 'COMP', strategyDoc: 'STRAT', retrospective: 'RETRO',
  pricingProposal: 'PRICING', productOnePager: 'P1P', productPitch: 'PITCH',
  packagingRecommendation: 'PKG',
};

const PROJECT_COLORS = [
  { name: 'amber', dot: 'bg-amber-400', bg: 'bg-amber-400/10' },
  { name: 'blue', dot: 'bg-blue-400', bg: 'bg-blue-400/10' },
  { name: 'purple', dot: 'bg-purple-400', bg: 'bg-purple-400/10' },
  { name: 'green', dot: 'bg-green-400', bg: 'bg-green-400/10' },
  { name: 'rose', dot: 'bg-rose-400', bg: 'bg-rose-400/10' },
  { name: 'teal', dot: 'bg-teal-400', bg: 'bg-teal-400/10' },
];

function colorFor(name) {
  return PROJECT_COLORS.find((c) => c.name === name) || PROJECT_COLORS[0];
}

function relativeTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotesSidebar({
  docs,
  projects,
  activeDocId,
  onSelectNote,
  onNewNote,
  onDeleteNote,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onAssignDocToProject,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [addingProject, setAddingProject] = useState(false);

  const filteredDocs = useMemo(() => {
    let list = [...docs];
    // Filter by project
    if (selectedProjectId) {
      list = list.filter((d) => d.projectId === selectedProjectId);
    }
    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((d) => (d.title || '').toLowerCase().includes(q));
    }
    // Sort by updatedAt desc
    list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return list;
  }, [docs, searchQuery, selectedProjectId]);

  const handleNewProject = useCallback(() => {
    if (!newProjectName.trim()) return;
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length].name;
    onCreateProject(newProjectName.trim(), color);
    setNewProjectName('');
    setAddingProject(false);
  }, [newProjectName, projects.length, onCreateProject]);

  return (
    <div className="w-60 shrink-0 border-r border-border bg-sidebar-bg flex flex-col overflow-hidden font-[var(--font-ui)]">
      {/* New Note + Search */}
      <div className="p-3 space-y-2">
        <button
          onClick={onNewNote}
          className="w-full py-2 text-sm font-medium rounded-lg bg-amber/15 text-amber hover:bg-amber/25 transition-colors"
        >
          + New Note
        </button>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full px-3 py-1.5 text-xs bg-bg border border-border rounded-lg text-text placeholder-ghost outline-none focus:border-amber/50"
        />
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filteredDocs.map((doc) => {
          const isActive = doc.id === activeDocId;
          return (
            <div
              key={doc.id}
              onClick={() => onSelectNote(doc.id)}
              tabIndex={0}
              className={`w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-colors group cursor-pointer ${
                isActive
                  ? 'bg-amber/10 border-l-2 border-amber'
                  : 'hover:bg-amber/5 border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-text truncate flex-1">
                  {doc.title || 'Untitled'}
                </span>
                {doc.type && doc.type !== 'blank' && (
                  <span className="text-[9px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded bg-amber/15 text-amber shrink-0">
                    {TYPE_LABELS[doc.type] || doc.type}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-ghost">{relativeTime(doc.updatedAt)}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(doc.id);
                  }}
                  className="text-[10px] text-ghost opacity-0 group-hover:opacity-100 hover:text-red-400 ml-auto cursor-pointer"
                  title="Delete"
                >
                  &#10005;
                </span>
              </div>
            </div>
          );
        })}

        {filteredDocs.length === 0 && (
          <p className="text-xs text-ghost text-center py-6 opacity-60">No notes yet</p>
        )}
      </div>

      {/* Projects */}
      <div className="border-t border-border px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ghost">Projects</span>
          <button
            onClick={() => setAddingProject(true)}
            className="text-xs text-ghost hover:text-amber"
          >
            +
          </button>
        </div>

        {/* All notes filter */}
        <button
          onClick={() => setSelectedProjectId(null)}
          className={`w-full text-left text-xs px-2 py-1 rounded ${
            !selectedProjectId ? 'text-amber font-medium' : 'text-ghost hover:text-text'
          }`}
        >
          All Notes
        </button>

        {projects.map((proj) => {
          const c = colorFor(proj.color);
          return (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id === selectedProjectId ? null : proj.id)}
              className={`w-full text-left text-xs px-2 py-1 rounded flex items-center gap-1.5 ${
                selectedProjectId === proj.id ? 'text-amber font-medium' : 'text-ghost hover:text-text'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className="truncate">{proj.name}</span>
            </button>
          );
        })}

        {addingProject && (
          <input
            type="text"
            autoFocus
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNewProject();
              if (e.key === 'Escape') { setAddingProject(false); setNewProjectName(''); }
            }}
            onBlur={() => { setAddingProject(false); setNewProjectName(''); }}
            placeholder="Project name..."
            className="w-full mt-1 px-2 py-1 text-xs bg-bg border border-border rounded text-text outline-none"
          />
        )}
      </div>
    </div>
  );
}
