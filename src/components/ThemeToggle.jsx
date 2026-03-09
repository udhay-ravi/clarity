import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getEditorPrefs, applyEditorPrefs, savePrefs } from './SettingsModal';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  // Stay in sync when Settings modal (or anything else) toggles .dark class
  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleToggle = () => {
    const prefs = getEditorPrefs();
    let nextTheme;
    if (prefs.theme === 'system') {
      nextTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
    } else {
      nextTheme = prefs.theme === 'dark' ? 'light' : 'dark';
    }
    const next = { ...prefs, theme: nextTheme };
    savePrefs(next);
    applyEditorPrefs(next);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 text-ghost hover:text-text hover:bg-sidebar-bg rounded-lg transition-colors cursor-pointer"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
