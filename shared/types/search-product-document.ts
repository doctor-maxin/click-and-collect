import type { StoreProduct } from "@medusajs/types";

export interface SearchProductDocument extends StoreProduct {
  model?: string | null;
}
