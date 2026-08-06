<script setup lang="ts">
import { useCartStore } from "../lib/cart.store";

defineOptions({
    inheritAttrs: false,
});

const cartStore = useCartStore();
const isMounted = ref(false);
const itemCountLabel = computed(() =>
    cartStore.itemCount > 99 ? "99+" : String(cartStore.itemCount),
);

onMounted(() => {
    isMounted.value = true;
});

async function openCart(event: MouseEvent) {
    // The Drawer hides the page from assistive tech; do not leave focus in it.
    (event.currentTarget as HTMLButtonElement).blur();
    await cartStore.openCart();
}
</script>

<template>
    <button
        v-bind="$attrs"
        type="button"
        class="relative inline-flex items-center justify-center"
        aria-label="Открыть корзину"
        :aria-expanded="cartStore.isOpen"
        @click="openCart"
    >
        <div class="relative">
            <slot>
                <SvgoCart aria-hidden="true" filled class="!mb-0 text-2xl" />
            </slot>
            <span
                v-if="isMounted && cartStore.itemCount"
                aria-hidden="true"
                class="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-black text-[0.625rem] leading-none text-white"
            >
                {{ itemCountLabel }}
            </span>
        </div>

    </button>
</template>
