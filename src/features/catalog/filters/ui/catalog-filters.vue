<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  VisuallyHidden,
  DialogOverlay,
  DialogDescription,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "reka-ui";
import FiltersForm from "./filters-form.vue";
import { useFiltersStore } from "~/shared/lib/filters.store";

const filtersStore = useFiltersStore();
const { isOpen, appliedFilters } = storeToRefs(filtersStore);

const filterCount = computed(() => {
  return Object.keys(appliedFilters.value)?.filter(
    (k) => k !== "metadata.class",
  ).length;
});
</script>
<template>
  <DialogRoot
    :open="isOpen"
    class="relative z-20"
    @update:open="filtersStore.setIsOpen"
  >
    <DialogTrigger as-child>
      <button
        type="button"
        class="flex cursor-pointer gap-2 items-center text-[1.25rem] font-medium leading-6"
      >
        <SvgoFilter aria-hidden="true" filled class="!mb-0" /> Фильтры
        <span
          class="bg-blue text-white flex items-center justify-center size-6 text-sm font-medium rounded-full"
          v-if="filterCount"
          >{{ filterCount }}</span
        >
      </button>
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed dialog-overlay z-10 inset-0 bg-black/30" />
      <DialogContent
        class="bg-white transition-all dialog-content top-0 left-0 fixed z-40 h-screen w-full max-w-full overflow-y-auto p-4 sm:w-[25rem] sm:overflow-visible sm:py-[3.875rem] sm:px-[3.5rem]"
      >
        <VisuallyHidden as-child>
          <DialogTitle>Filters</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden as-child>
          <DialogDescription>Filters</DialogDescription>
        </VisuallyHidden>

        <h2 class="sm:hidden text-xl font-semibold text-center mb-4">
          Фильтры
        </h2>

        <FiltersForm />

        <DialogClose
          aria-label="Закрыть фильтры"
          class="cursor-pointer absolute top-4 right-4 sm:top-3 sm:right-3"
        >
          <SvgoClose aria-hidden="true" filled class="text-2xl !mb-0" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
