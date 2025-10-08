import type { GenericObject } from "vee-validate";

export interface IFiltersForm extends Record<string, string[]>, GenericObject {
  color: string[];
  size: string[];
}
