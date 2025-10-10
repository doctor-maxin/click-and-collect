import type { IFilterValue } from "#shared/types/autocomplete.js";

export interface IFiltersStore {
  limit: number;
  page: number;
  count: number;
  isOpen: boolean;

  availableFilters: Record<string, IFilterValue[] | null>;
  filtersList: Record<string, IFilterValue[] | null>;
  appliedFilters: Record<string, string[]>;
}
