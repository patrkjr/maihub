import { useEffect, useRef, useState } from 'react';

const STORAGE_PREFIX = 'maihub:app:';
const LEGACY_STORAGE_PREFIX = 'mastermind:app:';

const storageKey = (appId) => `${STORAGE_PREFIX}${appId}`;
const legacyStorageKey = (appId) => `${LEGACY_STORAGE_PREFIX}${appId}`;

/**
 * Read persisted data for one app. Keys are isolated per `appId` so new apps
 * can use their own slice without colliding.
 */
export function readAppStorage(appId, defaultState) {
  try {
    let raw = localStorage.getItem(storageKey(appId));
    if (raw == null) {
      raw = localStorage.getItem(legacyStorageKey(appId));
      if (raw != null) {
        localStorage.setItem(storageKey(appId), raw);
        localStorage.removeItem(legacyStorageKey(appId));
      }
    }
    if (raw == null) return defaultState;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { ...defaultState, ...parsed };
    }
    return defaultState;
  } catch {
    return defaultState;
  }
}

export function writeAppStorage(appId, data) {
  try {
    localStorage.setItem(storageKey(appId), JSON.stringify(data));
  } catch {
    // quota or private mode — ignore
  }
}

/**
 * JSON-serializable state for one app, synced to localStorage.
 * Pass a stable `defaultState` (e.g. constant outside the component).
 */
export function useAppStorage(appId, defaultState) {
  const defaultRef = useRef(defaultState);
  useEffect(() => {
    defaultRef.current = defaultState;
  });

  const [state, setState] = useState(() => readAppStorage(appId, defaultState));

  useEffect(() => {
    setState(readAppStorage(appId, defaultRef.current));
  }, [appId]);

  useEffect(() => {
    writeAppStorage(appId, state);
  }, [appId, state]);

  return [state, setState];
}
