<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";

const { category } = defineProps<{
  category: StoreProductCategory;
}>();

const { data: availableCategories } = useNuxtData<string[]>(
  "available-categories",
);
function clearedCategories(list: StoreProductCategory[]) {
  return list.filter((c) => availableCategories.value?.includes(c.id));
}
</script>

<template>
  <div class="my-9 flex-wrap flex gap-3">
    <NuxtLink
      v-for="subCategory of clearedCategories(category.category_children)"
      :key="subCategory.id"
      :to="`/catalog/${subCategory.handle}`"
    >
      <UiBadge>{{ subCategory.name }}</UiBadge>
    </NuxtLink>
  </div>
</template>
