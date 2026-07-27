<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";
import { useIntersectionObserver } from "@vueuse/core";
import type { SearchProductDocument } from "#shared/types/search-product-document";
import { NOINDEX_FOLLOW_ROBOTS } from "#shared/lib/seo";
import { resolveSeoMeta, truncateDescription } from "#shared/lib/seo-meta";
import { toAbsoluteSiteUrl } from "#shared/lib/site-url";
import { prepareFilterQuery } from "~/shared/lib/utils/prepare-filter-query";
import { WidgetProductsGrid } from "~/widgets/products-grid";
import { useProductDisplayTags } from "~/features/product-display-tags";
import SearchFilters from "./search-filters.vue";
import PopularProducts from "~/features/search/ui/popular-products.vue";

const route = useRoute();
const router = useRouter();
const searchClient = useSearchClient();
const { enrichProductsWithDisplayTags } = useProductDisplayTags();
const filtersStore = useFiltersStore();
const siteConfig = useSiteConfig();
const canonicalUrl = computed(() =>
    toAbsoluteSiteUrl(siteConfig.url, "/search"),
);

const query = computed(() => route.query.q?.toString() ?? "");
const searchMeta = computed(() =>
    resolveSeoMeta({
        canonical: canonicalUrl.value,
        title: query.value
            ? `${query.value} - поиск по каталогу | ${siteConfig.name}`
            : `Поиск по каталогу | ${siteConfig.name}`,
        description: truncateDescription(
            query.value
                ? `Результаты поиска по запросу "${query.value}" в каталоге ${siteConfig.name}.`
                : `Поиск товаров по каталогу ${siteConfig.name}.`,
        ),
        robots: NOINDEX_FOLLOW_ROBOTS,
    }),
);

const { limit, enableAutoload, page, totalPages, appliedFilters, sort } =
    storeToRefs(filtersStore);
const products = ref<SearchProductDocument[]>([]);
const shouldAppendProducts = ref(false);
const isAutoloadReady = ref(false);
filtersStore.setAppliedFiltersFromQuery(route.query);
const isInternalUpdate = ref(false);
const searchableProductAttributes = [
    "coloredTitle",
    "metadata.model",
    "external_id",
    "variants.sku",
];
const count = ref(0);
const productsRequestKey = computed(() =>
    [
        query.value,
        page.value,
        sort.value,
        JSON.stringify(appliedFilters.value),
    ].join(":"),
);

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
        isAutoloadReady.value = false;
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
                distinct: "product_id",
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
                distinct: "product_id",
                attributesToSearchOn: searchableProductAttributes,
                matchingStrategy: "all",
                sort: sort.value
                    ? [sort.value, "rank:asc", "is_tag_new:desc"]
                    : ["rank:asc", "is_tag_new:desc"],
                facets: [
                    "color",
                    "size",
                    "metadata.subclass",
                    "metadata.class",
                    "is_discounted",
                ],
            })
            .then(async (response) => ({
                ...response,
                hits: await enrichProductsWithDisplayTags(
                    response.hits ?? [],
                ),
            }));
    },
    {
        deep: true,
        server: false,
        dedupe: "cancel",
        watch: [page, sort, () => JSON.stringify(appliedFilters.value)],
    },
);

watch(productsRequestKey, () => {
    isAutoloadReady.value = false;
});

watch(
    [() => productsResponse.value, () => status.value],
    async ([response, currentStatus]) => {
        if (currentStatus !== "success" || !response) return;
        if (status.value === "success") {
            if (page.value === 1 || !shouldAppendProducts.value) {
                products.value = productsResponse.value?.hits ?? [];
            } else {
                products.value.push(...(productsResponse.value?.hits ?? []));
            }
            shouldAppendProducts.value = false;

            //@ts-ignore
            count.value = productsResponse.value?.totalHits ?? 0;
            filtersStore.setTotalPages(Math.ceil(count.value / limit.value));
            filtersStore.setAvailableFilters(
                productsResponse.value?.facetDistribution,
            );
            isInternalUpdate.value = false;
            await nextTick();
            isAutoloadReady.value = true;
        }
    },
    {
        immediate: true,
    },
);

watchEffect(() => {
    filtersStore.setFiltersList(filtersResponse.value?.facetDistribution);
});

useHead(() => ({
    link: [
        {
            rel: "canonical",
            href: searchMeta.value.canonical,
        },
    ],
}));

useSeoMeta({
    title: () => searchMeta.value.title,
    description: () => searchMeta.value.description,
    robots: () => searchMeta.value.robots,
    ogTitle: () => searchMeta.value.ogTitle,
    ogDescription: () => searchMeta.value.ogDescription,
    ogUrl: () => searchMeta.value.ogUrl,
    ogType: "website",
    twitterCard: "summary",
    twitterTitle: () => searchMeta.value.ogTitle,
    twitterDescription: () => searchMeta.value.ogDescription,
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
    isAutoloadReady.value = false;
    shouldAppendProducts.value = false;
    pushPageToQuery(1, false);
});

const onLoadMore = () => {
    if (
        !isAutoloadReady.value ||
        status.value === "pending" ||
        shouldAppendProducts.value ||
        page.value >= totalPages.value
    ) {
        return;
    }

    isAutoloadReady.value = false;
    shouldAppendProducts.value = true;
    pushPageToQuery(page.value + 1, true);
};

const autoloadTriggerRef = ref<HTMLElement | null>(null);
const isAutoloadTriggerVisible = ref(false);

useIntersectionObserver(
    autoloadTriggerRef,
    ([entry]) => {
        isAutoloadTriggerVisible.value = entry?.isIntersecting ?? false;
    },
    {
        rootMargin: "0px 0px 400px 0px",
    },
);

watch(
    [isAutoloadTriggerVisible, enableAutoload, status, page, totalPages],
    ([isVisible, isEnabled, currentStatus]) => {
        if (
            !isVisible ||
            !isEnabled ||
            !isAutoloadReady.value ||
            currentStatus !== "success"
        )
            return;
        onLoadMore();
    },
    { immediate: true },
);

const onPageChange = (nextPage: number) => {
    if (nextPage === page.value) return;
    isAutoloadReady.value = false;
    shouldAppendProducts.value = false;
    pushPageToQuery(nextPage, false);
};

const getProductsCountLabel = (value: number) => {
    const absValue = Math.abs(value) % 100;
    const lastDigit = absValue % 10;

    if (absValue >= 11 && absValue <= 14) return "товаров";
    if (lastDigit === 1) return "товар";
    if (lastDigit >= 2 && lastDigit <= 4) return "товара";
    return "товаров";
};
</script>
<template>
    <div class="mt-16 lg:mt-32.5">
        <div class="px-4 container mx-auto">
            <!-- <SearchBreadCrumbs /> -->
            <div class="flex items-center gap-4 mt-6 mb-4 lg:my-9">
                <h1 class="font-serif font-medium text-xl lg:text-[1.75rem]">
                    Товары по запросу "{{ query?.toString() ?? "" }}"
                </h1>
                <span v-if="status === 'success' && count > 0" class="text-gray"
                    >{{ count }} {{ getProductsCountLabel(count) }}</span
                >
            </div>
            <!-- <CategoryLinks :category="category" />-->
            <SearchFilters :class="{}" />
            <WidgetProductsGrid
                :products="products"
                :has-more="page < totalPages"
                :is-loading="status === 'pending' || status === 'idle'"
                :current-page="page"
                :total-pages="totalPages"
                empty-message="По вашему запросу ничего не найдено.
Попробуйте изменить запрос и мы поищем еще раз."
                @load-more="onLoadMore"
                @page-change="onPageChange"
            />
            <div
                v-if="enableAutoload && page < totalPages"
                ref="autoloadTriggerRef"
                class="h-px w-full"
                aria-hidden="true"
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
