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
const getFilterLabel = (filter: string, value: string) => {
    if (filter === "is_discounted") return "Со скидкой";
    return value;
};

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
    <div
        v-if="count > 0"
        class="flex flex-col lg:flex-row w-full gap-3 lg:gap-8 items-start"
    >
        <div class="flex w-full gap-3 lg:gap-4 flex-wrap">
            <template v-for="[filter, values] of filterEntries" :key="filter">
                <button
                    v-for="value of values"
                    class="cursor-pointer flex items-center gap-2"
                    :class="{
                        'px-2 py-1 border rounded-lg':
                            filter !== 'is_discounted',
                    }"
                    @click="removeFilterValue(filter, value)"
                >
                    <UiBadge v-if="filter === 'is_discounted'" :active="true">
                        {{ getFilterLabel(filter, value) }}
                    </UiBadge>
                    <span v-else class="text-sm">{{
                        getFilterLabel(filter, value)
                    }}</span>
                    <SvgoClose class="mb-0! text-[1.5rem]" filled />
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
