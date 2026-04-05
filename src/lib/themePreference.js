export const THEME_STORAGE_KEY = 'maihub:theme';

const LEGACY_THEME_STORAGE_KEY = 'mastermind:theme';

/** @typedef {'light' | 'dark' | 'system'} ThemePreference */

/** @returns {ThemePreference} */
export function readThemePreference() {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
    const legacy = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (legacy === 'light' || legacy === 'dark' || legacy === 'system') {
      localStorage.setItem(THEME_STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
      return legacy;
    }
  } catch {
    // ignore
  }
  return 'system';
}

/** @param {ThemePreference} value */
export function writeThemePreference(value) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, value);
    localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
  } catch {
    // ignore
  }
}
