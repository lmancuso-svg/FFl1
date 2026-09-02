// Replicates the window.storage API the component was built against
// (Anthropic's artifact storage), backed by real browser localStorage,
// so DraftAssistant.jsx works unmodified outside Claude.ai.
// NOTE: this is per-browser/per-device only — it will not sync between
// your phone and laptop. See the README for options to fix that.

function prefixFor(shared) {
  return shared ? "ff-shared:" : "ff-personal:";
}

window.storage = {
  async get(key, shared = false) {
    const raw = localStorage.getItem(prefixFor(shared) + key);
    if (raw === null) throw new Error("key not found");
    return { key, value: raw, shared };
  },
  async set(key, value, shared = false) {
    localStorage.setItem(prefixFor(shared) + key, value);
    return { key, value, shared };
  },
  async delete(key, shared = false) {
    localStorage.removeItem(prefixFor(shared) + key);
    return { key, deleted: true, shared };
  },
  async list(prefix = "", shared = false) {
    const full = prefixFor(shared) + prefix;
    const keys = Object.keys(localStorage)
      .filter((k) => k.startsWith(full))
      .map((k) => k.slice(prefixFor(shared).length));
    return { keys, prefix, shared };
  },
};
