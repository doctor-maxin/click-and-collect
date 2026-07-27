import type {
    StoreProductVariant,
    StoreProductOptionValue,
} from "@medusajs/types";
import type { ProductWithDisplayTags } from "#shared/types/product-display-tag";

export interface IProductState {
    product: ProductWithDisplayTags | null;
    color: StoreProductOptionValue | null;
    size: StoreProductOptionValue | null;
    price: number | null;
    discount: number | null;
    oldPrice: number | null;
}
