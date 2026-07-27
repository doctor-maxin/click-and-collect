<script setup lang="ts">
import type { ProductDisplayTag } from "#shared/types/product-display-tag";

const { tag } = defineProps<{
    tag: ProductDisplayTag;
}>();
</script>

<template>
    <span
        role="listitem"
        :aria-label="`Тег товара: ${tag.name}`"
        class="block max-w-full overflow-hidden rounded  text-sm leading-3 [overflow-wrap:anywhere] lg:text-base lg:leading-4"
        :style="{
            color: tag.text_color,
            backgroundColor: tag.placement !== 'under_price' ?  tag.background_color : 'unset',
            fontWeight: tag.font_weight === 'bold' ? 700 : 400,
        }"
        :class="{
            'px-2 py-1.5': tag.placement !== 'under_price'
        }"
    >
        <span class="line-clamp-2">{{ tag.name }}</span>
    </span>
</template>
