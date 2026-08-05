<script setup lang="ts">
import { useFavoritesStore } from "../lib/favorites.store";

defineOptions({
    inheritAttrs: false,
});

const { productId, iconClass } = defineProps<{
    productId: string;
    iconClass?: string;
}>();

const favoritesStore = useFavoritesStore();
const isFavorite = computed(() => favoritesStore.hasProduct(productId));

function toggleFavorite() {
    favoritesStore.toggleProduct(productId);
}
</script>

<template>
    <button
        v-bind="$attrs"
        type="button"
        :aria-label="
            isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'
        "
        :aria-pressed="isFavorite"
        @pointerdown.stop
        @click.stop.prevent="toggleFavorite"
    >
        <SvgoHeart
            aria-hidden="true"
            class="text-xl"
            :filled="!isFavorite"
            :class="iconClass"
        />
    </button>
</template>
