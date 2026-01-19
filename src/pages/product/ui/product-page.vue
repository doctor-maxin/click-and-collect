<script setup lang="ts">
import ProductBreadCrumbs from "./product-bread-crumbs.vue";
import ProductMedia from "./product-media.vue";
import ProductInfo from "./product-info.vue";
import { useProductStore } from "../lib/product-store";
import type { StoreRegion } from "@medusajs/types";

const route = useRoute();
const client = useMedusaClient();
const productStore = useProductStore();
const { variant } = storeToRefs(productStore);

if (!route.params.handle || route.params.handle === "undefined")
  throw createError({
    message: "Товар не найден",
    statusCode: 404,
    fatal: true,
    data: route.params,
  });

const { data: product, error } = await useAsyncData(
  () =>
    client.store.product.list({
      handle: route.params.handle as string,
      fields:
        "title,handle,variants.*,images.url,images.metadata,external_id,categories.*,metadata,options.*,options.values.*,variants.options.*",
    }),
  {
    transform: (r) => r.products?.[0],
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
  <div v-if="product" class="mt-[4rem] lg:mt-[8.125rem]">
    <div class="container px-4 lg:px-0 mx-auto">
      <ProductBreadCrumbs :product="product" />
      <div class="grid gap-4 lg:gap-8 grid-cols-1 lg:grid-cols-2">
        <ProductMedia class="lg:max-w-[32.75rem]" :product="product" />
        <ProductInfo class="lg:max-w-[26.5rem]" :product="product" />
      </div>
    </div>
  </div>
</template>
