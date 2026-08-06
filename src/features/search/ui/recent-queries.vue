<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSearchStore } from "../lib/search.store";

const searchStore = useSearchStore();
const { normalizedHistory } = storeToRefs(searchStore);

defineEmits<{ (e: "select", query: string): void }>();
</script>

<template>
  <div v-if="normalizedHistory.length > 0" class="max-h-[30dvh] overflow-y-auto px-1 sm:max-h-none sm:overflow-visible sm:px-0">
    <span class="mb-2 block text-xs uppercase text-black/45 sm:mb-6 sm:text-base sm:normal-case sm:leading-5 sm:text-[hsl(0,0%,62%)]"
      >Ранее вы искали</span
    >
    <ul class="flex flex-col sm:gap-3">
      <li
        v-for="query in normalizedHistory.slice(0, 3)"
        :key="query"
      >
        <button
          type="button"
          class="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-sm font-medium active:bg-black/5 sm:min-h-0 sm:rounded-none sm:px-0 sm:text-base sm:font-normal"
          @click="$emit('select', query)"
        >
          <SvgoHistory class="text-black/30 mb-0! text-sm" aria-hidden="true" filled />
          <span>{{ query }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
