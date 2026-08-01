import { apiGet, apiPut } from './api.js';

const stores = [];

export function createApiStore({ seed = [], listPath, bulkPath }) {
  let cache = Array.isArray(seed) ? seed : [];
  let loaded = false;

  async function refresh() {
    if (typeof window === 'undefined') return cache;
    try {
      const list = await apiGet(listPath);
      const rows = Array.isArray(list) ? list : (list.data || list.records || []);
      cache = rows;
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

  function setCache(next) {
    cache = next;
  }

  function reset() {
    cache = [];
    loaded = false;
  }

  const store = { refresh, load, save, setCache, reset };
  stores.push(store);
  return store;
}

export function refreshAllStores() {
  stores.forEach((s) => s.refresh());
}

export function resetAllStores() {
  stores.forEach((s) => s.reset());
}
