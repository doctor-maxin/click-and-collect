import { defineStore } from "pinia";
import type { StoreProduct } from "@medusajs/types";

const MAX_RECENTLY_VIEWED = 12;

export const useRecentlyViewedStore = defineStore("recently-viewed", {
  state: () => ({
    products: [] as StoreProduct[],
  }),
  actions: {
    addProduct(product: StoreProduct) {
      const deduped = this.products.filter((item) => item.id !== product.id);
      this.products = [product, ...deduped].slice(0, MAX_RECENTLY_VIEWED);
    },
  },
  persist: true,
});
