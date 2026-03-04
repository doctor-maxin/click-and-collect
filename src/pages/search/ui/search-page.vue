<script setup lang="ts">
import SearchBreadCrumbs from "./search-bread-crumbs.vue";
import type { StoreProduct, StoreProductCategory } from "@medusajs/types";
import { prepareFilterQuery } from "~/shared/lib/utils/prepare-filter-query";
import { WidgetProductsGrid } from "~/widgets/products-grid";
import SearchFilters from "./search-filters.vue";
import PopularProducts from "~/features/search/ui/popular-products.vue";

const route = useRoute();
const searchClient = useSearchClient();
const filtersStore = useFiltersStore();

const query = computed(() => route.query.q?.toString() ?? "");

const { limit, page, totalPages, appliedFilters, sort } =
  storeToRefs(filtersStore);
const products = ref<StoreProduct[]>([]);
filtersStore.setAppliedFiltersFromQuery(route.query);

const { data: filtersResponse } = await useAsyncData(
  () => `search-${query.value}`,
  () => {
    return searchClient
      .index("cards")
      .search<StoreProduct>(query.value?.toString(), {
        hitsPerPage: 0,
        attributesToSearchOn: ["coloredTitle"],
        distinct: "id",
        facets: ["color", "size", "metadata.subclass", "metadata.class"],
      });
  },
);

const { data: productsResponse, status } = await useAsyncData(
  () => query.value as string,
  () => {
    let filter: string[] = [];
    filter = prepareFilterQuery(filter, appliedFilters.value);
    return searchClient
      .index("cards")
      .search<StoreProduct>(query.value?.toString(), {
        filter,
        hitsPerPage: limit.value,
        matchingStrategy: "all",
        page: page.value,
        sort: sort.value ? [sort.value] : [],
        facets: ["color", "size", "metadata.subclass", "metadata.class"],
      });
  },
  {
    deep: true,
    server: false,
    watch: [page, appliedFilters, sort],
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
    filtersStore.setTotalPages(productsResponse.value?.totalPages ?? 0);
    filtersStore.setAvailableFilters(productsResponse.value?.facetDistribution);
  }
});

watchEffect(() => {
  filtersStore.setFiltersList(filtersResponse.value?.facetDistribution);
});

useSeoMeta({
  title: `Товары по запросу ${query.value?.toString() ?? ""}`,
});

watch(
  () => query.value,
  () => {
    filtersStore.setPage(1);
  },
);

watch(sort, () => {
  filtersStore.setPage(1);
});
</script>
<template>
  <div class="mt-16 lg:mt-[8.125rem]">
    <div class="px-4 container mx-auto">
      <SearchBreadCrumbs />
      <h1
        class="font-serif font-medium mt-6 mb-4 lg:my-9 text-xl lg:text-[1.75rem]"
      >
        Товары по запросу "{{ query?.toString() ?? "" }}"
      </h1>
      <!-- <CategoryLinks :category="category" />-->
      <SearchFilters
        :class="{
          'hidden lg:block': status !== 'pending' && products.length === 0,
        }"
      />
      <WidgetProductsGrid
        :products="products"
        :has-more="page < totalPages"
        :is-loading="status === 'pending'"
        empty-message="По вашему запросу ничего не найдено.
Попробуйте изменить запрос и мы поищем еще раз."
        @load-more="filtersStore.setPage(page + 1)"
      />
      <section
        v-if="status !== 'pending' && products.length === 0"
        class="mt-8 lg:mt-12"
      >
        <PopularProducts title="Могут заинтерисовать" />
      </section>
    </div>
  </div>
</template>
