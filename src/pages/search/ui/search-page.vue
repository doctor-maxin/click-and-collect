<script setup lang="ts">
import SearchBreadCrumbs from "./search-bread-crumbs.vue";
import type { StoreProduct, StoreProductCategory } from "@medusajs/types";
import { prepareFilterQuery } from "~/shared/lib/utils/prepare-filter-query";
import { WidgetProductsGrid } from "~/widgets/products-grid";
import SearchFilters from "./search-filters.vue";
import PopularProducts from "~/features/search/ui/popular-products.vue";

const route = useRoute();
const router = useRouter();
const searchClient = useSearchClient();
const filtersStore = useFiltersStore();

const query = computed(() => route.query.q?.toString() ?? "");

const { limit, page, totalPages, appliedFilters, sort } =
  storeToRefs(filtersStore);
const products = ref<StoreProduct[]>([]);
const shouldAppendProducts = ref(false);
filtersStore.setAppliedFiltersFromQuery(route.query);

const getPageFromQuery = () => {
  const rawPage = Array.isArray(route.query.page)
    ? route.query.page[0]
    : route.query.page;
  const parsedPage = Number(rawPage);
  if (!Number.isFinite(parsedPage) || parsedPage < 1) return 1;
  return Math.floor(parsedPage);
};

const pushPageToQuery = (nextPage: number, append = false) => {
  const currentPageQuery = Array.isArray(route.query.page)
    ? route.query.page[0]
    : route.query.page;
  if (nextPage <= 1 && !currentPageQuery) return;
  if (nextPage > 1 && currentPageQuery === String(nextPage)) return;

  const nextQuery: Record<string, string | string[]> = { ...route.query };
  if (nextPage <= 1) {
    delete nextQuery.page;
  } else {
    nextQuery.page = String(nextPage);
  }

  if (append) {
    nextQuery._append = "1";
  } else {
    delete nextQuery._append;
  }
  router.push({ query: nextQuery });
};

watch(
  () => route.query.page,
  () => {
    const nextPage = getPageFromQuery();
    if (page.value === nextPage) return;
    filtersStore.setPage(nextPage);
    if (nextPage === 1) shouldAppendProducts.value = false;
  },
  { immediate: true },
);

const { data: filtersResponse } = await useAsyncData(
  () => `search-${query.value}`,
  () => {
    return searchClient
      .index("cards")
      .search<StoreProduct>(query.value?.toString(), {
        hitsPerPage: 0,
        attributesToSearchOn: ["coloredTitle"],
        distinct: "id",
        facets: ["color", "size", "metadata.subclass", "metadata.class", "is_discounted"],
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
        facets: ["color", "size", "metadata.subclass", "metadata.class", "is_discounted"],
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
    if (page.value === 1 || !shouldAppendProducts.value) {
      products.value = productsResponse.value?.hits ?? [];
    } else {
      products.value.push(...(productsResponse.value?.hits ?? []));
    }
    shouldAppendProducts.value = false;

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
    shouldAppendProducts.value = false;
    pushPageToQuery(1, false);
  },
);

watch(sort, () => {
  shouldAppendProducts.value = false;
  pushPageToQuery(1, false);
});

const onLoadMore = () => {
  shouldAppendProducts.value = true;
  pushPageToQuery(page.value + 1, true);
};

const onPageChange = (nextPage: number) => {
  if (nextPage === page.value) return;
  shouldAppendProducts.value = false;
  pushPageToQuery(nextPage, false);
};
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
        :current-page="page"
        :total-pages="totalPages"
        empty-message="По вашему запросу ничего не найдено.
Попробуйте изменить запрос и мы поищем еще раз."
        @load-more="onLoadMore"
        @page-change="onPageChange"
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
