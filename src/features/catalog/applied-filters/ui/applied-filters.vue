<script setup lang="ts">
const filtersStore = useFiltersStore();
const { appliedFilters } = storeToRefs(filtersStore);
const router = useRouter();
const route = useRoute();
const count = computed(() => Object.values(appliedFilters.value).length || 0);
const filterEntries = computed(() =>
  Object.entries(appliedFilters.value).filter(
    ([key]) => key !== "metadata.class",
  ),
);

const removeFilterValue = (filter: string, value: string) => {
  filtersStore.removeFilterValue(filter, value);

  const query: Record<string, string | string[]> = {
    ...appliedFilters.value,
  };

  if (route.query.q) {
    query.q = route.query.q.toString();
  }

  router.push({
    query,
  });
};

const resetFilters = () => {
  filtersStore.resetFilters();

  router.push({
    query: route.query.q ? { q: route.query.q.toString() } : {},
  });
};
</script>
<template>
  <div v-if="count > 0" class="flex w-full gap-8 items-start">
    <div class="flex w-full gap-4 flex-wrap">
      <template v-for="[filter, values] of filterEntries" :key="filter">
        <button
          v-for="value of values"
          class="px-2 py-1 cursor-pointer border rounded-lg flex items-center gap-2"
          @click="removeFilterValue(filter, value)"
        >
          <span class="text-sm">{{ value }}</span>
          <SvgoClose class="!mb-0 text-[1.5rem]" filled />
        </button>
      </template>
    </div>
    <button
      class="underline whitespace-nowrap cursor-pointer"
      type="button"
      @click="resetFilters"
    >
      Сбросить фильтры
    </button>
  </div>
</template>
