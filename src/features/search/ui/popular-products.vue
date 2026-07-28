<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";
import type { SearchProductDocument } from "#shared/types/search-product-document";
import { useProductDisplayTags } from "~/features/product-display-tags";
import { ProductCard } from "~/widgets/products-grid";

const { title = "Популярные товары" } = defineProps<{
    title?: string;
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
            class="text-base lg:text-[1.75rem] font-medium lg:leading-9 uppercase"
        >
            {{ title }}
        </h3>
        <div class="grid gap-y-4 lg:gap-y-9 gap-x-4 grid-cols-2">
            <ProductCard
                :product="product"
                v-for="(product, index) in data"
                :key="product.id"
                analytics-list="Популярные товары"
                :analytics-position="index + 1"
                @click="$emit('close')"
            />
        </div>
    </div>
</template>
