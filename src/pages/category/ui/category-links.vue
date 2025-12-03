<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";

const { category } = defineProps<{
  category: StoreProductCategory & { mpath: string };
}>();

const level = computed(() => category.mpath.split(".").length);

console.log("category", level.value);
const { data: availableCategories } = useNuxtData<string[]>(
  "available-categories",
);
function clearedCategories(list: StoreProductCategory[]) {
  return list.filter((c) => availableCategories.value?.includes(c.id));
}
</script>

<template>
  <div v-if="level < 3" class="my-9 flex-wrap flex gap-3">
    <NuxtLink
      v-for="subCategory of clearedCategories(category.category_children)"
      :key="subCategory.id"
      :to="`/catalog/${subCategory.handle}`"
    >
      <UiBadge>{{ subCategory.name }}</UiBadge>
    </NuxtLink>
  </div>
</template>
