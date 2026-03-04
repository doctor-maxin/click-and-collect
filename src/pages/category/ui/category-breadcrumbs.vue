<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";

const { category } = defineProps<{
  category: StoreProductCategory;
}>();

const { data: product_categories } =
  useNuxtData<StoreProductCategory[]>("categories");

const breadcrumbs = computed(() => {
  const list = [];
  let c: StoreProductCategory | null = category;

  if (!product_categories.value) return list;

  // @ts-ignore
  const mpath = c.mpath.split(".");
  let tmpCat: StoreProductCategory | undefined;

  list.push({
    path: `/`,
    label: "Главная",
  });

  for (const id of mpath) {
    if (tmpCat) {
      tmpCat = tmpCat.category_children.find((child) => child.id === id);
    } else {
      tmpCat = product_categories.value.find((c) => c.id === id);
    }
    if (!tmpCat) continue;

    if (tmpCat.name === "SINSAY") continue;
    list.push({
      path: `/catalog/` + tmpCat.handle,
      label: `${tmpCat.name[0]?.toUpperCase()}${tmpCat.name.slice(1).toLowerCase()}`,
    });
  }

  return list;
});
</script>
<template>
  <div class="hidden lg:block my-9">
    <UiBreadcrumbs :items="breadcrumbs" />
  </div>
</template>
