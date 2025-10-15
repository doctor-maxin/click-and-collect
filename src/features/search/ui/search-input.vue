<script setup lang="ts">
import { useSearchStore } from "../lib/search.store";
import type { IQuerySuggestion } from "../model/query-suggestion.model";
import RecentQueries from "./recent-queries.vue";

const query = ref("");
const searchClient = useSearchClient();
const results = ref<IQuerySuggestion[]>([]);
const searchStore = useSearchStore();
const router = useRouter();
const emit = defineEmits<{
  (e: "close"): void;
}>();

const categories = computed(() => {
  const list = new Map<string, IQuerySuggestion["categories"][0]>();

  for (const hit of results.value) {
    for (const category of hit.categories) {
      list.set(category.name, category);
      if (list.size === 3) return Array.from(list.values());
    }
  }

  return Array.from(list.values());
});

const handleQuery = async () => {
  if (query.value === "") {
    results.value = [];
    return;
  }
  const response = await searchClient
    .index<IQuerySuggestion>("query_suggestions")
    .search(query.value, {
      hitsPerPage: 5,
    });

  results.value = response.hits;
};

watch(query, handleQuery);

const selectCategory = (handle: string) => {
  searchStore.addQuery(query.value);
  router.push({
    path: `/category/${handle}`,
  });
  query.value = "";
  emit("close");
};

const handleForm = () => {
  searchStore.addQuery(query.value);
  router.push({
    path: `/search`,
    query: {
      q: query.value,
    },
  });
  query.value = "";
  emit("close");
};
</script>

<template>
  <form class="flex flex-col w-full gap-9" @submit.prevent="handleForm">
    <label class="flex items-center relative max-w-[18.75rem] w-full">
      <input
        placeholder="ХОЧУ КУПИТЬ"
        type="search"
        v-model="query"
        class="h-8 outline-0 placeholder:text-[hsla(0,0%,62%,1)] appearance-none text-2xl placeholder:font-medium"
      />

      <button type="submit" class="absolute right-0">
        <SvgoLongArray
          class="!mb-0 text-[hsla(0,0%,62%,1)] !w-[3.5rem] text-2xl"
          filled
        />
      </button>
    </label>

    <div v-if="results?.length > 0">
      <ul class="flex mb-19 flex-col gap-5">
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
          class="cursor-pointer text-2xl font-medium uppercase"
          @click="selectCategory(category.handle)"
        >
          {{ category.name }}
        </li>
      </ul>
    </div>
    <RecentQueries v-else-if="query.length === 0" @select="query = $event" />
  </form>
</template>
<style>
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none; /* Removes the default appearance */
  appearance: none; /* Standard property for cross-browser compatibility */
}
</style>
