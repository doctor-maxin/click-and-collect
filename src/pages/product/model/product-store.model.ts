import type { StoreProduct, StoreProductVariant } from "@medusajs/types";

export interface IProductState {
  product: StoreProduct | null;
  variant: StoreProductVariant | null;
}
