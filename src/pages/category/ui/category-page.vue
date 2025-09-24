<script setup lang="ts">
import CategoryBreadCrumbs from "./category-breadcrumbs.vue";
import CategoryLinks from "./category-links.vue";
import CategoryFilters from "./category-filters.vue";
import CategoryProducts from "./category-products.vue";
import type { StoreProduct, StoreProductCategory } from "@medusajs/types";
import { WidgetProductsGrid } from "~/widgets/products-grid";
import { useRoute } from "#app";

const route = useRoute();
const client = useMedusaClient();
const limit = ref(8);
const page = ref(1);
const count = ref(0);

if (!route.params.handle || route.params.handle === "undefined")
  throw createError({
    message: "Категория не найдена",
    statusCode: 404,
    fatal: true,
    data: route.params,
  });

const { data: product_categories } =
  useNuxtData<StoreProductCategory[]>("categories");

const category = computed(() => {
  if (!product_categories.value) return null;

  const handle = route.params.handle as string;
  const paths: StoreProductCategory[] = [];
  let slugs = handle.split("-");
  let slug = slugs.shift();

  let list = product_categories.value;
  while (slugs.length >= 0) {
    const tmpCategory = list.find((c) => c.handle === slug);
    if (tmpCategory) {
      const parentCategory = paths[paths.length - 1];
      if (parentCategory) {
        tmpCategory.parent_category = parentCategory;
        tmpCategory.parent_category_id = parentCategory.id;
      }
      paths.push(tmpCategory);
      list = tmpCategory.category_children ?? [];
    }

    const nextSlug = slugs.shift();
    if (!nextSlug) break;
    slug = `${slug}-${nextSlug}`;
  }

  return paths[paths.length - 1];
});

if (!category.value)
  throw createError({
    message: "Категория не найдена",
    statusCode: 404,
    fatal: true,
    data: route.params,
  });

const products = ref<StoreProduct[]>([]);
const { data: productsResponse, status } = useAsyncData(
  category.value.id,
  () =>
    client.store.product.list({
      category_id: category.value?.id,
      limit: limit.value,
      offset: (page.value - 1) * limit.value,
    }),
  {
    watch: [page],
  },
);

watchEffect(() => {
  if (status.value === "success") {
    if (page.value === 1) {
      products.value = productsResponse.value?.products ?? [];
    } else {
      products.value.push(...(productsResponse.value?.products ?? []));
    }

    count.value = productsResponse.value?.count ?? 0;
  }
});
</script>

<template>
  <div class="mt-[8.125rem]">
    <div v-if="category" class="container mx-auto">
      <CategoryBreadCrumbs :category="category" />
      <h1 class="font-serif font-medium my-9 text-[1.75rem] uppercase">
        {{ category.name }}
      </h1>
      <CategoryLinks :category="category" />
      <CategoryFilters :category="category" />
      <WidgetProductsGrid
        :products="products"
        :has-more="count > products.length"
        :is-loading="status === 'pending'"
        @load-more="page++"
      />
    </div>
  </div>
</template>
