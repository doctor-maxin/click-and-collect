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
  <div class="my-7 flex flex-wrap justify-between lg:justify-start items-start gap-4 lg:gap-8">
    <FeatureCatalogFilters />
    <FeatureCatalogOrder />
    <FeatureCatalogAppliedFilters />
  </div>
</template>
