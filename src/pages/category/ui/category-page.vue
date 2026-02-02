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
console.log("PAGE RLOEADED");
const { data: product_categories } =
  useNuxtData<StoreProductCategory[]>("categories");
const category = ref(null);

watch(
  () => route.params.handle,
  () => {
    if (!product_categories.value) return null;
    const handle = route.params.handle as string;
    console.log("ROUTE CHANGED", handle);

    category.value = getCategoryFromTree(handle, product_categories.value);
  },
  {
    immediate: true,
  },
);

if (!category.value)
  throw createError({
    message: "Категория не найдена",
    statusCode: 404,
    fatal: true,
    data: route.params,
  });

const products = ref<StoreProduct[]>([]);
const isInternalUpdate = ref(false);
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
    isInternalUpdate.value = true;
    let filter = [`category_ids IN ['${category.value?.id}']`];
    console.log("RE INDEDX", appliedFilters.value);
    filter = prepareFilterQuery(filter, appliedFilters.value);
    return searchClient.index("cards").search<StoreProduct>(null, {
      filter,
      hitsPerPage: limit.value,
      page: page.value,
      sort: sort.value ? [sort.value] : [],
      facets: ["color", "size", "metadata.subclass", "metadata.class"],
    });
  },
  {
    watch: [page, sort, () => JSON.stringify(appliedFilters.value)],
    deep: true,
    dedupe: "cancel",
  },
);

watch(
  () => route.query,
  () => {
    if (isInternalUpdate.value) return;

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
      console.log("[setAppliedFilters]", newFilters, route.query);
      filtersStore.setAppliedFilters(newFilters);
    }
  },
  {
    deep: true,
  },
);

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
    isInternalUpdate.value = false;
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
    filtersStore.resetFilters();
  },
  {
    immediate: true,
    deep: true,
  },
);

watch(sort, () => {
  filtersStore.setPage(1);
  console.log("on sort changed");
});
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
