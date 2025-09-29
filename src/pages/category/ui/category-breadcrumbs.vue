<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";

const { category } = defineProps<{
  category: StoreProductCategory;
}>();

const breadcrumbs = computed(() => {
  const list = [];
  console.log(category);
  let c: StoreProductCategory | null = category;
  while (c) {
    if (!c.parent_category) break;
    list.push({
      path: `/catalog/` + c.handle,
      label: `${c.name[0]?.toUpperCase()}${c.name.slice(1).toLowerCase()}`,
    });
    c = c.parent_category;
  }
  list.push({
    path: `/`,
    label: "Главная",
  });

  return list.reverse();
});
</script>
<template>
  <div class="my-9">
    <UiBreadcrumbs :items="breadcrumbs" />
  </div>
</template>
