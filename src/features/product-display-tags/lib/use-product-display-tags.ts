import type { ProductWithDisplayTags } from "#shared/types/product-display-tag";
import {
    normalizeProductDisplayTags,
    normalizeProductWithDisplayTags,
} from "#shared/types/product-display-tag";

const DISPLAY_TAG_FIELDS = "id,external_id,+product_display_tags.*";

function hasDisplayTagsField(product: ProductWithDisplayTags) {
    return Object.prototype.hasOwnProperty.call(
        product,
        "product_display_tags",
    );
}

function getProductLookupId(
    product: ProductWithDisplayTags & { product_id?: string | null },
) {
    return product.product_id?.trim() || product.id;
}

export function useProductDisplayTags() {
    const client = useMedusaClient();

    async function enrichProductsWithDisplayTags<
        T extends ProductWithDisplayTags,
    >(products: T[]): Promise<T[]> {
        if (!products.length) return [];

        const missingIds = [
            ...new Set(
                products
                    .filter((product) => !hasDisplayTagsField(product))
                    .map(getProductLookupId)
                    .filter(Boolean),
            ),
        ];

        if (!missingIds.length) {
            return products.map((product) => ({
                ...product,
                product_display_tags: normalizeProductDisplayTags(
                    product.product_display_tags,
                ),
            }));
        }

        const response = await client.store.product.list({
            id: missingIds,
            limit: missingIds.length,
            fields: DISPLAY_TAG_FIELDS,
        });
        const tagsByProductId = new Map(
            (response.products ?? []).flatMap((product) => {
                const normalized = normalizeProductWithDisplayTags(product);
                const entries: Array<
                    [string, ProductWithDisplayTags["product_display_tags"]]
                > = [[normalized.id, normalized.product_display_tags]];

                if (normalized.external_id) {
                    entries.push([
                        normalized.external_id,
                        normalized.product_display_tags,
                    ]);
                }

                return entries;
            }),
        );

        return products.map((product) => ({
            ...product,
            product_display_tags: normalizeProductDisplayTags(
                tagsByProductId.get(getProductLookupId(product)) ??
                    (product.external_id
                        ? tagsByProductId.get(product.external_id)
                        : undefined),
            ),
        }));
    }

    return {
        enrichProductsWithDisplayTags,
    };
}
