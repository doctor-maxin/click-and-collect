import { defineStore } from "pinia";
import type { StoreProduct, StoreProductVariant } from "@medusajs/types";

const MAX_RECENTLY_VIEWED = 12;

const collapseVariantsBySize = (product: StoreProduct): StoreProduct => {
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
        products: [] as StoreProduct[],
    }),
    actions: {
        addProduct(product: StoreProduct) {
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
