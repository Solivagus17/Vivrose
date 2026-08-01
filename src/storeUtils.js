import { apiGet, apiPut } from './api.js';

const stores = [];

export function createApiStore({ seed, listPath, bulkPath }) {
  let cache = seed;
  let loaded = false;
  const seededKey = `vivrose.seeded.${listPath}`;

  async function refresh() {
    if (typeof window === 'undefined') return cache;
    try {
      const list = await apiGet(listPath);
      const rows = Array.isArray(list) ? list : (list.data || list.records || []);
      if (rows.length === 0 && seed.length && !window.localStorage.getItem(seededKey)) {
        window.localStorage.setItem(seededKey, '1');
        apiPut(bulkPath, seed).catch(() => {});
        cache = seed;
      } else {
        cache = rows;
      }
      loaded = true;
      return cache;
    } catch {
      return cache;
    }
  }

  function load() {
    if (typeof window !== 'undefined' && !loaded) refresh();
    return cache;
  }

  function save(list) {
    cache = list;
    if (typeof window !== 'undefined') apiPut(bulkPath, list).catch(() => {});
  }

  function reset() {
    cache = seed;
    loaded = false;
  }

  const store = { refresh, load, save, reset };
  stores.push(store);
  return store;
}

export function refreshAllStores() {
  stores.forEach((s) => s.refresh());
}

export function resetAllStores() {
  stores.forEach((s) => s.reset());
}
