import type { FacetDistribution } from "meilisearch";
import type { IFiltersStore } from "../model/filters-store.model";
import type { LocationQuery } from "vue-router";

export const useFiltersStore = defineStore("filters", {
  state: (): IFiltersStore => ({
    filtersList: {
      color: null,
      size: null,
    },
    appliedFilters: {
      color: [],
      size: [],
    },
    availableFilters: {
      color: null,
      size: null,
    },

    isOpen: false,
    limit: 8,
    page: 1,
    count: 0,
  }),
  actions: {
    close() {
      this.isOpen = false;
    },
    open() {
      this.isOpen = true;
    },
    setIsOpen(val: boolean) {
      this.isOpen = val;
    },
    setFiltersList(values?: FacetDistribution) {
      if (!values) return;

      for (const [key, value] of Object.entries(values)) {
        this.filtersList[key] = Object.entries(value).map(([key, value]) => ({
          label: key,
          value: key,
        }));
      }
    },
    setAppliedFilters(appliedFilters: IFiltersStore["appliedFilters"]) {
      this.appliedFilters = appliedFilters;
    },
    setAppliedFiltersFromQuery(appliedFilters: LocationQuery) {
      for (const [key, value] of Object.entries(appliedFilters)) {
        if (value?.length === 0) continue;

        if (Array.isArray(value)) {
          this.appliedFilters[key] =
            value.filter((v) => !!v).map((v) => v?.trim() as string) ?? [];
        } else if (value) {
          this.appliedFilters[key] = [value.trim()];
        }
      }
    },
    resetFilters() {
      this.appliedFilters = {};
    },
    removeFilterValue(filter: string, value: string) {
      this.appliedFilters[filter] =
        this.appliedFilters[filter]?.filter((v) => v !== value) ?? [];

      this.appliedFilters = Object.fromEntries(
        Object.entries(this.appliedFilters).filter(
          ([key, value]) => value.length > 0,
        ),
      );
    },
    setAvailableFilters(values?: FacetDistribution) {
      if (!values) return;

      for (const [key, value] of Object.entries(values)) {
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
