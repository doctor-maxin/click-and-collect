<script setup lang="ts">
import { useProductStore } from "../lib/product-store";
import type { StoreProductVariant } from "@medusajs/types";

const productStore = useProductStore();
const { size, product } = storeToRefs(productStore);
</script>
<template>
  <section class="flex flex-col gap-4 my-4 lg:my-9">
    <span>Размеры</span>
    <div class="flex text-base leading-5 gap-8 w-full">
      <label
        v-for="item of product?.options?.find((o) => o.title === 'size')
          ?.values"
        :key="item.id"
        class="cursor-pointer px-3 py-1 border"
        :class="{
          ' border-black': size?.id === item?.id,
          ' border-gray': size?.id !== item?.id,
        }"
        @click="productStore.selectSize(item)"
      >
        {{ item.value }}
      </label>
    </div>
  </section>
</template>
