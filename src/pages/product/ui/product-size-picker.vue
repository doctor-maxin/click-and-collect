<script setup lang="ts">
import { useProductStore } from "../lib/product-store";
import type { StoreProductVariant } from "@medusajs/types";

const productStore = useProductStore();
const { size, product } = storeToRefs(productStore);
</script>
<template>
  <section class="flex flex-col gap-4 my-4 lg:my-9">
    <span>Размеры</span>
    <div
      class="flex text-base leading-5 gap-y-4 gap-8 w-full max-w-full flex-wrap"
    >
      <label
        v-for="item of product?.options?.find((o) => o.title === 'size')
          ?.values"
        :key="item.id"
        class="cursor-pointer border relative py-1 px-2"
        :class="{
          '  border-blue ': size?.id === item?.id,
          ' border-transparent': size?.id !== item?.id,
        }"
        @click="productStore.selectSize(item)"
      >
        {{ item.value }}
      </label>
    </div>
  </section>
</template>
