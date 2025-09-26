<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";

const { category } = defineProps<{
  category: StoreProductCategory;
}>();
</script>

<template>
  <div class="my-9 flex-wrap flex gap-3">
    <NuxtLink
      v-for="subCategory of category.category_children"
      :key="subCategory.id"
      :to="`/catalog/${subCategory.handle}`"
    >
      <UiBadge>{{ subCategory.name }}</UiBadge>
    </NuxtLink>
  </div>
</template>
