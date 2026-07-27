import type { ProductWithDisplayTags } from "./product-display-tag";

export interface SearchProductDocument extends ProductWithDisplayTags {
  model?: string | null;
  product_id?: string | null;
}
