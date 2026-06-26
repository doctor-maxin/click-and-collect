<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";

const { category, someProduct = false } = defineProps<{
    category: StoreProductCategory & { mpath: string };
    someProduct: boolean;
}>();

const level = computed(() => category?.mpath?.split(".")?.length);
const route = useRoute();
const router = useRouter();
const filtersStore = useFiltersStore();

const { isOnlineEnabled, isOfflineEnabled } = storeToRefs(filtersStore);

const { data: availableCategories } = useNuxtData<string[]>(
    "available-categories",
);
function clearedCategories(list: StoreProductCategory[]) {
    const availableList = list.filter((c) =>
        availableCategories.value?.includes(c.id),
    );
    const uniqueList = new Map<string, StoreProductCategory>();
    availableList.forEach((item) =>
        uniqueList.set(item.name?.toLowerCase(), item),
    );

    return uniqueList.values();
}

const isCategoryActive = (categoryId: string) => {
    const existingCategoryIds: string | undefined | string[] =
        filtersStore.appliedFilters.category_ids;
    if (Array.isArray(existingCategoryIds)) {
        return existingCategoryIds
            .map((id) => id?.trim())
            .includes(categoryId?.trim());
    }
    return existingCategoryIds?.trim() === categoryId?.trim();
};

const handleCategoryClick = (category: StoreProductCategory) => {
    if (isCategoryActive(category.id)) {
        filtersStore.removeFilterValue("category_ids", category.id.trim());
    } else {
        filtersStore.setFilterValue("category_ids", category.id.trim());
    }

    const newQuery = { ...route.query };

    if (filtersStore.appliedFilters.category_ids) {
        newQuery.category_ids = filtersStore.appliedFilters.category_ids;
    } else {
        delete newQuery.category_ids;
    }

    delete newQuery.page;
    delete newQuery._append;

    filtersStore.setAppliedFiltersFromQuery(newQuery);
    filtersStore.setPage(1);

    router.push({
        query: newQuery,
    });
};
</script>

<template>
    <div v-if="level < 3" class="mt-4 mb-6 lg:my-9 flex-wrap flex gap-3">
        <div
            v-for="subCategory of clearedCategories(category.category_children)"
            :key="subCategory.id"
            @click="handleCategoryClick(subCategory)"
        >
            <UiBadge :active="isCategoryActive(subCategory.id)">{{
                subCategory.name
            }}</UiBadge>
        </div>

        <div>
            <UiBadge
                @click="filtersStore.toggleOnline()"
                :active="isOnlineEnabled"
                >Доступно онлайн</UiBadge
            >
        </div>
        <div>
            <UiBadge
                @click="filtersStore.toggleOffline()"
                :active="isOfflineEnabled"
                >Доступно офлайн</UiBadge
            >
        </div>
    </div>
</template>
