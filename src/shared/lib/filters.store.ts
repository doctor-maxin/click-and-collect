import type { FacetDistribution } from "meilisearch";
import type { IFiltersStore } from "../model/filters-store.model";
import type { LocationQuery } from "vue-router";
import { allowedFacets } from "./utils/prepare-filter-query";

const initialFilters: IFiltersStore = {
  filtersList: {
    color: null,
    size: null,
    ["metadata.subclass"]: null,
    ["metadata.class"]: null,
  },
  appliedFilters: {},
  availableFilters: {
    color: null,
    size: null,
    ["metadata.subclass"]: null,
    ["metadata.class"]: null,
  },

  isOpen: false,
  sort: null,
  limit: 8,
  page: 1,
  totalPages: 1,
};
export const useFiltersStore = defineStore("filters", {
  state: (): IFiltersStore => ({ ...initialFilters }),
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
      console.log("[setAppliedFilters] input", appliedFilters);
      this.appliedFilters = Object.fromEntries(
        Object.entries(appliedFilters)
          .map((input) => {
            if (input[0] === "subclass") input[0] = "metadata.subclass";
            if (input[0] === "class") input[0] = "metadata.class";
            return input;
          })
          .filter(([key, value]) => value?.length > 0),
      );
    },
    setAppliedFiltersFromQuery(appliedFilters: LocationQuery) {
      console.log("[setAppliedFiltersFromQuery] input", appliedFilters);
      this.appliedFilters = {};
      for (let [key, value] of Object.entries(appliedFilters)) {
        if (key === "subclass") key = "metadata.subclass";
        if (key === "class") key = "metadata.class";
        if (value?.length === 0 || !allowedFacets.includes(key)) continue;

        if (Array.isArray(value)) {
          this.appliedFilters[key] =
            value.filter((v) => !!v).map((v) => v?.trim() as string) ?? [];
        } else if (value) {
          this.appliedFilters[key] = [value.trim()];
        }
      }
      console.log("[setAppliedFiltersFromQuery] output", this.appliedFilters);
    },
    resetFilters() {
      console.log("[resetFilters]");
      this.appliedFilters = {};
    },
    removeFilterValue(filter: string, value: string) {
      console.log("[removeFilterValue]");
      this.appliedFilters[filter] =
        this.appliedFilters[filter]?.filter((v) => v !== value) ?? [];

      if (this.appliedFilters[filter]?.length === 0) {
        delete this.appliedFilters[filter];
      }
    },
    setFilterValue(filter: string, value: string) {
      console.log("[setFilterValue]");
      if (!this.appliedFilters[filter]) {
        this.appliedFilters[filter] = [];
      }
      const trimmedValue = value.trim();
      if (!this.appliedFilters[filter].includes(trimmedValue)) {
        this.appliedFilters[filter] = [
          ...this.appliedFilters[filter],
          trimmedValue,
        ];
      }
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
