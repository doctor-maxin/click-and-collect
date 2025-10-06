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

const isOpen = ref(false);
</script>
<template>
  <DialogRoot v-model:open="isOpen" class="relative z-20">
    <DialogTrigger as-child>
      <button
        class="flex cursor-pointer gap-2 items-center text-[1.25rem] font-medium leading-6"
      >
        <SvgoFilter filled class="!mb-0" /> Фильтры
      </button>
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed dialog-overlay z-10 inset-0 bg-black/30" />
      <DialogContent
        class="bg-white transition-all dialog-content top-0 left-0 fixed z-40 h-screen py-[3.875rem] px-[3.5rem] w-[25rem]"
      >
        <VisuallyHidden as-child>
          <DialogTitle>Filters</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden as-child>
          <DialogDescription>Filters</DialogDescription>
        </VisuallyHidden>

        <FiltersForm />

        <DialogClose class="cursor-pointer absolute top-3 right-3">
          <SvgoClose filled class="text-2xl !mb-0" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
