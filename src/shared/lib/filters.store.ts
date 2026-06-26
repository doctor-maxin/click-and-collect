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
        is_discounted: null,
    },
    appliedFilters: {},
    availableFilters: {
        color: null,
        size: null,
        ["metadata.subclass"]: null,
        ["metadata.class"]: null,
        is_discounted: null,
    },

    isOpen: false,
    sort: null,
    lastAppliedInput: null,
    limit: 8,
    enableAutoload: false,
    page: 1,
    totalPages: 1,
    isOfflineEnabled: false,
    isOnlineEnabled: false,
};
export const useFiltersStore = defineStore("filters", {
    state: (): IFiltersStore => ({ ...initialFilters }),
    actions: {
        toggleOnline() {
            if (!this.isOnlineEnabled) {
                this.isOfflineEnabled = false;
                this.isOnlineEnabled = true;
            } else {
                this.isOnlineEnabled = false;
            }
        },
        toggleOffline() {
            if (!this.isOfflineEnabled) {
                this.isOnlineEnabled = false;
                this.isOfflineEnabled = true;
            } else {
                this.isOfflineEnabled = false;
            }
        },
        setCatalogSettings(
            settings?: {
                enableAutoload?: boolean | null;
                pageSize?: number | null;
            } | null,
        ) {
            if (!settings) return;

            this.enableAutoload = settings.enableAutoload ?? false;

            if (
                typeof settings.pageSize === "number" &&
                Number.isFinite(settings.pageSize) &&
                settings.pageSize > 0
            ) {
                this.limit = Math.floor(settings.pageSize);
            }
        },
        normalizeFilterKey(key: string) {
            if (key === "subclass") return "metadata.subclass";
            if (key === "class") return "metadata.class";
            return key;
        },
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
        resetToggles() {
            console.log("resetToggles");
            this.isOnlineEnabled = false;
            this.isOfflineEnabled = false;
        },
        setLastAppliedInput(key: string | null) {
            this.lastAppliedInput = key ? this.normalizeFilterKey(key) : null;
        },
        setFiltersList(values?: FacetDistribution) {
            if (!values) return;

            for (const [key, value] of Object.entries(values)) {
                this.filtersList[key] = Object.entries(value).map(
                    ([key, value]) => ({
                        label: key,
                        value: key,
                    }),
                );
            }
        },
        setAppliedFilters(
            appliedFilters: IFiltersStore["appliedFilters"],
            options?: { trackLastApplied?: boolean },
        ) {
            const previousFilters = { ...this.appliedFilters };
            this.appliedFilters = Object.fromEntries(
                Object.entries(appliedFilters)
                    .map((input) => {
                        input[0] = this.normalizeFilterKey(input[0]);
                        return input;
                    })
                    .filter(([key, value]) => value?.length > 0),
            );

            if (options?.trackLastApplied === false) return;

            const changedKeys = new Set<string>([
                ...Object.keys(previousFilters),
                ...Object.keys(this.appliedFilters),
            ]);
            const lastChanged = Array.from(changedKeys).find((key) => {
                const prev = (previousFilters[key] ?? []).join(",");
                const next = (this.appliedFilters[key] ?? []).join(",");
                return prev !== next;
            });

            this.lastAppliedInput = lastChanged ?? this.lastAppliedInput;
        },
        setAppliedFiltersFromQuery(appliedFilters: LocationQuery) {
            this.appliedFilters = {};
            this.lastAppliedInput = null;
            for (let [key, value] of Object.entries(appliedFilters)) {
                key = this.normalizeFilterKey(key);
                if (value?.length === 0 || !allowedFacets.includes(key))
                    continue;

                if (Array.isArray(value)) {
                    this.appliedFilters[key] =
                        value
                            .filter((v) => !!v)
                            .map((v) => v?.trim() as string) ?? [];
                } else if (value) {
                    this.appliedFilters[key] = [value.trim()];
                }
            }
        },
        resetFilters() {
            this.appliedFilters = {};
            this.lastAppliedInput = null;
            this.resetToggles();
        },
        removeFilterValue(filter: string, value: string) {
            filter = this.normalizeFilterKey(filter);
            this.appliedFilters[filter] =
                this.appliedFilters[filter]?.filter((v) => v !== value) ?? [];
            this.lastAppliedInput = filter;

            if (this.appliedFilters[filter]?.length === 0) {
                delete this.appliedFilters[filter];
            }
        },
        setFilterValue(filter: string, value: string) {
            filter = this.normalizeFilterKey(filter);
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
            this.lastAppliedInput = filter;
        },
        setAvailableFilters(values?: FacetDistribution) {
            const keys = Object.keys(this.filtersList);
            for (const key of keys) {
                if (key === this.lastAppliedInput) {
                    this.availableFilters[key] =
                        this.filtersList[key]?.map((item) => ({
                            label: item.label,
                            value: item.value,
                        })) ?? null;
                    continue;
                }
                const facetValues = values?.[key] ?? {};
                this.availableFilters[key] = Object.entries(facetValues)
                    .filter(([, count]) => count > 0)
                    .map(([value]) => ({ label: value, value }));
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
