import type { FacetDistribution } from "meilisearch";
import type { IFiltersStore } from "../model/filters-store.model";
import type { LocationQuery } from "vue-router";
import { allowedFacets } from "./utils/prepare-filter-query";

export const useFiltersStore = defineStore("filters", {
  state: (): IFiltersStore => ({
    filtersList: {
      color: null,
      size: null,
      subclass: null,
    },
    appliedFilters: {},
    availableFilters: {
      color: null,
      size: null,
      subclass: null,
    },

    isOpen: false,
    sort: null,
    limit: 8,
    page: 1,
    totalPages: 1,
  }),
  actions: {
    close() {
      this.isOpen = false;
    },
    open() {
      this.isOpen = true;
    },
    setSort(sort: string | null) {
      this.sort = sort;
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
      this.appliedFilters = Object.fromEntries(
        Object.entries(appliedFilters).filter(
          ([key, value]) => value?.length > 0,
        ),
      );
    },
    setAppliedFiltersFromQuery(appliedFilters: LocationQuery) {
      for (const [key, value] of Object.entries(appliedFilters)) {
        if (value?.length === 0 || !allowedFacets.includes(key)) continue;

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
          ([key, value]) => value?.length > 0,
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
    setTotalPages(totalPages: number) {
      this.totalPages = totalPages;
    },
  },
});
