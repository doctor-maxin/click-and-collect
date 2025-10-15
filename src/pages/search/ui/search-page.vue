<script setup lang="ts">
import SearchBreadCrumbs from "./search-bread-crumbs.vue";
import type { StoreProduct, StoreProductCategory } from "@medusajs/types";
import { prepareFilterQuery } from "~/shared/lib/utils/prepare-filter-query";
import { WidgetProductsGrid } from "~/widgets/products-grid";

const route = useRoute();
const searchClient = useSearchClient();
const filtersStore = useFiltersStore();

const { limit, page, count, appliedFilters } = storeToRefs(filtersStore);
const products = ref<StoreProduct[]>([]);
filtersStore.setAppliedFiltersFromQuery(route.query);

const { data: filtersResponse } = await useAsyncData(
  () => `search-${route.query.q}`,
  () => {
    return searchClient
      .index("products")
      .search<StoreProduct>(route.query.q?.toString(), {
        hitsPerPage: 0,
        facets: ["color", "size"],
      });
  },
);

const { data: productsResponse, status } = await useAsyncData(
  () => route.query.q as string,
  () => {
    let filter: string[] = [];
    filter = prepareFilterQuery(filter, appliedFilters.value);
    return searchClient
      .index("products")
      .search<StoreProduct>(route.query.q?.toString(), {
        filter,
        hitsPerPage: limit.value,
        page: page.value,
        facets: ["color", "size"],
      });
  },
  {
    watch: [page, appliedFilters],
  },
);

watchEffect(() => {
  if (status.value === "success") {
    if (page.value === 1) {
      products.value = productsResponse.value?.hits ?? [];
    } else {
      products.value.push(...(productsResponse.value?.hits ?? []));
    }

    //@ts-ignore
    filtersStore.setCount(productsResponse.value?.totalHits ?? 0);
    filtersStore.setAvailableFilters(productsResponse.value?.facetDistribution);
  }
});

watchEffect(() => {
  filtersStore.setFiltersList(filtersResponse.value?.facetDistribution);
});
</script>
<template>
  <div class="mt-16 lg:mt-[8.125rem]">
    <div class="px-4 container mx-auto">
      <SearchBreadCrumbs />
      <h1 class="font-serif font-medium my-9 text-[1.75rem]">
        Товары по запросу "{{ route.query.q ?? "" }}"
      </h1>
      <!-- <CategoryLinks :category="category" />
      <CategoryFilters :category="category" />-->
      <WidgetProductsGrid
        :products="products"
        :has-more="count > products.length"
        :is-loading="status === 'pending'"
        @load-more="filtersStore.setPage(page + 1)"
      />
    </div>
  </div>
</template>
