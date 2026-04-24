<script setup lang="ts">
import ProductCard from "~/widgets/products-grid/ui/product-card.vue";
import { useRecentlyViewedStore } from "~/features/recently-viewed";

const { currentProductId } = defineProps<{
  currentProductId?: string;
}>();

const recentlyViewedStore = useRecentlyViewedStore();

const viewedProducts = computed(() =>
  recentlyViewedStore.products.filter((product) => product.id !== currentProductId),
);
</script>

<template>
  <section v-if="viewedProducts.length" class="mt-8 lg:mt-14">
    <h2 class="font-serif font-medium text-xl lg:text-[1.75rem] uppercase mb-4 lg:mb-9">
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
