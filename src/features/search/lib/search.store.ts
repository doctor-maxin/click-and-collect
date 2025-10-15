export const useSearchStore = defineStore("search", {
  state: () => ({
    history: [] as string[],
  }),
  actions: {
    addQuery(query: string) {
      this.history.push(query);
    },
  },
  persist: true,
});
