<script setup lang="ts">
import { PopoverRoot, PopoverTrigger, PopoverContent } from "reka-ui";

const isOpen = ref(true);
</script>
<template>
  <PopoverRoot modal v-model:open="isOpen" class="relative z-20">
    <PopoverTrigger class="cursor-pointer">
      <SvgoClose v-if="isOpen" filled class="text-2xl" />
      <SvgoSearch v-else filled class="text-2xl" />
    </PopoverTrigger>
    <PopoverContent
      disableOutsidePointerEvents
      disableUpdateOnLayoutShift
      positionStrategy="fixed"
      class="bg-white py-9 mt-[3.25rem] block w-[var(--reka-popper-available-width)] min-h-[var(--reka-popper-available-height)]"
    >
      <div class="container px-4 flex gap-4 lg:gap-[7.75rem] mx-auto">
        <div>
          <h3 class="text-[1.75rem] mb-9 font-medium leading-9 uppercase">
            Популярные товары
          </h3>
        </div>
        <div class="pt-[5.5rem]">
            <>
        </div>
      </div>
    </PopoverContent>
  </PopoverRoot>
</template>
