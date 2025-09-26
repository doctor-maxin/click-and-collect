import { defineStore } from "pinia";
import type { IProductState } from "../model/product-store.model";

export const useProductStore = defineStore("_product", {
  state: (): IProductState => ({
    product: null,
    variant: null,
  }),
  actions: {
    setProduct(product: IProductState["product"]) {
      this.product = product;
    },
    setVariant(variant: IProductState["variant"]) {
      this.variant = variant;
    },
  },
});
