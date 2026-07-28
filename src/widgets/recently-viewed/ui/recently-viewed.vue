<script setup lang="ts">
import type { ProductWithDisplayTags } from "#shared/types/product-display-tag";
import { normalizeProductWithDisplayTags } from "#shared/types/product-display-tag";
import ProductCard from "~/widgets/products-grid/ui/product-card.vue";
import { useRecentlyViewedStore } from "~/features/recently-viewed";

const { currentProductId } = defineProps<{
    currentProductId?: string;
}>();

const recentlyViewedStore = useRecentlyViewedStore();
const client = useMedusaClient();

const storedProducts = computed(() =>
    recentlyViewedStore.products.filter(
        (product) => product.id !== currentProductId,
    ),
);
const productsWithoutPriceIds = computed(() =>
    storedProducts.value
        .filter(
            (product) =>
                !product.variants?.[0]?.calculated_price,
        )
        .map((product) => product.id),
);
const productsWithoutPriceKey = computed(() =>
    productsWithoutPriceIds.value.join(","),
);

const { data: refreshedProducts } = await useAsyncData(
    () => `recently-viewed-prices-${productsWithoutPriceKey.value || "empty"}`,
    async () => {
        if (!productsWithoutPriceIds.value.length) return [];

        const response = await client.store.product.list({
            id: productsWithoutPriceIds.value,
            limit: productsWithoutPriceIds.value.length,
            country_code: "ru",
            fields: "title,handle,description,variants.*,thumbnail,images.url,images.metadata,external_id,categories.*,metadata,options.*,options.values.*,variants.options.*,+variants.inventory_quantity,+variants.calculated_price,+product_display_tags.*",
        });

        return (response.products ?? []).map(normalizeProductWithDisplayTags);
    },
    {
        watch: [productsWithoutPriceKey],
    },
);

const refreshedProductsById = computed(
    () =>
        new Map<string, ProductWithDisplayTags>(
            (refreshedProducts.value ?? []).map((product) => [
                product.id,
                product,
            ]),
        ),
);
const viewedProducts = computed(() =>
    storedProducts.value.map(
        (product) => refreshedProductsById.value.get(product.id) ?? product,
    ),
);
</script>

<template>
    <section v-if="viewedProducts.length" class="mt-8 lg:mt-14">
        <h2
            class="font-serif font-medium text-xl lg:text-[1.75rem] uppercase mb-4 lg:mb-9"
        >
            Ранее просматривали
        </h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ProductCard
                v-for="product in viewedProducts"
                :key="product.id"
                :product="product"
            />
        </div>
    </section>
</template>
