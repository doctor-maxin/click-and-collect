<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";
import { FeatureCatalogFilters } from "~/features/catalog/filters";
import { FeatureCatalogOrder } from "~/features/catalog/order";
import { FeatureCatalogAppliedFilters } from "~/features/catalog/applied-filters";

const { category } = defineProps<{
  category: StoreProductCategory;
}>();
</script>

<template>
  <div class="my-7 flex items-start gap-8">
    <FeatureCatalogFilters />
    <FeatureCatalogOrder />
    <FeatureCatalogAppliedFilters />
  </div>
</template>
