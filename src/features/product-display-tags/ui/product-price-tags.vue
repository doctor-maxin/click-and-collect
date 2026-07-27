<script setup lang="ts">
import type { ProductDisplayTag } from "#shared/types/product-display-tag";
import ProductDisplayTags from "./product-display-tags.vue";

defineProps<{
    tags?: ProductDisplayTag[] | null;
}>();
</script>

<template>
    <ProductDisplayTags
        :tags="tags"
        placement="under_price"
        class="flex-wrap gap-1.5 mt-1"
    />
</template>
