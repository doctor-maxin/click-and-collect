import type { IFilterValue } from "#shared/types/autocomplete.js";

export interface IFiltersStore {
  limit: number;
  enableAutoload: boolean;
  page: number;
  totalPages: number;
  isOpen: boolean;
  sort: string | null;
  lastAppliedInput: string | null;

  availableFilters: Record<string, IFilterValue[] | null>;
  filtersList: Record<string, IFilterValue[] | null>;
  appliedFilters: Record<string, string[]>;
}
