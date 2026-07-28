<script setup lang="ts">
import type {
    ProductDisplayTag,
    ProductDisplayTagPlacement,
} from "#shared/types/product-display-tag";
import {
    getDefaultProductDisplayTags,
    normalizeProductDisplayTags,
} from "#shared/types/product-display-tag";
import ProductDisplayTags from "./product-display-tags.vue";

const props = defineProps<{
    tags?: ProductDisplayTag[] | null;
    defaultTags?: unknown;
    discountPercentage?: number | null;
}>();

const extendedTags = computed(() => {
    const defaultDisplayTags = getDefaultProductDisplayTags(props.defaultTags);
    const discountTag: ProductDisplayTag[] =
        typeof props.discountPercentage === "number" &&
        props.discountPercentage > 0
            ? [
                  {
                      id: `default-display-tag-discount-${props.discountPercentage}`,
                      name: `-${props.discountPercentage}%`,
                      text_color: "#FFFFFF",
                      background_color: "#C4131C",
                      placement: "card_top_left",
                      font_weight: "normal",
                  },
              ]
            : [];

    return [...(props.tags ?? []), ...defaultDisplayTags, ...discountTag];
});

const positionClasses: Record<ProductDisplayTagPlacement, string> = {
    card_top_left: "left-3 top-3 items-start",
    card_top_right: "right-3 top-3 items-end",
    card_bottom_left: "bottom-16 left-3 items-start",
    card_bottom_right: "bottom-16 right-3 items-end",
    under_price: "",
};

const overlayGroups = computed(() => {
    const tags = normalizeProductDisplayTags(extendedTags.value);

    return (
        [
            "card_top_left",
            "card_top_right",
            "card_bottom_left",
            "card_bottom_right",
        ] as const
    )
        .map((placement) => ({
            placement,
            tags: tags.filter((tag) => tag.placement === placement),
        }))
        .filter((group) => group.tags.length > 0);
});
</script>

<template>
    <ProductDisplayTags
        v-for="group in overlayGroups"
        :key="group.placement"
        :tags="group.tags"
        :placement="group.placement"
        class="pointer-events-none absolute z-20 max-w-[calc(50%-0.75rem)] flex flex-wrap gap-x-4 gap-y-2"
        :class="positionClasses[group.placement]"
    />
</template>
