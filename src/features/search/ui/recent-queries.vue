<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSearchStore } from "../lib/search.store";

const searchStore = useSearchStore();
const { normalizedHistory } = storeToRefs(searchStore);

defineEmits<{ (e: "select", query: string): void }>();
</script>

<template>
  <div v-if="normalizedHistory.length > 0">
    <span class="block mb-6 text-base leading-5 text-[hsl(0,0%,62%)]"
      >Ранее вы искали</span
    >
    <ul class="flex flex-col gap-3">
      <li
        class="flex items-center gap-2"
        v-for="query in normalizedHistory.slice(0, 3)"
        :key="query"
        @click="$emit('select', query)"
      >
        <SvgoSearch filled />
        <span>
          {{ query }}
        </span>
      </li>
    </ul>
  </div>
</template>
