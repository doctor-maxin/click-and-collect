<script setup lang="ts">
import type { StoreProduct, StoreProductCategory } from "@medusajs/types";

const { data: product_categories } =
  useNuxtData<StoreProductCategory[]>("categories");
const { product } = defineProps<{ product: StoreProduct }>();

const toSentenceCase = (value?: string) =>
  value ? `${value[0]?.toUpperCase()}${value.slice(1).toLowerCase()}` : "";

const findCategoryPath = (
  categories: StoreProductCategory[],
  targetId: string,
  trail: StoreProductCategory[] = [],
): StoreProductCategory[] | null => {
  for (const category of categories) {
    const nextTrail = [...trail, category];
    if (category.id === targetId) return nextTrail;

    const childPath = findCategoryPath(
      category.category_children ?? [],
      targetId,
      nextTrail,
    );
    if (childPath) return childPath;
  }

  return null;
};

const breadcrumbs = computed(() => {
  const list: { path: string; label: string }[] = [
    {
      path: `/`,
      label: "Главная",
    },
  ];

  if (!product.categories?.[0] || !product_categories.value) return list;

  const menuRoot = product_categories.value.find(
    (category) => category.handle === "menu",
  );
  if (!menuRoot) return list;

  let largestPath: StoreProductCategory[] = [];
  for (const category of product.categories ?? []) {
    const pathInMenu = findCategoryPath(
      menuRoot.category_children ?? [],
      category.id,
    );
    if (pathInMenu && pathInMenu.length > largestPath.length) {
      largestPath = pathInMenu;
    }
  }

  if (!largestPath.length) return list;

  for (const category of largestPath) {
    if (!category.parent_category_id) continue;
    list.push({
      path: `/catalog/` + category.handle,
      label: toSentenceCase(category.name),
    });
  }

  list.push({
    path: `/products/${product.handle}`,
    label: toSentenceCase(product.title),
  });

  return list;
});
</script>
<template>
  <div class="hidden lg:block my-9">
    <UiBreadcrumbs :items="breadcrumbs" />
  </div>
</template>
