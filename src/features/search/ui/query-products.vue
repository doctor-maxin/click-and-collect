<script setup lang="ts">
import type { SearchProductDocument } from "#shared/types/search-product-document";
import { ProductCard } from "~/widgets/products-grid";

const { products } = defineProps<{
    products: SearchProductDocument[];
}>();

defineEmits<{
    (e: "close"): void;
}>();
</script>

<template>
    <section v-if="products.length" class="flex w-full flex-col gap-4">
        <h3 class="text-base px-4 md:px-0 font-medium uppercase lg:text-[1.75rem] lg:leading-9">
            Товары
        </h3>
        <div
            class="grid px-4 md:px-0 grid-flow-col auto-cols-[9rem] grid-rows-1 gap-4 overflow-x-auto  pb-2 scroll-px-4 snap-x snap-mandatory sm:mx-0 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:gap-x-4 sm:gap-y-9 sm:overflow-visible sm:px-0 sm:pb-0"
        >
            <ProductCard
                v-for="(product, index) in products"
                :key="product.id"
                :product="product"
                class="snap-start"
                :image-width="288"
                image-sizes="144px"
                first-image-loading="lazy"
                first-image-fetch-priority="low"
                analytics-list="Поиск в модальном окне"
                :analytics-position="index + 1"
                @click="$emit('close')"
            />
        </div>
    </section>
</template>
