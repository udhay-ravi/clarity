/**
 * Custom Templates — localStorage CRUD for user-uploaded example documents.
 *
 * Index key : clarity-custom-templates  (lightweight metadata array)
 * Content key: clarity-custom-tpl-{id}  (plain text per template)
 *
 * Limits: 10 templates, 50 000 chars each, 500 KB total.
 */

const INDEX_KEY = 'clarity-custom-templates';
const CONTENT_PREFIX = 'clarity-custom-tpl-';
const MAX_TEMPLATES = 10;
const MAX_CHARS_PER_TEMPLATE = 50_000;
const MAX_TOTAL_BYTES = 500_000; // ~500 KB budget

// ── Index operations ─────────────────────────────────────────────

export function loadCustomTemplateIndex() {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomTemplateIndex(index) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch (err) {
    console.warn('Clarity: Failed to save custom template index:', err.message);
  }
}

// ── CRUD ─────────────────────────────────────────────────────────

/** Load a single template with its full content. */
export function loadCustomTemplate(id) {
  const index = loadCustomTemplateIndex();
  const meta = index.find((t) => t.id === id);
  if (!meta) return null;
  try {
    const content = localStorage.getItem(CONTENT_PREFIX + id) || '';
    return { ...meta, content };
  } catch {
    return { ...meta, content: '' };
  }
}

/**
 * Save (create or update) a custom template.
 * Returns { success: true } or { success: false, error, message }.
 */
export function saveCustomTemplate({ id, name, templateType, content }) {
  if (!name?.trim()) return { success: false, error: 'MISSING_NAME', message: 'Name is required.' };
  if (!templateType?.trim()) return { success: false, error: 'MISSING_TYPE', message: 'Template type is required.' };
  if (!content?.trim()) return { success: false, error: 'MISSING_CONTENT', message: 'Content is required.' };

  if (content.length > MAX_CHARS_PER_TEMPLATE) {
    return {
      success: false,
      error: 'CONTENT_TOO_LARGE',
      message: `Content exceeds ${MAX_CHARS_PER_TEMPLATE.toLocaleString()} character limit.`,
    };
  }

  const index = loadCustomTemplateIndex();
  const isUpdate = id && index.some((t) => t.id === id);

  // Count limit (only for new templates)
  if (!isUpdate && index.length >= MAX_TEMPLATES) {
    return {
      success: false,
      error: 'LIMIT_EXCEEDED',
      message: `Maximum ${MAX_TEMPLATES} templates allowed. Delete one to add another.`,
    };
  }

  // Total size budget check
  const currentBytes = index.reduce((sum, t) => sum + (t.id === id ? 0 : (t.contentLength || 0)), 0);
  if (currentBytes + content.length > MAX_TOTAL_BYTES) {
    return {
      success: false,
      error: 'STORAGE_EXCEEDED',
      message: `Total storage would exceed ${Math.round(MAX_TOTAL_BYTES / 1000)} KB limit. Delete some templates first.`,
    };
  }

  const now = Date.now();
  const templateId = id || crypto.randomUUID();
  const meta = {
    id: templateId,
    name: name.trim(),
    templateType: templateType.trim(),
    contentLength: content.length,
    createdAt: isUpdate ? (index.find((t) => t.id === id)?.createdAt || now) : now,
    updatedAt: now,
  };

  // Update index
  const newIndex = isUpdate
    ? index.map((t) => (t.id === id ? meta : t))
    : [...index, meta];

  try {
    localStorage.setItem(CONTENT_PREFIX + templateId, content);
    saveCustomTemplateIndex(newIndex);
    return { success: true, id: templateId };
  } catch (err) {
    console.warn('Clarity: Failed to save custom template:', err.message);
    return { success: false, error: 'STORAGE_ERROR', message: 'Failed to save. Browser storage may be full.' };
  }
}

/** Delete a custom template by ID. */
export function deleteCustomTemplate(id) {
  const index = loadCustomTemplateIndex();
  const newIndex = index.filter((t) => t.id !== id);
  saveCustomTemplateIndex(newIndex);
  try {
    localStorage.removeItem(CONTENT_PREFIX + id);
  } catch {
    // Ignore removal failures
  }
}

// ── Query helpers ────────────────────────────────────────────────

/**
 * Get all custom templates for a given template type (e.g. 'prd').
 * Returns array of { id, name, content } sorted by updatedAt desc.
 */
export function getCustomTemplatesForType(templateType) {
  if (!templateType) return [];
  const index = loadCustomTemplateIndex()
    .filter((t) => t.templateType === templateType)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  return index.map((meta) => {
    try {
      const content = localStorage.getItem(CONTENT_PREFIX + meta.id) || '';
      return { id: meta.id, name: meta.name, content };
    } catch {
      return { id: meta.id, name: meta.name, content: '' };
    }
  }).filter((t) => t.content.length > 0);
}

/** Check if any custom templates exist for a given type. */
export function hasCustomTemplatesForType(templateType) {
  if (!templateType) return false;
  return loadCustomTemplateIndex().some((t) => t.templateType === templateType);
}

/** Get storage usage stats. */
export function getCustomTemplateStorageUsage() {
  const index = loadCustomTemplateIndex();
  const totalBytes = index.reduce((sum, t) => sum + (t.contentLength || 0), 0);
  return {
    count: index.length,
    maxCount: MAX_TEMPLATES,
    totalBytes,
    maxBytes: MAX_TOTAL_BYTES,
  };
}
