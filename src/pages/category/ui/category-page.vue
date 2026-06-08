<script setup lang="ts">
import { useRoute } from "#app";
import type { StoreProductCategory } from "@medusajs/types";
import { useFiltersStore } from "~/shared/lib/filters.store";
import {
    hasMeaningfulQueryValue,
    INDEXABLE_ROBOTS,
    NOINDEX_FOLLOW_ROBOTS,
} from "#shared/lib/seo";
import { resolveSeoMeta, truncateDescription } from "#shared/lib/seo-meta";
import type { SearchProductDocument } from "#shared/types/search-product-document";
import { getCategoryFromTree } from "~/shared/lib/utils/get-category-from-tree";
import { prepareFilterQuery } from "~/shared/lib/utils/prepare-filter-query";
import { WidgetProductsGrid } from "~/widgets/products-grid";
import CategoryBreadCrumbs from "./category-breadcrumbs.vue";
import CategoryFilters from "./category-filters.vue";
import CategoryLinks from "./category-links.vue";
import { toAbsoluteSiteUrl } from "~~/shared/lib";

const route = useRoute();
const router = useRouter();
const filtersStore = useFiltersStore();
const searchClient = useSearchClient();
const {
    public: { siteUrl, siteName },
} = useRuntimeConfig();
const canonicalPath = computed(
    () => `/catalog/${route.params.handle as string}`,
);
const canonicalUrl = computed(() =>
    toAbsoluteSiteUrl(siteUrl as string, canonicalPath.value),
);
const isIndexableCategoryPage = computed(
    () =>
        !Object.entries(route.query).some(([key, value]) => {
            if (key === "_append") return false;
            if (key === "page") {
                const pageValue = Array.isArray(value) ? value[0] : value;
                return Number(pageValue) > 1;
            }

            return hasMeaningfulQueryValue(value);
        }),
);

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
const category = ref<(StoreProductCategory & { mpath: string }) | null>(null);

watch(
    () => route.params.handle,
    () => {
        if (!product_categories.value) return null;
        const handle = route.params.handle as string;

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

const categoryMeta = computed(() =>
    resolveSeoMeta({
        canonical: canonicalUrl.value,
        title: category.value?.name
            ? `${category.value.name} - купить в ${siteName as string}`
            : (siteName as string),
        description: truncateDescription(
            category.value?.name
                ? `${category.value.name} в каталоге ${siteName as string}. Подбор моделей, актуальные предложения и удобный поиск по параметрам.`
                : undefined,
        ),
        robots: isIndexableCategoryPage.value
            ? INDEXABLE_ROBOTS
            : NOINDEX_FOLLOW_ROBOTS,
    }),
);

useHead(() => ({
    link: [
        {
            rel: "canonical",
            href: categoryMeta.value.canonical,
        },
    ],
}));

useSeoMeta({
    title: () => categoryMeta.value.title,
    description: () => categoryMeta.value.description,
    robots: () => categoryMeta.value.robots,
    ogTitle: () => categoryMeta.value.ogTitle,
    ogDescription: () => categoryMeta.value.ogDescription,
    ogUrl: () => categoryMeta.value.ogUrl,
    ogType: "website",
});

const products = ref<SearchProductDocument[]>([]);
const count = ref(0);
const isInternalUpdate = ref(false);
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
    (val) => {
        const nextPage = getPageFromQuery();
        if (page.value === nextPage) return;
        filtersStore.setPage(nextPage);
        if (nextPage === 1) shouldAppendProducts.value = false;
    },
    { immediate: true },
);

const { data: filtersResponse } = await useAsyncData(
    () => `filters-${category.value?.id}`,
    () => {
        return searchClient.index("cards").search<SearchProductDocument>(null, {
            filter: [`category_ids IN ['${category.value?.id}']`],
            hitsPerPage: 0,
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
const asyncDataKey = computed(() =>
    [
        category.value?.id,
        page.value,
        sort.value,
        JSON.stringify(appliedFilters.value),
    ].join(":"),
);
const { data: productsResponse, status } = await useAsyncData(
    asyncDataKey,
    () => {
        isInternalUpdate.value = true;
        let filter = [`category_ids IN ['${category.value?.id}']`];
        filter = prepareFilterQuery(filter, appliedFilters.value);
        return searchClient.index("cards").search<SearchProductDocument>(null, {
            filter,
            hitsPerPage: limit.value,
            page: page.value,
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
        const queryCategoryIds = getQueryValue("category_ids");
        const queryIsDiscounted = getQueryValue("is_discounted");

        const filterSubclass = getFilterValue("subclass");
        const filterClass = getFilterValue("class");
        const filterColor = getFilterValue("color");
        const filterSize = getFilterValue("size");
        const filterCategoryIds = getFilterValue("category_ids");
        const filterIsDiscounted = getFilterValue("is_discounted");

        if (
            querySubclass !== filterSubclass ||
            queryClass !== filterClass ||
            queryColor !== filterColor ||
            querySize !== filterSize ||
            queryCategoryIds !== filterCategoryIds ||
            queryIsDiscounted !== filterIsDiscounted
        ) {
            const allowedFacets = [
                "color",
                "size",
                "category_ids",
                "metadata.subclass",
                "metadata.class",
                "is_discounted",
            ];
            const newFilters: Record<string, string[]> = {};

            for (let [key, value] of Object.entries(route.query)) {
                if (key === "subclass") key = "metadata.subclass";
                if (key === "class") key = "metadata.class";
                if (value?.length === 0 || !allowedFacets.includes(key))
                    continue;

                if (Array.isArray(value)) {
                    newFilters[key] = value
                        .filter((v) => !!v)
                        .map((v) => v?.trim() as string);
                } else if (value) {
                    newFilters[key] = [value.trim()];
                }
            }
            filtersStore.setAppliedFilters(newFilters, {
                trackLastApplied: false,
            });
        }
    },
    {
        deep: true,
    },
);

// Update Filter response
watch(
    [() => productsResponse.value, () => status.value],
    ([response, currentStatus]) => {
        if (currentStatus !== "success" || !response) return;

        if (page.value === 1 || !shouldAppendProducts.value) {
            products.value = response.hits ?? [];
        } else {
            products.value.push(...(response.hits ?? []));
        }
        shouldAppendProducts.value = false;

        //@ts-ignore
        filtersStore.setTotalPages(response.totalPages ?? 0);
        filtersStore.setAvailableFilters(response.facetDistribution);
        isInternalUpdate.value = false;
    },
    {
        immediate: true,
    },
);

// Update Facets
watchEffect(() => {
    filtersStore.setFiltersList(filtersResponse.value?.facetDistribution);
});

watchEffect(() => {
    //@ts-ignore
    count.value = productsResponse.value?.totalHits ?? 0;
});

watch(
    () => route.params.handle,
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
    pushPageToQuery(1);
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
    <KeepAlive>
        <div class="mt-16 lg:mt-32.5">
            <div v-if="category" class="px-4 container mx-auto">
                <CategoryBreadCrumbs :category="category" />
                <div class="flex items-center gap-4 mt-6 mb-4 lg:my-9">
                    <h1
                        class="font-serif font-medium text-xl lg:text-[1.75rem] uppercase"
                    >
                        {{ category.name }}
                    </h1>
                    <span
                        v-if="status === 'success' && count > 0"
                        class="text-gray"
                        >{{ count }} {{ getProductsCountLabel(count) }}</span
                    >
                </div>
                <CategoryLinks :category="category" />
                <CategoryFilters :category="category" />
                <WidgetProductsGrid
                    :products="products"
                    :has-more="page < totalPages"
                    :is-loading="status === 'pending'"
                    :current-page="page"
                    :total-pages="totalPages"
                    @load-more="onLoadMore"
                    @page-change="onPageChange"
                />
            </div>
        </div>
    </KeepAlive>
</template>
