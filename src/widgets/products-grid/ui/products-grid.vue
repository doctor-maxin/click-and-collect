<script setup lang="ts">
import type { StoreProduct } from "@medusajs/types";
import ProductSkeleton from "./product-skeleton.vue";
import ProductCard from "./product-card.vue";

const {
  products,
  isLoading = false,
  hasMore = false,
} = defineProps<{
  products: StoreProduct[];
  isLoading?: boolean;
  hasMore?: boolean;
}>();

defineEmits<{
  (e: "load-more"): void;
}>();
</script>
<template>
  <div v-if="products.length > 0">
    <div class="grid grid-cols-4 gap-x-4 gap-y-9">
      <ProductCard
        v-for="product of products"
        :key="product.id"
        :product="product"
      />

      <template v-if="isLoading">
        <template v-for="i in 16"> <ProductSkeleton /></template>
      </template>
    </div>
    <div v-if="hasMore" class="flex justify-center w-full my-9">
      <button
        type="button"
        class="text-[1.25rem] cursor-pointer text-center"
        @click="$emit('load-more')"
      >
        Показать больше
      </button>
    </div>
  </div>
</template>
