<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";

const { category } = defineProps<{
  category: StoreProductCategory;
}>();

const { data: product_categories } =
  useNuxtData<StoreProductCategory[]>("categories");

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
  const list: { path: string; label: string }[] = [];

  if (!product_categories.value) return list;

  list.push({
    path: `/`,
    label: "Главная",
  });

  const menuRoot = product_categories.value.find(
    (category) => category.handle === "menu",
  );
  if (!menuRoot) return list;

  const pathInMenu = findCategoryPath(
    menuRoot.category_children ?? [],
    category.id,
  );
  if (!pathInMenu?.length) return list;

  for (const item of pathInMenu) {
    if (!item.parent_category_id) continue;
    list.push({
      path: `/catalog/` + item.handle,
      label: toSentenceCase(item.name),
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
