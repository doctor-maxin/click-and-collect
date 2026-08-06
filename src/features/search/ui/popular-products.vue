<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";
import type { SearchProductDocument } from "#shared/types/search-product-document";
import { useProductDisplayTags } from "~/features/product-display-tags";
import { ProductCard } from "~/widgets/products-grid";

const { title = "Популярные товары", compactMobile = false } = defineProps<{
    title?: string;
    compactMobile?: boolean;
}>();

const searchClient = useSearchClient();
const { enrichProductsWithDisplayTags } = useProductDisplayTags();
const { data: productCategories } =
    useNuxtData<StoreProductCategory[]>("categories");

const menuCategoryId = computed(
    () =>
        productCategories.value?.find((category) => category.handle === "menu")
            ?.id,
);

const { data } = await useAsyncData(
    "popular-products",
    async () => {
        const response = await searchClient
            .index("cards")
            .search<SearchProductDocument>(null, {
                hitsPerPage: 4,
                filter: menuCategoryId.value
                    ? [`category_ids IN ['${menuCategoryId.value}']`]
                    : [],
            });

        return {
            ...response,
            hits: await enrichProductsWithDisplayTags(response.hits ?? []),
        };
    },
    {
        watch: [menuCategoryId],
        transform: (response) => response.hits ?? [],
    },
);
defineEmits<{
    (e: "close"): void;
}>();
</script>
<template>
    <div class="w-full flex flex-col gap-4 lg:gap-9">
        <h3
            class="text-base px-4 lg:text-[1.75rem] font-medium lg:leading-9 uppercase"
        >
            {{ title }}
        </h3>
        <div
            class="grid gap-4"
            :class="
                compactMobile
                    ? ' grid-flow-col auto-cols-[9rem] grid-rows-1 overflow-x-auto px-4 pb-2 scroll-px-4 snap-x snap-mandatory sm:mx-0 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:gap-x-4 sm:gap-y-9 sm:overflow-visible sm:px-0 sm:pb-0'
                    : 'grid-cols-2 gap-x-4 gap-y-4 lg:gap-y-9'
            "
        >
            <ProductCard
                :product="product"
                v-for="(product, index) in data"
                :key="product.id"
                :class="{ 'snap-start': compactMobile }"
                :image-width="compactMobile ? 288 : 540"
                :image-sizes="
                    compactMobile
                        ? '144px'
                        : '(max-width: 768px) 350px, 540px'
                "
                :first-image-loading="compactMobile ? 'lazy' : 'eager'"
                :first-image-fetch-priority="compactMobile ? 'low' : 'high'"
                analytics-list="Популярные товары"
                :analytics-position="index + 1"
                @click="$emit('close')"
            />
        </div>
    </div>
</template>
