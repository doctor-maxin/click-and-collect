<script setup lang="ts">
import CategoryBreadCrumbs from "./category-breadcrumbs.vue";
import CategoryLinks from "./category-links.vue";
import CategoryFilters from "./category-filters.vue";
import CategoryProducts from "./category-products.vue";
import type { StoreProduct, StoreProductCategory } from "@medusajs/types";
import { WidgetProductsGrid } from "~/widgets/products-grid";
import { useRoute } from "#app";
import { useFiltersStore } from "~/shared/lib/filters.store";
import { prepareFilterQuery } from "~/shared/lib/utils/prepare-filter-query";
import { getCategoryFromTree } from "~/shared/lib/utils/get-category-from-tree";

const route = useRoute();
const client = useMedusaClient();
const filtersStore = useFiltersStore();
const searchClient = useSearchClient();

const { limit, sort, page, totalPages, appliedFilters } =
  storeToRefs(filtersStore);

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

  return getCategoryFromTree(handle, product_categories.value);
});

if (!category.value)
  throw createError({
    message: "Категория не найдена",
    statusCode: 404,
    fatal: true,
    data: route.params,
  });

const products = ref<StoreProduct[]>([]);
filtersStore.setAppliedFiltersFromQuery(route.query);

const { data: filtersResponse } = await useAsyncData(
  () => `filters-${category.value?.id}`,
  () => {
    return searchClient.index("cards").search<StoreProduct>(null, {
      filter: [`category_ids IN ['${category.value?.id}']`],
      hitsPerPage: 0,
      facets: ["color", "size", "metadata.subclass", "metadata.class"],
    });
  },
);
const { data: productsResponse, status } = await useAsyncData(
  () => category.value?.id as string,
  () => {
    let filter = [`category_ids IN ['${category.value?.id}']`];
    console.log("RE INDEDX");
    filter = prepareFilterQuery(filter, appliedFilters.value);
    return searchClient.index("cards").search<StoreProduct>(null, {
      filter,
      hitsPerPage: limit.value,
      page: page.value,
      facets: ["color", "size", "metadata.subclass", "metadata.class"],
    });
  },
  {
    watch: [page, () => JSON.stringify(appliedFilters.value)],
    deep: true,
  },
);

watchEffect(() => {
  const getQueryValue = (key: string) => {
    const v = route.query[key];
    return Array.isArray(v) ? v.join(",") : (v as string);
  };

  const getFilterValue = (key: string) => {
    const v = filtersStore.appliedFilters?.[key];
    return Array.isArray(v) ? v.join(",") : v;
  };

  const querySubclass = getQueryValue("metadata.subclass");
  const queryClass = getQueryValue("metadata.class");
  const queryColor = getQueryValue("color");
  const querySize = getQueryValue("size");

  const filterSubclass = getFilterValue("subclass");
  const filterClass = getFilterValue("class");
  const filterColor = getFilterValue("color");
  const filterSize = getFilterValue("size");

  if (
    querySubclass !== filterSubclass ||
    queryClass !== filterClass ||
    queryColor !== filterColor ||
    querySize !== filterSize
  ) {
    const allowedFacets = [
      "color",
      "size",
      "metadata.subclass",
      "metadata.class",
    ];
    const newFilters: Record<string, string[]> = {};

    for (let [key, value] of Object.entries(route.query)) {
      if (key === "subclass") key = "metadata.subclass";
      if (key === "class") key = "metadata.class";
      if (value?.length === 0 || !allowedFacets.includes(key)) continue;

      if (Array.isArray(value)) {
        newFilters[key] = value
          .filter((v) => !!v)
          .map((v) => v?.trim() as string);
      } else if (value) {
        newFilters[key] = [value.trim()];
      }
    }

    filtersStore.setAppliedFilters(newFilters);
  }
});

// Update Filter response
watchEffect(() => {
  if (status.value === "success") {
    if (page.value === 1) {
      products.value = productsResponse.value?.hits ?? [];
    } else {
      products.value.push(...(productsResponse.value?.hits ?? []));
    }

    //@ts-ignore
    filtersStore.setTotalPages(productsResponse.value?.totalPages ?? 0);
    filtersStore.setAvailableFilters(productsResponse.value?.facetDistribution);
  }
});

// Update Facets
watchEffect(() => {
  filtersStore.setFiltersList(filtersResponse.value?.facetDistribution);
});

watch(
  () => route.params.handle,
  () => {
    filtersStore.setPage(1);
  },
);
</script>

<template>
  <div class="mt-16 lg:mt-[8.125rem]">
    <div v-if="category" class="px-4 container mx-auto">
      <CategoryBreadCrumbs :category="category" />
      <h1 class="font-serif font-medium my-9 text-[1.75rem] uppercase">
        {{ category.name }}
      </h1>
      <CategoryLinks :category="category" />
      <CategoryFilters :category="category" />
      <WidgetProductsGrid
        :products="products"
        :has-more="page < totalPages"
        :is-loading="status === 'pending'"
        @load-more="filtersStore.setPage(page + 1)"
      />
    </div>
  </div>
</template>
