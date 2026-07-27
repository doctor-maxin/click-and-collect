<script setup lang="ts">
import type {
    ProductDisplayTag,
    ProductDisplayTagPlacement,
} from "#shared/types/product-display-tag";
import { getProductDisplayTagsByPlacement } from "#shared/types/product-display-tag";
import ProductDisplayTagBadge from "./product-display-tag-badge.vue";

defineOptions({
    inheritAttrs: false,
});

const props = defineProps<{
    tags?: ProductDisplayTag[] | null;
    placement: ProductDisplayTagPlacement;
}>();

const visibleTags = computed(() =>
    getProductDisplayTagsByPlacement(props.tags, props.placement),
);
</script>

<template>
    <div
        v-if="visibleTags.length"
        v-bind="$attrs"
        role="list"
        class="flex max-w-full "
    >
        <ProductDisplayTagBadge
            v-for="tag in visibleTags"
            :key="tag.id"
            :tag="tag"
        />
    </div>
</template>
