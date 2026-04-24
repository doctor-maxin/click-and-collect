import type { GenericObject } from "vee-validate";

export interface IFiltersForm extends GenericObject {
  color: string[];
  size: string[];
  subclass: string[];
  class: string[];
  is_discounted: boolean;
}
