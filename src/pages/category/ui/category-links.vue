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
  const availableList = list.filter((c) =>
    availableCategories.value?.includes(c.id),
  );
  const uniqueList = new Map<string, StoreProductCategory>();
  availableList.forEach((item) =>
    uniqueList.set(item.name?.toLowerCase(), item),
  );

  return uniqueList.values();
}
</script>

<template>
  <div v-if="level < 3" class="my-9 flex-wrap flex gap-3">
    <NuxtLink
      v-for="subCategory of clearedCategories(category.category_children)"
      :key="subCategory.id"
      :to="{
        name: 'catalog-handle',
        params: {
          handle: category.handle,
        },
        query: {
          ['metadata.subclass']: subCategory.name,
        },
      }"
    >
      <UiBadge>{{ subCategory.name }}</UiBadge>
    </NuxtLink>
  </div>
</template>
