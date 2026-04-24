<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";
import type { SearchProductDocument } from "~/shared/types/search-product-document";
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
const products = ref<SearchProductDocument[]>([]);
const shouldAppendProducts = ref(false);
filtersStore.setAppliedFiltersFromQuery(route.query);
const isInternalUpdate = ref(false);
const searchableProductAttributes = ["coloredTitle", "metadata.model"];

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

    const nextQuery: Record<string, string | string[]> = {
        ...(route.query as Record<string, string | string[]>),
    };
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
            .search<SearchProductDocument>(query.value?.toString(), {
                hitsPerPage: 0,
                attributesToSearchOn: searchableProductAttributes,
                distinct: "id",
                facets: [
                    "color",
                    "size",
                    "metadata.subclass",
                    "metadata.class",
                    "is_discounted",
                ],
            });
    },
);

const { data: productsResponse, status } = await useAsyncData(
    () => query.value as string,
    () => {
        isInternalUpdate.value = true;
        let filter: string[] = [];
        filter = prepareFilterQuery(filter, appliedFilters.value);
        return searchClient
            .index("cards")
            .search<SearchProductDocument>(query.value?.toString(), {
                filter,
                hitsPerPage: limit.value,
                page: page.value,
                attributesToSearchOn: searchableProductAttributes,
                matchingStrategy: "all",
                sort: sort.value ? [sort.value] : [],
                facets: [
                    "color",
                    "size",
                    "metadata.subclass",
                    "metadata.class",
                    "is_discounted",
                ],
            });
    },
    {
        deep: true,
        server: false,
        dedupe: "cancel",
        watch: [page, sort, () => JSON.stringify(appliedFilters.value)],
    },
);

watch(
    [() => productsResponse.value, () => status.value],
    ([response, currentStatus]) => {
        if (currentStatus !== "success" || !response) return;
        if (status.value === "success") {
            if (page.value === 1 || !shouldAppendProducts.value) {
                products.value = productsResponse.value?.hits ?? [];
            } else {
                products.value.push(...(productsResponse.value?.hits ?? []));
            }
            shouldAppendProducts.value = false;

            //@ts-ignore
            filtersStore.setTotalPages(productsResponse.value?.totalPages ?? 0);
            filtersStore.setAvailableFilters(
                productsResponse.value?.facetDistribution,
            );
            isInternalUpdate.value = false;
        }
    },
    {
        immediate: true,
    },
);

watchEffect(() => {
    filtersStore.setFiltersList(filtersResponse.value?.facetDistribution);
});

useSeoMeta({
    title: `Товары по запросу ${query.value?.toString() ?? ""}`,
});

watch(
    () => query.value,
    (val, oldVal) => {
        if (val && oldVal && val !== oldVal) {
            filtersStore.setPage(1);
            filtersStore.resetFilters();
        }
    },
    {
        immediate: true,
        deep: true,
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
    <div class="mt-16 lg:mt-32.5">
        <div class="px-4 container mx-auto">
            <!-- <SearchBreadCrumbs /> -->
            <h1
                class="font-serif font-medium mt-6 mb-4 lg:my-9 text-xl lg:text-[1.75rem]"
            >
                Товары по запросу "{{ query?.toString() ?? "" }}"
            </h1>
            <!-- <CategoryLinks :category="category" />-->
            <SearchFilters :class="{}" />
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
