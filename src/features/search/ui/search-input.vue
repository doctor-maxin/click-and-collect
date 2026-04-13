<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";
import { useSearchStore } from "../lib/search.store";
import type { IQuerySuggestion } from "../model/query-suggestion.model";
import RecentQueries from "./recent-queries.vue";

const query = ref("");
const normalizeQuery = (value: string) => value.replace(/\s+/g, " ").trim();
const searchClient = useSearchClient();
const results = ref<IQuerySuggestion[]>([]);
const searchStore = useSearchStore();
const router = useRouter();
const { data: productCategories } =
    useNuxtData<StoreProductCategory[]>("categories");
const emit = defineEmits<{
    (e: "close"): void;
}>();

const collectDescendantIds = (categories: StoreProductCategory[]) => {
    const ids = new Set<string>();

    for (const category of categories) {
        ids.add(category.id);

        for (const childId of collectDescendantIds(
            category.category_children ?? [],
        )) {
            ids.add(childId);
        }
    }

    return ids;
};

const allowedCategoryIds = computed(() => {
    const ids = new Set<string>();

    for (const rootHandle of ["menu", "open"]) {
        const rootCategory = productCategories.value?.find(
            (category) => category.handle === rootHandle,
        );

        if (!rootCategory?.category_children?.length) continue;

        for (const childId of collectDescendantIds(
            rootCategory.category_children,
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

const handleQuery = async () => {
    const normalizedQuery = normalizeQuery(query.value);

    if (!normalizedQuery) {
        results.value = [];
        return;
    }
    const response = await searchClient
        .index<IQuerySuggestion>("query_suggestions")
        .search(normalizedQuery, {
            hitsPerPage: 5,
        });

    results.value = response.hits;
};

watch(query, handleQuery);

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
        class="flex flex-col w-full mb-6 gap-6 lg:gap-9"
        @submit.prevent="handleForm"
    >
        <label class="flex items-center relative w-full">
            <input
                placeholder="ХОЧУ КУПИТЬ"
                type="search"
                required
                v-model="query"
                class="h-8 pr-14 w-full outline-0 placeholder:text-[hsla(0,0%,62%,1)] appearance-none text-2xl placeholder:font-medium"
            />

            <button type="submit" class="absolute cursor-pointer right-0">
                <SvgoLongArray
                    class="mb-0! text-[hsla(0,0%,62%,1)] w-14! text-2xl"
                    filled
                />
            </button>
        </label>

        <div v-if="results?.length > 0">
            <ul class="flex mb-6 lg:mb-19 flex-col gap-3 lg:gap-5">
                <li
                    v-for="result in results"
                    class="cursor-pointer"
                    :key="result.phrase"
                    @click="query = result.phrase"
                >
                    {{ result.phrase }}
                </li>
            </ul>
            <ul class="flex flex-col gap-3">
                <li
                    v-for="category of categories"
                    class="cursor-pointer text-base lg:text-2xl font-medium uppercase"
                    @click="selectCategory(category.handle)"
                >
                    {{ category.name }}
                </li>
            </ul>
        </div>
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
