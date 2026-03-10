/**
 * Multi-document localStorage layer for Clarity.
 *
 * Two-key design:
 *   - Index  (`clarity-docs-index`):  lightweight list of all docs (id, title, type, timestamps, wordCount)
 *   - Docs   (`clarity-doc-{id}`):    full document payload
 *
 * Legacy migration:  If the old single-draft key (`clarity-draft`) exists and the
 * new index does not, the draft is migrated into the new structure automatically.
 */

import { sectionsToSingleDoc, tipTapDocToText } from './contentModel';

const INDEX_KEY = 'clarity-docs-index';
const DOC_PREFIX = 'clarity-doc-';
const LEGACY_KEY = 'clarity-draft';
const PROJECTS_KEY = 'clarity-projects';

// ---------------------------------------------------------------------------
// Index helpers
// ---------------------------------------------------------------------------

function emptyIndex() {
  return { version: 1, activeDocId: null, docs: [] };
}

export function loadIndex() {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load docs index:', e);
  }
  return emptyIndex();
}

export function saveIndex(index) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    console.warn('Failed to save docs index:', e);
  }
}

// ---------------------------------------------------------------------------
// Document CRUD
// ---------------------------------------------------------------------------

export function loadDocument(id) {
  try {
    const raw = localStorage.getItem(DOC_PREFIX + id);
    if (raw) {
      const doc = JSON.parse(raw);
      return migrateDocV2(doc);
    }
  } catch (e) {
    console.warn('Failed to load document:', e);
  }
  return null;
}

export function saveDocument(doc) {
  if (!doc || !doc.id) return;

  const now = Date.now();
  doc.updatedAt = now;

  // Persist full document
  try {
    localStorage.setItem(DOC_PREFIX + doc.id, JSON.stringify(doc));
  } catch (e) {
    console.warn('Failed to save document:', e);
    return;
  }

  // Update index metadata
  const index = loadIndex();
  // V2: word count from body string; V1 fallback from sections
  let wordCount = 0;
  if (doc.body != null) {
    wordCount = (doc.body || '').split(/\s+/).filter(Boolean).length;
  } else {
    wordCount = (doc.sections || []).reduce((n, s) => {
      return n + (s.body || '').split(/\s+/).filter(Boolean).length;
    }, 0);
  }

  const entry = index.docs.find((d) => d.id === doc.id);
  if (entry) {
    entry.title = doc.title || 'Untitled';
    entry.type = doc.type || 'blank';
    entry.updatedAt = now;
    entry.wordCount = wordCount;
  } else {
    index.docs.push({
      id: doc.id,
      title: doc.title || 'Untitled',
      type: doc.type || 'blank',
      createdAt: doc.createdAt || now,
      updatedAt: now,
      wordCount,
    });
  }

  index.activeDocId = doc.id;
  saveIndex(index);
}

export function createNewDocument(doc) {
  const now = Date.now();
  const id = crypto.randomUUID();
  const newDoc = { ...doc, id, createdAt: now, updatedAt: now };
  saveDocument(newDoc);
  return newDoc;
}

export function deleteDocument(id) {
  try {
    localStorage.removeItem(DOC_PREFIX + id);
  } catch (e) {
    console.warn('Failed to remove document:', e);
  }

  const index = loadIndex();
  index.docs = index.docs.filter((d) => d.id !== id);

  if (index.activeDocId === id) {
    index.activeDocId = null;
  }

  saveIndex(index);
  return index;
}

// ---------------------------------------------------------------------------
// Active doc helpers
// ---------------------------------------------------------------------------

export function getActiveDocId() {
  return loadIndex().activeDocId;
}

export function setActiveDocId(id) {
  const index = loadIndex();
  index.activeDocId = id;
  saveIndex(index);
}

// ---------------------------------------------------------------------------
// Project CRUD
// ---------------------------------------------------------------------------

export function loadProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load projects:', e);
  }
  return [];
}

export function saveProjects(projects) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('Failed to save projects:', e);
  }
}

export function createProject(name, color) {
  const projects = loadProjects();
  const project = { id: crypto.randomUUID(), name, color, createdAt: Date.now() };
  projects.push(project);
  saveProjects(projects);
  return project;
}

export function renameProject(id, newName) {
  const projects = loadProjects();
  const p = projects.find((proj) => proj.id === id);
  if (p) {
    p.name = newName;
    saveProjects(projects);
  }
  return projects;
}

export function deleteProject(id) {
  let projects = loadProjects();
  projects = projects.filter((p) => p.id !== id);
  saveProjects(projects);

  // Unassign any docs that belonged to this project
  const index = loadIndex();
  for (const doc of index.docs) {
    if (doc.projectId === id) {
      doc.projectId = null;
    }
  }
  saveIndex(index);

  return { projects, index };
}

export function assignDocToProject(docId, projectId) {
  const index = loadIndex();
  const entry = index.docs.find((d) => d.id === docId);
  if (entry) {
    entry.projectId = projectId || null;
    saveIndex(index);
  }
  return index;
}

// ---------------------------------------------------------------------------
// V2 helpers: single-body note format
// ---------------------------------------------------------------------------

/**
 * Create a blank note in V2 format (single TipTap body, no sections).
 */
export function createBlankNote() {
  return {
    title: 'Untitled',
    type: null,
    content: { type: 'doc', content: [{ type: 'paragraph' }] },
    body: '',
  };
}

/**
 * Lazy-migrate a V1 sectioned document to V2 single-body format.
 * If the doc already has `content` (TipTap JSON) and no `sections`, it's V2.
 */
export function migrateDocV2(doc) {
  if (!doc) return doc;
  // Already V2
  if (doc.content && !doc.sections) return doc;
  // Has sections → migrate
  if (doc.sections) {
    const content = sectionsToSingleDoc(doc.sections, doc.preface);
    const body = tipTapDocToText(content);
    const migrated = { ...doc, content, body };
    // Remove old fields
    delete migrated.sections;
    delete migrated.preface;
    return migrated;
  }
  // Edge case: no sections AND no content
  return {
    ...doc,
    content: { type: 'doc', content: [{ type: 'paragraph' }] },
    body: '',
  };
}

// ---------------------------------------------------------------------------
// Legacy migration
// ---------------------------------------------------------------------------

export function migrateIfNeeded() {
  const indexExists = localStorage.getItem(INDEX_KEY);
  if (indexExists) return; // already migrated

  const legacyRaw = localStorage.getItem(LEGACY_KEY);
  if (!legacyRaw) return; // nothing to migrate

  try {
    const draft = JSON.parse(legacyRaw);
    if (draft && draft.sections && draft.sections.length > 0) {
      const now = Date.now();
      const id = crypto.randomUUID();
      const doc = {
        ...draft,
        id,
        createdAt: draft.savedAt || now,
        updatedAt: draft.savedAt || now,
      };

      // Save full doc
      localStorage.setItem(DOC_PREFIX + id, JSON.stringify(doc));

      // Build index
      const wordCount = (doc.sections || []).reduce((n, s) => {
        return n + (s.body || '').split(/\s+/).filter(Boolean).length;
      }, 0);

      const index = {
        version: 1,
        activeDocId: id,
        docs: [
          {
            id,
            title: doc.title || 'Untitled',
            type: doc.type || 'blank',
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            wordCount,
          },
        ],
      };

      saveIndex(index);

      // Remove legacy key
      localStorage.removeItem(LEGACY_KEY);

      console.log('Migrated legacy draft to document library.');
    }
  } catch (e) {
    console.warn('Legacy migration failed:', e);
  }
}
