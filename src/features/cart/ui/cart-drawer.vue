<script setup lang="ts">
import type { StoreCartLineItem } from "@medusajs/types";
import {
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHandle,
    DrawerOverlay,
    DrawerPortal,
    DrawerRoot,
    DrawerTitle,
} from "vaul-vue";
import { VisuallyHidden } from "reka-ui";
import { createEcommerceProduct } from "#shared/lib/ecommerce-product";
import { useEcommerceAnalytics } from "~/features/ecommerce-analytics";
import { useCartStore } from "../lib/cart.store";
import { formatCartPrice } from "../lib/format-cart-price";
import CartLineItem from "./cart-line-item.vue";

const cartStore = useCartStore();
const ecommerceAnalytics = useEcommerceAnalytics();
const siteConfig = useSiteConfig();
const isDesktop = useMediaQuery("(min-width: 64rem)");
const drawerDirection = computed(() =>
    isDesktop.value ? "right" : "bottom",
);

const currencyCode = computed(
    () => cartStore.cart?.currency_code?.toUpperCase() || "RUB",
);
const total = computed(() => cartStore.cart?.total ?? 0);
const hasItems = computed(() => cartStore.items.length > 0);
const itemCountLabel = computed(() => {
    const count = cartStore.itemCount;
    return count === 1 ? "1 товар" : `${count} товаров`;
});

onMounted(() => {
    void cartStore.restoreCart();
});

function setOpen(isOpen: boolean) {
    if (isOpen) {
        void cartStore.openCart();
        return;
    }

    cartStore.closeCart();
}

async function navigateToCheckout(event: MouseEvent) {
    (event.currentTarget as HTMLButtonElement).blur();
    cartStore.closeCart();
    await navigateTo("/checkout");
}

function trackCartChange(
    type: "add_to_cart" | "remove_from_cart",
    item: StoreCartLineItem,
    quantity: number,
) {
    if (!item.product) return;

    ecommerceAnalytics.track({
        type,
        currency: currencyCode.value,
        products: [
            createEcommerceProduct(item.product, {
                brand: siteConfig.name,
                variant: item.variant,
                price: item.unit_price,
                quantity,
            }),
        ],
    });
}

async function updateQuantity(item: StoreCartLineItem, quantity: number) {
    if (quantity < 1 || cartStore.isUpdating) return;

    const previousQuantity = item.quantity;

    try {
        await cartStore.updateLineItemQuantity(item.id, quantity);

        if (quantity > previousQuantity) {
            trackCartChange("add_to_cart", item, quantity - previousQuantity);
        } else if (quantity < previousQuantity) {
            trackCartChange(
                "remove_from_cart",
                item,
                previousQuantity - quantity,
            );
        }
    } catch {
        // The drawer renders the store error without losing the current cart.
    }
}

async function removeItem(item: StoreCartLineItem) {
    if (cartStore.isUpdating) return;

    try {
        await cartStore.removeLineItem(item.id);
        trackCartChange("remove_from_cart", item, item.quantity);
    } catch {
        // The drawer renders the store error without losing the current cart.
    }
}
</script>

<template>
    <DrawerRoot
        :open="cartStore.isOpen"
        :direction="drawerDirection"
        :close-threshold="0.15"
        handle-only
        @update:open="setOpen"
    >
        <DrawerPortal>
            <DrawerOverlay
                class="cart-drawer-overlay fixed inset-0 z-[85] bg-black/35"
            />
            <DrawerContent
                class="cart-drawer-content fixed inset-x-0 bottom-0 z-[90] flex h-[calc(100dvh-0.75rem)] max-h-[44rem] flex-col overflow-hidden rounded-t-2xl bg-white outline-none lg:inset-y-0 lg:left-auto lg:h-screen lg:max-h-none lg:w-[28rem] lg:max-w-[calc(100vw-1rem)] lg:rounded-none"
            >
                <div
                    class="flex h-11 w-full shrink-0 items-center justify-center lg:hidden"
                >
                    <DrawerHandle />
                </div>

                <VisuallyHidden as-child>
                    <DrawerTitle>Корзина</DrawerTitle>
                </VisuallyHidden>
                <VisuallyHidden as-child>
                    <DrawerDescription>
                        Товары, добавленные в корзину
                    </DrawerDescription>
                </VisuallyHidden>

                <header class="flex items-center justify-between border-b border-black/10 px-4 py-4 lg:px-6">
                    <div>
                        <h2 class="text-xl font-medium uppercase">Корзина</h2>
                        <span class="mt-1 block text-xs text-black/55">
                            {{ itemCountLabel }}
                        </span>
                    </div>
                    <DrawerClose
                        type="button"
                        class="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-black/5"
                        aria-label="Закрыть корзину"
                    >
                        <SvgoClose
                            aria-hidden="true"
                            filled
                            class="!mb-0 text-xl"
                        />
                    </DrawerClose>
                </header>

                <div
                    v-if="cartStore.errorMessage"
                    role="alert"
                    class="mx-4 mt-4 rounded-md bg-red/10 px-3 py-2 text-sm leading-5 text-red lg:mx-6"
                >
                    {{ cartStore.errorMessage }}
                </div>

                <div
                    v-if="cartStore.isRestoring"
                    class="flex min-h-0 flex-1 items-center justify-center px-4 text-sm text-black/55"
                >
                    Загружаем корзину...
                </div>
                <div
                    v-else-if="!hasItems"
                    class="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center"
                >
                    <SvgoCart
                        aria-hidden="true"
                        filled
                        class="!mb-4 text-4xl text-black/25"
                    />
                    <p class="text-lg font-medium">В корзине пока пусто</p>
                    <p class="mt-2 text-sm leading-5 text-black/55">
                        Добавьте товар, чтобы продолжить оформление заказа.
                    </p>
                    <button
                        type="button"
                        class="mt-6 h-11 rounded-lg border border-black px-5 text-sm font-medium uppercase hover:bg-black hover:text-white"
                        @click="cartStore.closeCart"
                    >
                        Продолжить покупки
                    </button>
                </div>
                <div v-else class="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6">
                    <ul class="divide-y divide-black/10">
                        <CartLineItem
                            v-for="item in cartStore.items"
                            :key="item.id"
                            :item="item"
                            :currency-code="currencyCode"
                            :is-updating="cartStore.isUpdating"
                            @decrease="updateQuantity(item, item.quantity - 1)"
                            @increase="updateQuantity(item, item.quantity + 1)"
                            @remove="removeItem(item)"
                            @navigate="cartStore.closeCart"
                        />
                    </ul>
                </div>

                <footer
                    v-if="hasItems"
                    class="border-t border-black/10 bg-white px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] lg:px-6 lg:pb-6"
                >
                    <div class="flex items-center justify-between gap-4 text-lg font-medium">
                        <span>Итого</span>
                        <span>{{ formatCartPrice(total, currencyCode) }}</span>
                    </div>
                    <button
                        type="button"
                        class="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-blue px-5 text-sm font-medium uppercase text-white transition-opacity hover:opacity-80"
                        @click="navigateToCheckout"
                    >
                        Оформить заказ
                    </button>
                    <button
                        type="button"
                        class="mt-3 flex h-11 w-full items-center justify-center rounded-lg border border-black px-5 text-sm font-medium uppercase transition-colors hover:bg-black hover:text-white"
                        @click="cartStore.closeCart"
                    >
                        Продолжить покупки
                    </button>
                </footer>
            </DrawerContent>
        </DrawerPortal>
    </DrawerRoot>
</template>
