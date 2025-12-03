import type {
  StoreProduct,
  StoreProductVariant,
  StoreProductOptionValue,
} from "@medusajs/types";

export interface IProductState {
  product: StoreProduct | null;
  color: StoreProductOptionValue | null;
  size: StoreProductOptionValue | null;
  price: number | null;
}
