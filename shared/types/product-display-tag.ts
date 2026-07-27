import type { StoreProduct } from "@medusajs/types";

export const PRODUCT_DISPLAY_TAG_PLACEMENTS = [
    "card_top_left",
    "card_top_right",
    "card_bottom_left",
    "card_bottom_right",
    "under_price",
] as const;

export type ProductDisplayTagPlacement =
    (typeof PRODUCT_DISPLAY_TAG_PLACEMENTS)[number];

export interface ProductDisplayTag {
    id: string;
    name: string;
    text_color: string;
    background_color: string;
    font_weight: "normal" | "bold";
    placement: ProductDisplayTagPlacement;
}

export type ProductWithDisplayTags = StoreProduct & {
    product_display_tags?: ProductDisplayTag[] | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function isProductDisplayTagPlacement(
    value: unknown,
): value is ProductDisplayTagPlacement {
    return (
        typeof value === "string" &&
        PRODUCT_DISPLAY_TAG_PLACEMENTS.includes(
            value as ProductDisplayTagPlacement,
        )
    );
}

export function normalizeProductDisplayTags(
    value: unknown,
): ProductDisplayTag[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((item) => {
        if (
            !isRecord(item) ||
            typeof item.id !== "string" ||
            typeof item.name !== "string" ||
            typeof item.text_color !== "string" ||
            typeof item.background_color !== "string" ||
            (item.font_weight !== "normal" &&
                item.font_weight !== "bold") ||
            !isProductDisplayTagPlacement(item.placement)
        ) {
            return [];
        }

        return [
            {
                id: item.id,
                name: item.name,
                text_color: item.text_color,
                background_color: item.background_color,
                font_weight: item.font_weight,
                placement: item.placement,
            },
        ];
    });
}

export function getProductDisplayTagsByPlacement(
    tags: unknown,
    placement: ProductDisplayTagPlacement,
) {
    return normalizeProductDisplayTags(tags).filter(
        (tag) => tag.placement === placement,
    );
}

export function normalizeProductWithDisplayTags(
    product: StoreProduct & { product_display_tags?: unknown },
): ProductWithDisplayTags {
    return {
        ...product,
        product_display_tags: normalizeProductDisplayTags(
            product.product_display_tags,
        ),
    };
}
