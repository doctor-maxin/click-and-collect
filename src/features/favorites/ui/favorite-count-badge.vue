<script setup lang="ts">
import { useFavoritesStore } from "../lib/favorites.store";

const favoritesStore = useFavoritesStore();
const count = ref(favoritesStore.productIds.length);

favoritesStore.$subscribe(
    (_mutation, state) => {
        count.value = state.productIds.length;
    },
    { flush: "sync" },
);

const label = computed(() => (count.value > 99 ? "99+" : String(count.value)));
</script>

<template>
    <span
        v-if="count"
        aria-hidden="true"
        class="absolute -right-2 -top-2 flex size-4 text-center items-center justify-center rounded-full bg-current text-[0.625rem] leading-none"
    >
        <span class="text-white mix-blend-difference">{{ label }}</span>
    </span>
</template>
