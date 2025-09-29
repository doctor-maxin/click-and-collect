<script setup lang="ts">
import { useProductStore } from "../lib/product-store";

const productStore = useProductStore();
const { product, color } = storeToRefs(productStore);
</script>
<template>
  <div class="flex my-4 lg:my-9 flex-col gap-5 lg:gap-4">
    <span
      >Цвет: <span class="capitalize">{{ color?.value }}</span></span
    >
    <div class="flex overflow-x-auto gap-3 w-full">
      <article
        v-for="item of product?.options?.find((o) => o.title === 'color')
          ?.values"
        :key="item.id"
        class="cursor-pointer border"
        @click="productStore.selectColor(item)"
        :class="{
          ' border-black': color?.id === item?.id,
          ' border-gray': color?.id !== item?.id,
        }"
      >
        <img
          class="aspect-[23/28] object-cover max-w-[5.75rem]"
          :src="(item.metadata?.thumbnail as string) || '/not_found.png'"
          :alt="`Изображение товара ${item.value}`"
        />
      </article>
    </div>
  </div>
</template>
