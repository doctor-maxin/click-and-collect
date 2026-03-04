<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";

const { category } = defineProps<{
  category: StoreProductCategory & { mpath: string };
}>();

const level = computed(() => category.mpath.split(".").length);
const route = useRoute();
const router = useRouter();
const filtersStore = useFiltersStore();

console.log("category", level.value);
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

const isCategoryActive = (categoryName: string) => {
  const existingClass = filtersStore.appliedFilters["metadata.class"];
  if (Array.isArray(existingClass)) {
    return existingClass.map((c) => c?.trim()).includes(categoryName?.trim());
  }
  return existingClass?.trim() === categoryName?.trim();
};

const handleCategoryClick = (category: StoreProductCategory) => {
  const existingClass = filtersStore.appliedFilters["metadata.class"];

  if (isCategoryActive(category.name)) {
    filtersStore.removeFilterValue("metadata.class", category.name?.trim());
  } else {
    filtersStore.setFilterValue("metadata.class", category.name?.trim());
  }

  const newQuery = { ...route.query };

  if (filtersStore.appliedFilters["metadata.class"]) {
    newQuery["metadata.class"] = filtersStore.appliedFilters["metadata.class"];
  } else {
    delete newQuery["metadata.class"];
  }

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
      <UiBadge :active="isCategoryActive(subCategory.name)">{{
        subCategory.name
      }}</UiBadge>
    </div>
  </div>
</template>
