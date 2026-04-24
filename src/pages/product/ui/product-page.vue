<script setup lang="ts">
import ProductBreadCrumbs from "./product-bread-crumbs.vue";
import ProductMedia from "./product-media.vue";
import ProductInfo from "./product-info.vue";
import { useProductStore } from "../lib/product-store";
import { useRecentlyViewedStore } from "~/features/recently-viewed";
import { WidgetRecentlyViewed } from "~/widgets/recently-viewed";

const route = useRoute();
const client = useMedusaClient();
const productStore = useProductStore();
const recentlyViewedStore = useRecentlyViewedStore();
const { variant } = storeToRefs(productStore);

if (!route.params.handle || route.params.handle === "undefined")
    throw createError({
        message: "Товар не найден",
        statusCode: 404,
        fatal: true,
        data: route.params,
    });

const { data: product, error } = await useAsyncData(
    () => route.params.handle as string,
    () =>
        client.store.product.list({
            handle: route.params.handle as string,
            fields: "title,handle,description,variants.*,images.url,images.metadata,external_id,categories.*,metadata,options.*,options.values.*,variants.options.*",
        }),
    {
        transform: (r) => r.products?.[0],
        watch: [() => route.params.handle as string],
    },
);

if (!product.value)
    throw createError({
        message: "Товар не найден",
        statusCode: 404,
        fatal: true,
        data: product.value,
    });

productStore.setProduct(product.value);

onMounted(() => {
    if (!product.value) return;
    recentlyViewedStore.addProduct(product.value);
});

watch(
    () => route.query?.variant,
    () => {
        if (route.query.variant && product.value?.variants) {
            const id = route.query.variant as string;
            const variant = product.value.variants.find((v) => v.id === id);
            if (variant) productStore.setVariant(variant);
        } else if (product.value?.variants?.[0]) {
            productStore.setVariant(product.value.variants[0]);
        }
    },
    {
        deep: true,
        immediate: true,
    },
);

watch(
    variant,
    async (value) => {
        if (!value) return;
        const { price } = await client.client.fetch<{ price: number }>(
            `/store/variants/${value.id}/price`,
        );
        productStore.setPrice(price);
    },
    {
        deep: true,
        immediate: true,
    },
);
</script>
<template>
    <div v-if="product" class="mt-16 lg:mt-32.5">
        <div class="container px-4 mx-auto">
            <ProductBreadCrumbs :product="product" />
            <div class="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-2">
                <ProductMedia class="" :product="product" />
                <ProductInfo class="lg:max-w-106" :product="product" />
            </div>
            <ClientOnly>
                <WidgetRecentlyViewed :current-product-id="product.id" />
            </ClientOnly>
        </div>
    </div>
</template>
