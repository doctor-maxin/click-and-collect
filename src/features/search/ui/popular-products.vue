<script setup lang="ts">
import { ProductCard } from "~/widgets/products-grid";

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
  <div class="w-full flex flex-col gap-9">
    <h3 class="text-[1.75rem] font-medium leading-9 uppercase">
      Популярные товары
    </h3>
    <div class="grid gap-y-9 gap-x-4 grid-cols-2">
      <ProductCard
        :product="product"
        v-for="product in data?.products"
        :key="product.id"
        @click="$emit('close')"
      />
    </div>
  </div>
</template>
