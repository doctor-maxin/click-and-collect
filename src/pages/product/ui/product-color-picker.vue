<script setup lang="ts">
import { useProductStore } from "../lib/product-store";

const productStore = useProductStore();
const client = useMedusaClient();
const { variant, product } = storeToRefs(productStore);

const variantColorName = computed(() =>
  variant.value?.options?.find((o) => o.option?.title === "color"),
);

const { data: relatedProducts } = await useAsyncData(
  () => `${product.value?.id}-colors`,
  () =>
    client.store.product.list({
      external_id: product.value?.external_id as string,
      fields: "thumbnail,handle,title",
    }),
  {
    transform: (d) => d.products,
  },
);
</script>
<template>
  <div class="flex my-4 lg:my-9 flex-col gap-5 lg:gap-4">
    <span
      >Цвет: <span class="capitalize">{{ variantColorName?.value }}</span></span
    >
    <div class="flex overflow-x-auto gap-3 w-full">
      <article v-for="colorProduct of relatedProducts" :key="colorProduct.id">
        <NuxtLink :to="`/products/${colorProduct.handle}`">
          <img
            class="aspect-[23/28] object-cover max-w-[5.75rem] border border-gray"
            :src="
              colorProduct.thumbnail ? colorProduct.thumbnail : '/not_found.png'
            "
            :alt="`Изображение товара ${colorProduct.title}`"
          />
        </NuxtLink>
      </article>
    </div>
  </div>
</template>
