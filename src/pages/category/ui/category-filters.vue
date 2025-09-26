<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";
import { FeatureCatalogFilters } from "~/features/catalog/filters";
import { FeatureCatalogOrder } from "~/features/catalog/order";

const { category } = defineProps<{
  category: StoreProductCategory;
}>();
</script>

<template>
  <div class="my-7 flex items-center gap-8">
    <FeatureCatalogFilters />
    <FeatureCatalogOrder />
  </div>
</template>
