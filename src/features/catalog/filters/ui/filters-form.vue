<script setup lang="ts">
import { useFiltersStore } from "~/pages/category/lib/filters.store";
import { UiAutocomplete } from "#components";

const filtersStore = useFiltersStore();
const { filtersList } = storeToRefs(filtersStore);
</script>
<template>
  <div class="flex flex-col w-full gap-5">
    <UiAutocomplete
      :options="filtersList['size'] ?? []"
      name="size"
      placeholder="Размер"
    />
    <UiAutocomplete
      :options="filtersList['color'] ?? []"
      name="color"
      placeholder="Цвет"
    />
    <div class="flex gap-3 flex-col mt-4">
      <UiButton>Показать товары</UiButton>
      <UiButton variant="outline">Сбросить</UiButton>
    </div>
  </div>
</template>
