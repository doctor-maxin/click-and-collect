<script setup lang="ts">
import type { StoreProduct, StoreProductCategory } from "@medusajs/types";

const { data: product_categories } =
  useNuxtData<StoreProductCategory[]>("categories");
const { product } = defineProps<{ product: StoreProduct }>();

const breadcrumbs = computed(() => {
  const list: { path: string; label: string }[] = [
    {
      path: `/`,
      label: "Главная",
    },
  ];

  if (!product.categories?.[0] || !product_categories.value) return list;

  let largestCategory = product.categories?.[0];
  let largestCategoryRank = product.categories?.[0]?.mpath?.split(".").length;

  for (const category of product.categories ?? []) {
    const rank = category.mpath?.split(".").length;
    if (rank > largestCategoryRank) {
      largestCategory = category;
      largestCategoryRank = rank;
    }
  }

  const paths = largestCategory.mpath?.split(".");
  let parentCategory = product_categories.value;
  for (const path of paths) {
    const c = parentCategory.find((c) => c.id === path);
    if (c?.parent_category_id) {
      list.push({
        path: `/catalog/` + c?.handle,
        label: `${c?.name[0]?.toUpperCase()}${c?.name?.slice(1).toLowerCase()}`,
      });
    }
    if (c) parentCategory = c.category_children;
  }
  console.log("product", product.variants[0]?.metadata);

  list.push({
    path: `/products/${product.handle}`,
    label: `${product.title?.[0]?.toUpperCase()}${product.title?.slice(1)?.toLowerCase()}`,
  });

  return list;
});
</script>
<template>
  <div class="hidden lg:block my-9">
    <UiBreadcrumbs :items="breadcrumbs" />
  </div>
</template>
