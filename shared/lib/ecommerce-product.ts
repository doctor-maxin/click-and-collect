import type {
    StoreProduct,
    StoreProductVariant,
} from "@medusajs/types";
import type { EcommerceProduct } from "../types/ecommerce-analytics";

interface EcommerceProductOptions {
    brand?: string;
    list?: string;
    position?: number;
    price?: number | null;
    originalPrice?: number | null;
    quantity?: number;
    variant?: StoreProductVariant | null;
}

export function createEcommerceProduct(
    product: StoreProduct,
    options: EcommerceProductOptions = {},
): EcommerceProduct {
    const variant = options.variant ?? product.variants?.[0];
    const calculatedPrice = variant?.calculated_price;
    const price = options.price ?? calculatedPrice?.calculated_amount;
    const originalPrice =
        options.originalPrice ?? calculatedPrice?.original_amount;
    const discount =
        typeof price === "number" &&
        typeof originalPrice === "number" &&
        originalPrice > price
            ? originalPrice - price
            : undefined;
    const category = product.categories
        ?.map((item) => item.name)
        .filter(Boolean)
        .join(" / ");

    return {
        id: product.external_id || product.id,
        name:
            (variant?.metadata?.name as string | undefined) ?? product.title,
        brand: options.brand,
        category: category || undefined,
        discount,
        list: options.list,
        position: options.position,
        price: typeof price === "number" ? price : undefined,
        quantity: options.quantity,
        variant: variant?.sku || variant?.title || undefined,
    };
}
