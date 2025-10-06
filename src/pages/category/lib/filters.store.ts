import type { FacetDistribution } from "meilisearch";
import type { IFiltersStore } from "../model/filters-store.model";

export const useFiltersStore = defineStore("filters", {
  state: (): IFiltersStore => ({
    filtersList: {
      color: null,
      size: null,
    },
    appliedFilters: [],
    availableFilters: {
      color: null,
      size: null,
    },

    limit: 8,
    page: 1,
    count: 0,
  }),
  actions: {
    setFiltersList(values?: FacetDistribution) {
      if (!values) return;

      for (const [key, value] of Object.entries(values)) {
        this.filtersList[key] = Object.entries(value).map(([key, value]) => ({
          label: key,
          value: key,
        }));
      }
    },
    setAppliedFilters(appliedFilters: any[]) {
      this.appliedFilters = appliedFilters;
    },
    setAvailableFilters(values?: FacetDistribution) {
      if (!values) return;

      for (const [key, value] of Object.entries(values)) {
        console.log("value", value);
        this.availableFilters[key] = Object.entries(value)
          .filter(([key, value]) => value > 0)
          .map(([key]) => ({ label: key, value: key }));
      }
    },
    setPage(page: number) {
      this.page = page;
    },
    setCount(count: number) {
      this.count = count;
    },
  },
});
