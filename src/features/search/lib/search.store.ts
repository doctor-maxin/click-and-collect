const normalizeQuery = (value: string) => value.replace(/\s+/g, " ").trim();

export const useSearchStore = defineStore("search", {
  state: () => ({
    history: [] as string[],
  }),
  getters: {
    normalizedHistory: (state) => {
      const unique = new Set<string>();
      const list: string[] = [];

      for (const item of state.history) {
        const normalized = normalizeQuery(item);
        if (!normalized || unique.has(normalized)) continue;
        unique.add(normalized);
        list.push(normalized);
      }

      return list;
    },
  },
  actions: {
    addQuery(query: string) {
      const normalized = normalizeQuery(query);
      if (!normalized) return;

      this.history = [
        normalized,
        ...this.normalizedHistory.filter((item) => item !== normalized),
      ];
    },
  },
  persist: true,
});
