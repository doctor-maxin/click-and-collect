<script setup lang="ts">
import { ProductCard } from "~/widgets/products-grid";

const { title = "Популярные товары" } = defineProps<{
  title?: string;
}>();

const client = useMedusaClient();
const { data } = await useAsyncData("popular-products", () =>
  client.store.product.list({
    limit: 4,
    order: "updated_at",
  }),
);
defineEmits<{
  (e: "close"): void;
}>();
</script>
<template>
  <div class="w-full flex flex-col gap-4 lg:gap-9">
    <h3 class="text-base lg:text-[1.75rem] font-medium lg:leading-9 uppercase">
      {{ title }}
    </h3>
    <div class="grid gap-y-4 lg:gap-y-9 gap-x-4 grid-cols-2">
      <ProductCard
        :product="product"
        v-for="product in data?.products"
        :key="product.id"
        @click="$emit('close')"
      />
    </div>
  </div>
</template>
