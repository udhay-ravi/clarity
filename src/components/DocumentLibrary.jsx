import { useState, useEffect, useRef, useCallback } from 'react';
import { PenLine, FilePlus, Trash2, FileText, Clock, Type, Settings, FolderOpen, Plus, MoreHorizontal, Check, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const PROJECT_COLORS = [
  { id: 'blue', dot: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-600' },
  { id: 'purple', dot: 'bg-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-600' },
  { id: 'green', dot: 'bg-green-500', bg: 'bg-green-500/10', text: 'text-green-600' },
  { id: 'orange', dot: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-600' },
  { id: 'rose', dot: 'bg-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-600' },
  { id: 'teal', dot: 'bg-teal-500', bg: 'bg-teal-500/10', text: 'text-teal-600' },
];

function getColorClasses(colorId) {
  return PROJECT_COLORS.find((c) => c.id === colorId) || PROJECT_COLORS[0];
}

function formatRelativeDate(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function typeBadge(type) {
  const map = {
    onePager: { label: 'One-Pager', color: 'bg-blue-500/10 text-blue-600' },
    prd: { label: 'PRD', color: 'bg-purple-500/10 text-purple-600' },
    launchBrief: { label: 'Launch Brief', color: 'bg-orange-500/10 text-orange-600' },
    competitiveAnalysis: { label: 'Comp Analysis', color: 'bg-teal-500/10 text-teal-600' },
    strategyDoc: { label: 'Strategy', color: 'bg-green-500/10 text-green-600' },
    retrospective: { label: 'Retro', color: 'bg-rose-500/10 text-rose-600' },
    blank: { label: 'Blank', color: 'bg-gray-500/10 text-gray-500' },
  };
  const info = map[type] || map.blank;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-[var(--font-ui)] uppercase tracking-wider ${info.color}`}>
      {info.label}
    </span>
  );
}

export default function DocumentLibrary({
  docs,
  projects = [],
  onOpenDoc,
  onNewDoc,
  onDeleteDoc,
  onOpenSettings,
  onGoToLanding,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onAssignDocToProject,
}) {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [docMenuOpenId, setDocMenuOpenId] = useState(null);

  // New project form
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('blue');
  const newProjectInputRef = useRef(null);

  // Project rename
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const editProjectInputRef = useRef(null);

  // Project context menu
  const [projectMenuId, setProjectMenuId] = useState(null);

  // Close doc move menu on outside click
  const docMenuRef = useRef(null);
  useEffect(() => {
    if (!docMenuOpenId) return;
    const handler = (e) => {
      if (docMenuRef.current && !docMenuRef.current.contains(e.target)) {
        setDocMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [docMenuOpenId]);

  // Close project context menu on outside click
  useEffect(() => {
    if (!projectMenuId) return;
    const handler = () => setProjectMenuId(null);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [projectMenuId]);

  // Focus new project input
  useEffect(() => {
    if (showNewProject) newProjectInputRef.current?.focus();
  }, [showNewProject]);

  // Focus edit input
  useEffect(() => {
    if (editingProjectId) editProjectInputRef.current?.focus();
  }, [editingProjectId]);

  // Filter and sort docs
  const filteredDocs = selectedProjectId
    ? docs.filter((d) => d.projectId === selectedProjectId)
    : docs;
  const sorted = [...filteredDocs].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const headerTitle = selectedProject ? selectedProject.name : 'All Documents';
  const headerCount = filteredDocs.length;

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    onCreateProject?.(newProjectName.trim(), newProjectColor);
    setNewProjectName('');
    setNewProjectColor('blue');
    setShowNewProject(false);
  };

  const handleRenameSubmit = () => {
    if (editingProjectName.trim() && editingProjectId) {
      onRenameProject?.(editingProjectId, editingProjectName.trim());
    }
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  const handleDeleteProject = (id) => {
    onDeleteProject?.(id);
    setProjectMenuId(null);
    if (selectedProjectId === id) setSelectedProjectId(null);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 border-r border-border bg-sidebar-bg flex flex-col">
        <div className="px-4 pt-5 pb-2">
          <button
            onClick={onGoToLanding}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
            title="Back to Home"
          >
            <div className="w-7 h-7 rounded-lg bg-amber flex items-center justify-center">
              <PenLine size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold font-[var(--font-ui)] text-text tracking-tight">Clarity</span>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {/* All Documents */}
          <button
            onClick={() => setSelectedProjectId(null)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-[var(--font-ui)] transition-colors cursor-pointer ${
              selectedProjectId === null
                ? 'bg-amber-light/40 text-amber font-semibold'
                : 'text-ghost hover:text-text hover:bg-surface'
            }`}
          >
            <FileText size={14} />
            <span className="flex-1 text-left">All Documents</span>
            <span className="text-[11px] text-ghost/60">{docs.length}</span>
          </button>

          {/* Divider if projects exist */}
          {projects.length > 0 && <div className="h-px bg-border my-2" />}

          {/* Projects */}
          {projects.map((project) => {
            const color = getColorClasses(project.color);
            const count = docs.filter((d) => d.projectId === project.id).length;

            // Editing mode
            if (editingProjectId === project.id) {
              return (
                <div key={project.id} className="flex items-center gap-1.5 px-2 py-1">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.dot}`} />
                  <input
                    ref={editProjectInputRef}
                    value={editingProjectName}
                    onChange={(e) => setEditingProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit();
                      if (e.key === 'Escape') { setEditingProjectId(null); setEditingProjectName(''); }
                    }}
                    className="flex-1 min-w-0 text-sm font-[var(--font-ui)] bg-surface border border-border rounded px-1.5 py-0.5 outline-none focus:border-amber text-text"
                  />
                  <button onClick={handleRenameSubmit} className="p-0.5 text-green-600 hover:text-green-700 cursor-pointer"><Check size={13} /></button>
                  <button onClick={() => { setEditingProjectId(null); setEditingProjectName(''); }} className="p-0.5 text-ghost hover:text-text cursor-pointer"><X size={13} /></button>
                </div>
              );
            }

            return (
              <div key={project.id} className="group/proj relative flex items-center">
                <button
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-[var(--font-ui)] transition-colors cursor-pointer ${
                    selectedProjectId === project.id
                      ? 'bg-amber-light/40 text-amber font-semibold'
                      : 'text-ghost hover:text-text hover:bg-surface'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.dot}`} />
                  <span className="flex-1 text-left truncate">{project.name}</span>
                  <span className="text-[11px] text-ghost/60">{count}</span>
                </button>

                {/* Context menu trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProjectMenuId(projectMenuId === project.id ? null : project.id);
                  }}
                  className="absolute right-1 p-1 text-ghost/30 hover:text-text rounded opacity-0 group-hover/proj:opacity-100 transition-opacity cursor-pointer"
                >
                  <MoreHorizontal size={13} />
                </button>

                {/* Context menu */}
                {projectMenuId === project.id && (
                  <div
                    className="absolute right-0 top-full mt-1 w-32 bg-surface border border-border rounded-lg shadow-lg z-30 py-1"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setEditingProjectId(project.id);
                        setEditingProjectName(project.name);
                        setProjectMenuId(null);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-[var(--font-ui)] text-ghost hover:text-text hover:bg-sidebar-bg transition-colors cursor-pointer"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="w-full text-left px-3 py-1.5 text-xs font-[var(--font-ui)] text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* New project form */}
          {showNewProject ? (
            <div className="px-2 py-2 space-y-2">
              <input
                ref={newProjectInputRef}
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') { setShowNewProject(false); setNewProjectName(''); }
                }}
                placeholder="Project name"
                className="w-full text-sm font-[var(--font-ui)] bg-surface border border-border rounded-md px-2.5 py-1.5 outline-none focus:border-amber text-text placeholder:text-ghost/40"
              />
              <div className="flex items-center gap-1.5">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setNewProjectColor(c.id)}
                    className={`w-5 h-5 rounded-full ${c.dot} cursor-pointer transition-all ${
                      newProjectColor === c.id ? 'ring-2 ring-offset-1 ring-amber scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCreateProject}
                  className="px-2.5 py-1 text-[11px] font-[var(--font-ui)] font-medium bg-amber text-white rounded hover:bg-amber/90 transition-colors cursor-pointer"
                >
                  Create
                </button>
                <button
                  onClick={() => { setShowNewProject(false); setNewProjectName(''); }}
                  className="px-2.5 py-1 text-[11px] font-[var(--font-ui)] font-medium text-ghost bg-sidebar-bg rounded hover:bg-border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewProject(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-[var(--font-ui)] text-ghost/50 hover:text-text hover:bg-surface transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>New Project</span>
            </button>
          )}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center px-6 py-12 overflow-y-auto">
        {/* Header */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-[var(--font-ui)] text-text">{headerTitle}</h1>
            <p className="text-sm font-[var(--font-ui)] text-ghost mt-1">
              {headerCount} {headerCount === 1 ? 'document' : 'documents'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onOpenSettings}
              className="p-2.5 text-ghost hover:text-text hover:bg-sidebar-bg rounded-lg transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={onNewDoc}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber text-white font-[var(--font-ui)] font-medium text-sm rounded-lg hover:bg-amber/90 transition-colors cursor-pointer"
            >
              <FilePlus size={16} />
              New Document
            </button>
          </div>
        </div>

        {/* Doc list */}
        <div className="w-full max-w-2xl space-y-2">
          {sorted.length === 0 && (
            <div className="text-center py-16">
              <FileText size={40} className="mx-auto text-ghost/30 mb-4" />
              <p className="text-sm font-[var(--font-ui)] text-ghost">
                {selectedProjectId ? 'No documents in this project yet.' : 'No documents yet. Create your first one!'}
              </p>
            </div>
          )}

          {sorted.map((doc) => {
            const docProject = projects.find((p) => p.id === doc.projectId);

            return (
              <div
                key={doc.id}
                className="group flex items-center gap-4 p-4 bg-surface rounded-lg border border-border hover:border-amber/40 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => onOpenDoc(doc.id)}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-amber-light/40 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-amber" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold font-[var(--font-ui)] text-text truncate">
                      {doc.title || 'Untitled'}
                    </span>
                    {typeBadge(doc.type)}
                    {docProject && !selectedProjectId && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium font-[var(--font-ui)] ${getColorClasses(docProject.color).bg} ${getColorClasses(docProject.color).text}`}>
                        {docProject.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-[var(--font-ui)] text-ghost">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatRelativeDate(doc.updatedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Type size={11} />
                      {doc.wordCount || 0} words
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {/* Move to project */}
                  {projects.length > 0 && (
                    <div className="relative" ref={docMenuOpenId === doc.id ? docMenuRef : undefined}>
                      <button
                        onClick={() => setDocMenuOpenId(docMenuOpenId === doc.id ? null : doc.id)}
                        className="p-1.5 text-ghost/40 hover:text-amber rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Move to project"
                      >
                        <FolderOpen size={15} />
                      </button>
                      {docMenuOpenId === doc.id && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border rounded-lg shadow-lg z-20 py-1">
                          <button
                            onClick={() => { onAssignDocToProject?.(doc.id, null); setDocMenuOpenId(null); }}
                            className={`w-full text-left px-3 py-1.5 text-xs font-[var(--font-ui)] transition-colors cursor-pointer ${
                              !doc.projectId ? 'text-amber font-semibold' : 'text-ghost hover:text-text hover:bg-sidebar-bg'
                            }`}
                          >
                            No project
                          </button>
                          {projects.map((p) => {
                            const c = getColorClasses(p.color);
                            return (
                              <button
                                key={p.id}
                                onClick={() => { onAssignDocToProject?.(doc.id, p.id); setDocMenuOpenId(null); }}
                                className={`w-full text-left px-3 py-1.5 text-xs font-[var(--font-ui)] flex items-center gap-2 transition-colors cursor-pointer ${
                                  doc.projectId === p.id ? 'text-amber font-semibold' : 'text-ghost hover:text-text hover:bg-sidebar-bg'
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                                {p.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delete */}
                  {confirmDeleteId === doc.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { onDeleteDoc(doc.id); setConfirmDeleteId(null); }}
                        className="px-2.5 py-1 text-[11px] font-[var(--font-ui)] font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 text-[11px] font-[var(--font-ui)] font-medium text-ghost bg-sidebar-bg rounded hover:bg-border transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(doc.id)}
                      className="p-1.5 text-ghost/40 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
