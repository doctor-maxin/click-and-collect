<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";
import { useDebounceFn } from "@vueuse/core";
import type { SearchProductDocument } from "#shared/types/search-product-document";
import { useProductDisplayTags } from "~/features/product-display-tags";
import { getCategoryTreeIdsByHandle } from "~/shared/lib/utils/get-category-tree-ids";
import { useSearchStore } from "../lib/search.store";
import type { IQuerySuggestion } from "../model/query-suggestion.model";
import RecentQueries from "./recent-queries.vue";

const query = ref("");
const normalizeQuery = (value: string) => value.replace(/\s+/g, " ").trim();
const searchClient = useSearchClient();
const results = ref<IQuerySuggestion[]>([]);
const searchStore = useSearchStore();
const router = useRouter();
const { enrichProductsWithDisplayTags } = useProductDisplayTags();
const { data: productCategories } =
    useNuxtData<StoreProductCategory[]>("categories");
const emit = defineEmits<{
    (e: "close"): void;
    (e: "query-change", hasQuery: boolean): void;
    (e: "products-change", products: SearchProductDocument[]): void;
}>();
let searchRequestId = 0;

const HIGHLIGHT_START = "__meili_highlight_start__";
const HIGHLIGHT_END = "__meili_highlight_end__";
const searchableProductAttributes = [
    "coloredTitle",
    "metadata.model",
    "external_id",
    "variants.sku",
];

type HighlightPart = {
    value: string;
    isHighlighted: boolean;
};

const allowedCategoryIds = computed(() => {
    const ids = new Set<string>();
    if (!productCategories.value?.length) return ids;

    for (const rootHandle of ["menu", "open"]) {
        for (const childId of getCategoryTreeIdsByHandle(
            productCategories.value,
            rootHandle,
            false,
        )) {
            ids.add(childId);
        }
    }

    return ids;
});

const categories = computed(() => {
    const list = new Map<string, IQuerySuggestion["categories"][0]>();

    for (const hit of results.value) {
        for (const category of hit.categories) {
            if (!allowedCategoryIds.value.has(category.id)) continue;

            list.set(category.name, category);
            if (list.size === 3) return Array.from(list.values());
        }
    }

    return Array.from(list.values());
});

function getHighlightedPhraseParts(
    suggestion: IQuerySuggestion,
): HighlightPart[] {
    const formattedPhrase = suggestion._formatted?.phrase ?? suggestion.phrase;
    const parts: HighlightPart[] = [];
    let isHighlighted = false;

    for (const part of formattedPhrase.split(
        new RegExp(`(${HIGHLIGHT_START}|${HIGHLIGHT_END})`, "g"),
    )) {
        if (part === HIGHLIGHT_START) {
            isHighlighted = true;
            continue;
        }

        if (part === HIGHLIGHT_END) {
            isHighlighted = false;
            continue;
        }

        if (part) parts.push({ value: part, isHighlighted });
    }

    return parts;
}

const loadSuggestions = useDebounceFn(
    async (normalizedQuery: string, requestId: number) => {
        try {
            const [suggestionsResponse, productsResponse] = await Promise.all([
                searchClient
                    .index<IQuerySuggestion>("query_suggestions")
                    .search(normalizedQuery, {
                        hitsPerPage: 3,
                        attributesToHighlight: ["phrase"],
                        highlightPreTag: HIGHLIGHT_START,
                        highlightPostTag: HIGHLIGHT_END,
                    }),
                searchClient
                    .index("cards")
                    .search<SearchProductDocument>(normalizedQuery, {
                        hitsPerPage: 6,
                        attributesToSearchOn: searchableProductAttributes,
                        distinct: "product_id",
                        matchingStrategy: "last",
                        sort: ["rank:asc", "is_tag_new:desc"],
                    }),
            ]);

            const enrichedProducts = await enrichProductsWithDisplayTags(
                productsResponse.hits ?? [],
            );

            if (requestId === searchRequestId) {
                results.value = suggestionsResponse.hits;
                emit("products-change", enrichedProducts);
            }
        } catch {
            if (requestId === searchRequestId) {
                results.value = [];
                emit("products-change", []);
            }
        }
    },
    150,
);

watch(query, (value) => {
    const normalizedQuery = normalizeQuery(value);
    const requestId = ++searchRequestId;

    emit("query-change", Boolean(normalizedQuery));

    if (!normalizedQuery) {
        results.value = [];
        emit("products-change", []);
        return;
    }

    emit("products-change", []);
    loadSuggestions(normalizedQuery, requestId);
});

const selectCategory = (handle: string) => {
    const normalizedQuery = normalizeQuery(query.value);
    if (normalizedQuery) {
        searchStore.addQuery(normalizedQuery);
    }
    router.push({
        path: `/category/${handle}`,
    });
    query.value = "";
    emit("close");
};

const handleForm = () => {
    const normalizedQuery = normalizeQuery(query.value);
    if (!normalizedQuery) return;

    searchStore.addQuery(normalizedQuery);
    router.push({
        path: `/search`,
        query: {
            q: normalizedQuery,
        },
    });
    query.value = "";
    emit("close");
};
</script>

<template>
    <form
        class="search-input flex w-full flex-col-reverse gap-4 sm:mb-6 sm:flex-col sm:gap-6 lg:gap-9"
        @submit.prevent="handleForm"
    >
        <label
            class="relative flex h-12 w-full items-center rounded-full border border-black/15 bg-white px-4 shadow-[0_-8px_20px_rgba(255,255,255,0.9)] sm:h-8 sm:rounded-none sm:border-0 sm:px-0 sm:shadow-none"
        >
            <input
                aria-label="Поиск по каталогу"
                placeholder="ХОЧУ КУПИТЬ"
                type="search"
                required
                v-model="query"
                inputmode="search"
                enterkeyhint="search"
                class="h-full w-full appearance-none pr-20 text-base font-medium uppercase outline-0 placeholder:text-[hsla(0,0%,62%,1)] sm:pr-24 sm:text-2xl"
            />

            <button
                v-if="query"
                type="button"
                aria-label="Очистить поиск"
                class="absolute right-10 flex size-10 cursor-pointer items-center justify-center text-black/45 sm:right-14"
                @click="query = ''"
            >
                <SvgoClose aria-hidden="true" filled class="!mb-0 text-base" />
            </button>

            <button
                type="submit"
                aria-label="Найти"
                class="absolute right-1 flex size-10 cursor-pointer items-center justify-center sm:right-0 sm:w-14"
            >
                <SvgoLongArray
                    aria-hidden="true"
                    class="mb-0! w-8 text-[hsla(0,0%,62%,1)] text-xl sm:w-14! sm:text-2xl"
                    filled
                />
            </button>
        </label>

        <div
            v-if="results.length > 0"
            class="lg:max-h-[42dvh] overflow-y-auto px-1 sm:max-h-none sm:overflow-visible sm:px-0"
        >
            <p
                v-if="results.length"
                class="mb-2 text-xs uppercase text-black/45 sm:hidden"
            >
                Подсказки
            </p>
            <ul
                v-if="results.length"
                class="mb-3 flex flex-col sm:mb-19 sm:gap-5"
            >
                <li
                    v-for="result in results"
                    :key="result.phrase"
                >
                    <button
                        type="button"
                        class="block min-h-10 w-full rounded-lg px-2 py-1.5 text-left text-sm leading-4 font-medium break-words active:bg-black/5 sm:min-h-0 sm:rounded-none sm:px-0 sm:py-0 sm:text-base sm:leading-normal"
                        @click="query = result.phrase"
                    >
                        <span>
                            <template
                                v-for="(
                                    part, partIndex
                                ) in getHighlightedPhraseParts(result)"
                                :key="`${part.value}-${partIndex}`"
                            >
                                <mark
                                    v-if="part.isHighlighted"
                                    class="bg-transparent font-bold text-current"
                                >
                                    {{ part.value }}
                                </mark>
                                <template v-else>{{ part.value }}</template>
                            </template>
                        </span>
                    </button>
                </li>
            </ul>
            <p
                v-if="categories.length"
                class="mb-2 text-xs uppercase text-black/45 sm:hidden"
            >
                Категории
            </p>
            <ul class="flex flex-col sm:gap-3">
                <li
                    v-for="category of categories"
                    :key="category.id"
                >
                    <button
                        type="button"
                        class="flex min-h-10 w-full items-center rounded-lg px-2 text-left text-sm font-medium uppercase active:bg-black/5 sm:min-h-0 sm:rounded-none sm:px-0 sm:text-2xl"
                        @click="selectCategory(category.handle)"
                    >
                        {{ category.name }}
                    </button>
                </li>
            </ul>
        </div>
        <p
            v-else-if="normalizeQuery(query).length > 0"
            class="px-3 text-sm leading-5 text-black/50 sm:px-0 sm:text-base"
        >
            Подсказок не найдено. Нажмите стрелку, чтобы искать по каталогу.
        </p>
        <RecentQueries
            v-else-if="normalizeQuery(query).length === 0"
            @select="query = $event"
        />
    </form>
</template>
<style>
input[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none; /* Removes the default appearance */
    appearance: none; /* Standard property for cross-browser compatibility */
}
</style>
