<script setup lang="ts">
import type { StoreProduct, StoreProductVariant } from "@medusajs/types";
import { createEcommerceProduct } from "#shared/lib/ecommerce-product";
import { useEcommerceAnalytics } from "~/features/ecommerce-analytics";
import { useCartStore } from "../lib/cart.store";

defineOptions({
    inheritAttrs: false,
});

const props = defineProps<{
    product: StoreProduct;
    variant?: StoreProductVariant | null;
    disabled?: boolean;
    iconOnly?: boolean;
    quantityControlsOnlyInCart?: boolean;
}>();

const cartStore = useCartStore();
const ecommerceAnalytics = useEcommerceAnalytics();
const siteConfig = useSiteConfig();
const isAdding = ref(false);
const selectedQuantity = ref(1);
const cartItem = computed(() => {
    if (!props.variant?.id) return null;

    return cartStore.items.find(
        (item) => item.variant_id === props.variant?.id,
    );
});
const isInCart = computed(() => Boolean(cartItem.value));
const quantity = computed(
    () => cartItem.value?.quantity ?? selectedQuantity.value,
);
const isUnavailable = computed(() => props.disabled || !props.variant?.id);
const isBusy = computed(() => isAdding.value || cartStore.isUpdating);
const isIconOnly = computed(() => props.iconOnly ?? false);
const shouldShowQuantityControls = computed(
    () => !props.quantityControlsOnlyInCart || isInCart.value,
);
const canDecrease = computed(
    () => !isUnavailable.value && !isBusy.value && quantity.value > 1,
);

watch(
    () => props.variant?.id,
    () => {
        selectedQuantity.value = 1;
    },
);

function trackCartChange(
    type: "add_to_cart" | "remove_from_cart",
    quantity: number,
) {
    ecommerceAnalytics.track({
        type,
        currency: "RUB",
        products: [
            createEcommerceProduct(props.product, {
                brand: siteConfig.name,
                variant: props.variant,
                quantity,
            }),
        ],
    });
}

function increaseQuantity() {
    if (isUnavailable.value || isBusy.value) return;

    if (!isInCart.value) {
        selectedQuantity.value += 1;
        return;
    }

    void updateCartQuantity(quantity.value + 1);
}

function decreaseQuantity() {
    if (!canDecrease.value) return;

    if (!isInCart.value) {
        selectedQuantity.value -= 1;
        return;
    }

    void updateCartQuantity(quantity.value - 1);
}

async function addToCart() {
    if (!props.variant?.id || isUnavailable.value || isBusy.value) return;

    isAdding.value = true;

    try {
        await cartStore.addVariant(props.variant.id, selectedQuantity.value);
        trackCartChange("add_to_cart", selectedQuantity.value);
    } catch {
        await cartStore.openCart();
    } finally {
        isAdding.value = false;
    }
}

async function updateCartQuantity(nextQuantity: number) {
    const item = cartItem.value;
    if (!item || isBusy.value || nextQuantity < 1) return;

    const previousQuantity = item.quantity;

    try {
        await cartStore.updateLineItemQuantity(item.id, nextQuantity);

        if (nextQuantity > previousQuantity) {
            trackCartChange("add_to_cart", nextQuantity - previousQuantity);
        } else if (nextQuantity < previousQuantity) {
            trackCartChange(
                "remove_from_cart",
                previousQuantity - nextQuantity,
            );
        }
    } catch {
        await cartStore.openCart();
    }
}

async function handlePrimaryAction() {
    if (isInCart.value) {
        await cartStore.openCart();
        return;
    }

    await addToCart();
}
</script>

<template>
    <div
        v-bind="$attrs"
        :class="isIconOnly ? 'inline-flex' : 'flex w-full gap-2'"
    >
        <button
            v-if="isIconOnly"
            type="button"
            class="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-black bg-black text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-gray disabled:bg-gray"
            :disabled="isUnavailable || isBusy"
            :aria-busy="isBusy"
            :aria-label="
                isAdding
                    ? 'Добавляем товар в корзину'
                    : isInCart
                      ? 'Открыть корзину'
                      : 'Добавить в корзину'
            "
            @click="handlePrimaryAction"
        >
            <SvgoCart
                aria-hidden="true"
                filled
                class="!mb-0 text-xl"
            />
        </button>

        <template v-else>
            <div
                v-if="shouldShowQuantityControls"
                class="inline-flex h-12 shrink-0 items-center rounded-lg border border-black/20 bg-white"
                :aria-label="`Количество товара: ${quantity}`"
            >
                <button
                    type="button"
                    class="flex size-11 cursor-pointer items-center justify-center text-xl leading-none disabled:cursor-not-allowed disabled:opacity-35"
                    :disabled="!canDecrease"
                    :aria-label="`Уменьшить количество до ${quantity - 1}`"
                    @click="decreaseQuantity"
                >
                    -
                </button>
                <span
                    aria-live="polite"
                    class="min-w-6 text-center text-base tabular-nums"
                >
                    {{ quantity }}
                </span>
                <button
                    type="button"
                    class="flex size-11 cursor-pointer items-center justify-center text-xl leading-none disabled:cursor-not-allowed disabled:opacity-35"
                    :disabled="isUnavailable || isBusy"
                    :aria-label="`Увеличить количество до ${quantity + 1}`"
                    @click="increaseQuantity"
                >
                    +
                </button>
            </div>
            <button
                type="button"
                class="inline-flex h-12 min-w-0 flex-1 items-center justify-center rounded-lg border border-black bg-black px-5 text-base font-medium text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:border-gray disabled:bg-gray"
                :disabled="isUnavailable || isBusy"
                :aria-busy="isBusy"
                @click="handlePrimaryAction"
            >
                <span class="truncate">
                    {{
                        isAdding
                            ? "Добавляем..."
                            : isInCart
                              ? "В корзину"
                              : "Добавить в корзину"
                    }}
                </span>
            </button>
        </template>
    </div>
</template>
