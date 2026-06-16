import { useState, useCallback } from 'react';

export interface AppSettings {
  resendApiKey: string;
  linearIntakeEmail: string;
  resendFrom: string;
}

const STORAGE_KEY = 'mdx-annotator-settings';

const DEFAULTS: AppSettings = {
  resendApiKey: '',
  linearIntakeEmail: '',
  resendFrom: '',
};

function load(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(load);

  const save = useCallback((next: AppSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSettings(next);
  }, []);

  const isConfigured =
    settings.resendApiKey.trim() !== '' && settings.linearIntakeEmail.trim() !== '';

  return { settings, save, isConfigured };
}
