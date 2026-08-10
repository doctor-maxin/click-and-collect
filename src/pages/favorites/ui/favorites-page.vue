<script setup lang="ts">
import type { ProductWithDisplayTags } from "#shared/types/product-display-tag";
import { normalizeProductWithDisplayTags } from "#shared/types/product-display-tag";
import { NOINDEX_FOLLOW_ROBOTS } from "#shared/lib/seo";
import { useFavoritesStore } from "~/features/favorites";
import { ProductCard, ProductSkeleton } from "~/widgets/products-grid";
import FavoriteUnavailableProductCard from "./favorite-unavailable-product-card.vue";

const PRODUCT_FIELDS =
    "title,handle,description,variants.*,thumbnail,images.url,images.metadata,external_id,categories.*,metadata,options.*,options.values.*,variants.options.*,+variants.inventory_quantity,+variants.calculated_price,+product_display_tags.*";

const favoritesStore = useFavoritesStore();
const client = useMedusaClient();
const favoriteSnapshots = computed(() => favoritesStore.products);
const favoriteProductIds = computed(() => favoritesStore.productIds);
const favoriteProductIdsKey = computed(() =>
    favoriteProductIds.value.join(","),
);

const {
    data: fetchedProducts,
    status,
    error,
    refresh,
} = await useAsyncData(
    () => `favorites-${favoriteProductIdsKey.value || "empty"}`,
    async () => {
        if (!favoriteProductIds.value.length) return [];

        const response = await client.store.product.list({
            id: favoriteProductIds.value,
            limit: favoriteProductIds.value.length,
            country_code: "ru",
            fields: PRODUCT_FIELDS,
        });

        return (response.products ?? []).map(normalizeProductWithDisplayTags);
    },
    {
        server: false,
        watch: [favoriteProductIdsKey],
    },
);

const displayedProducts = ref<ProductWithDisplayTags[]>([]);

watch(
    favoriteProductIds,
    (productIds) => {
        const availableProductIds = new Set(productIds);
        displayedProducts.value = displayedProducts.value.filter((product) =>
            availableProductIds.has(product.id),
        );
    },
    { flush: "sync" },
);

watch(
    fetchedProducts,
    (products) => {
        if (!products) return;

        const productsById = new Map<string, ProductWithDisplayTags>(
            displayedProducts.value.map((product) => [product.id, product]),
        );

        for (const product of products) {
            productsById.set(product.id, product);
        }

        displayedProducts.value = favoriteProductIds.value
            .map((id) => productsById.get(id))
            .filter((product): product is ProductWithDisplayTags =>
                Boolean(product),
            );
    },
    { immediate: true },
);

const favoriteItems = computed(() => {
    const productsById = new Map<string, ProductWithDisplayTags>(
        displayedProducts.value.map((product) => [product.id, product]),
    );

    return favoriteSnapshots.value.map((snapshot) => ({
        snapshot,
        product: productsById.get(snapshot.id) ?? null,
    }));
});
const isInitialLoading = computed(
    () =>
        !favoritesStore.isHydrated ||
        ((status.value === "idle" || status.value === "pending") &&
            favoriteProductIds.value.length > 0 &&
            displayedProducts.value.length === 0),
);

const breadcrumbs = [
    { path: "/", label: "Главная" },
    { path: "/favorites", label: "Избранное" },
];

const getProductsCountLabel = (value: number) => {
    const absValue = Math.abs(value) % 100;
    const lastDigit = absValue % 10;

    if (absValue >= 11 && absValue <= 14) return "товаров";
    if (lastDigit === 1) return "товар";
    if (lastDigit >= 2 && lastDigit <= 4) return "товара";
    return "товаров";
};

useSeoMeta({
    title: "Избранное",
    robots: NOINDEX_FOLLOW_ROBOTS,
});
</script>

<template>
    <main class=" min-h-screen ">
        <div class="container mx-auto px-4 pb-12 lg:pb-18">
            <div class="my-9 hidden lg:block">
                <UiBreadcrumbs :items="breadcrumbs" />
            </div>
            <div class="mb-4 mt-6 flex items-center gap-4 lg:my-9">
                <h1
                    class="font-serif text-xl font-medium uppercase lg:text-[1.75rem]"
                >
                    Избранное
                </h1>
                <span v-if="favoriteItems.length" class="text-gray">
                    {{ favoriteItems.length }}
                    {{ getProductsCountLabel(favoriteItems.length) }}
                </span>
            </div>

            <div
                v-if="isInitialLoading"
                class="grid grid-cols-2 gap-4 lg:grid-cols-4"
            >
                <template v-for="index in 16" :key="index">
                    <ProductSkeleton />
                </template>
            </div>
            <div
                v-else-if="error && !displayedProducts.length"
                class="py-24 font-medium lg:text-2xl text-center"
            >
                <p>Не удалось загрузить избранное.</p>
                <UiButton class="mt-4" variant="outline" @click="refresh">
                    Повторить
                </UiButton>
            </div>
            <div
                v-else-if="favoriteItems.length"
                class="grid grid-cols-2 gap-4 lg:grid-cols-4"
            >
                <template v-for="(item, index) in favoriteItems" :key="item.snapshot.id">
                    <ProductCard
                        v-if="item.product"
                        :product="item.product"
                        analytics-list="Избранное"
                        :analytics-position="index + 1"
                        show-sku
                    />
                    <FavoriteUnavailableProductCard
                        v-else-if="status === 'success'"
                        :product="item.snapshot"
                    />
                </template>
            </div>
            <div v-else class="py-24 font-medium lg:text-2xl text-center">
                В избранном пока нет товаров.
            </div>
        </div>
    </main>
</template>
