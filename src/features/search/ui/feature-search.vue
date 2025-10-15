<script setup lang="ts">
import { PopoverRoot, PopoverTrigger, PopoverContent } from "reka-ui";
import PopularProducts from "./popular-products.vue";
import SearchInput from "./search-input.vue";

const isOpen = ref(false);
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
      :side-offset="52"
      positionStrategy="fixed"
      class="bg-white py-9 block overflow-y-auto box-border w-[var(--reka-popper-available-width)] h-[var(--reka-popper-available-height)]"
    >
      <div class="container px-4 grid grid-cols-2 gap-4 mx-auto">
        <PopularProducts />
        <div class="lg:pl-[7.75rem] pt-[4.5rem]">
          <SearchInput @close="isOpen = false" />
        </div>
      </div>
    </PopoverContent>
  </PopoverRoot>
</template>
