<script setup lang="ts">
import { useFavoritesStore } from "../lib/favorites.store";

const favoritesStore = useFavoritesStore();
const {productIds  } = storeToRefs(favoritesStore)

const label = computed(() => (productIds.value.length > 99 ? "99+" : String(productIds.value.length)));
</script>

<template>
    <span
        v-if="productIds.length"
        aria-hidden="true"
        class="absolute -right-2 -top-2 flex size-4 text-center items-center justify-center rounded-full bg-current text-[0.625rem] leading-none"
    >
        <span class="text-white mix-blend-difference">{{ label }}</span>
    </span>
</template>
