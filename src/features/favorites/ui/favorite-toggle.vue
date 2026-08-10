<script setup lang="ts">
import {
    type FavoriteProductSnapshot,
    useFavoritesStore,
} from "../lib/favorites.store";

defineOptions({
    inheritAttrs: false,
});

const { product, iconClass } = defineProps<{
    product: FavoriteProductSnapshot;
    iconClass?: string;
}>();

const favoritesStore = useFavoritesStore();
const isFavorite = computed(() => favoritesStore.hasProduct(product.id));

function toggleFavorite() {
    favoritesStore.toggleProduct(product);
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
