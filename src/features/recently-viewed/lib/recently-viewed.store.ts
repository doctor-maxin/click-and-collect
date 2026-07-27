import { defineStore } from "pinia";
import type { StoreProductVariant } from "@medusajs/types";
import type { ProductWithDisplayTags } from "#shared/types/product-display-tag";

const MAX_RECENTLY_VIEWED = 12;

const collapseVariantsBySize = (
    product: ProductWithDisplayTags,
): ProductWithDisplayTags => {
    const sizeOption = product.options?.find(
        (option) => option.title?.toLowerCase() === "size",
    );

    if (!sizeOption || !product.variants?.length) return product;

    const variantsBySize = new Map<string, StoreProductVariant>();
    const variantsWithoutSize: StoreProductVariant[] = [];

    for (const variant of product.variants) {
        const sizeValue = variant.options?.find(
            (option) => option.option_id === sizeOption.id,
        )?.value;

        if (!sizeValue) {
            variantsWithoutSize.push(variant);
            continue;
        }

        if (!variantsBySize.has(sizeValue)) {
            variantsBySize.set(sizeValue, variant);
        }
    }

    return {
        ...product,
        variants: [...variantsBySize.values(), ...variantsWithoutSize],
    };
};

export const useRecentlyViewedStore = defineStore("recently-viewed", {
    state: () => ({
        products: [] as ProductWithDisplayTags[],
    }),
    actions: {
        addProduct(product: ProductWithDisplayTags) {
            const normalizedProduct = collapseVariantsBySize(product);
            const deduped = this.products.filter(
                (item) => item.id !== product.id,
            );
            this.products = [normalizedProduct, ...deduped].slice(
                0,
                MAX_RECENTLY_VIEWED,
            );
        },
    },
    persist: true,
});
