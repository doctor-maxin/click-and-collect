<script setup lang="ts">
import type { StoreCartLineItem } from "@medusajs/types";
import { formatCartPrice } from "../lib/format-cart-price";
import { MAX_VARIANT_QUANTITY } from "../lib/cart.store";

const props = defineProps<{
    item: StoreCartLineItem;
    currencyCode: string;
    isUpdating: boolean;
}>();

defineEmits<{
    decrease: [];
    increase: [];
    remove: [];
    navigate: [];
}>();

const title = computed(
    () => props.item.product_title || props.item.title || "Товар",
);
const itemTotal = computed(
    () =>
        props.item.total ?? props.item.unit_price * props.item.quantity,
);
</script>

<template>
    <li class="flex gap-3 py-4 first:pt-0">
        <NuxtLink
            v-if="item.product_handle"
            :to="`/products/${item.product_handle}`"
            class="block h-28 w-21 shrink-0 overflow-hidden rounded-md bg-[#f5f5f5]"
            :aria-label="`Открыть товар ${title}`"
            @click="$emit('navigate')"
        >
            <img
                v-if="item.thumbnail"
                :src="item.thumbnail"
                :alt="title"
                width="84"
                height="112"
                class="size-full object-cover"
                loading="lazy"
            />
        </NuxtLink>
        <div
            v-else
            class="h-28 w-21 shrink-0 overflow-hidden rounded-md bg-[#f5f5f5]"
        >
            <img
                v-if="item.thumbnail"
                :src="item.thumbnail"
                :alt="title"
                width="84"
                height="112"
                class="size-full object-cover"
                loading="lazy"
            />
        </div>

        <div class="flex min-w-0 flex-1 flex-col">
            <div class="flex items-start gap-3">
                <NuxtLink
                    v-if="item.product_handle"
                    :to="`/products/${item.product_handle}`"
                    class="min-w-0 flex-1 text-sm font-medium uppercase leading-5 hover:opacity-60"
                    @click="$emit('navigate')"
                >
                    {{ title }}
                </NuxtLink>
                <span
                    v-else
                    class="min-w-0 flex-1 text-sm font-medium uppercase leading-5"
                >
                    {{ title }}
                </span>
                <button
                    type="button"
                    class="-mr-1 -mt-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-black/60 hover:bg-black/5 hover:text-black disabled:cursor-not-allowed"
                    :disabled="isUpdating"
                    :aria-label="`Удалить ${title} из корзины`"
                    @click="$emit('remove')"
                >
                    <SvgoClose
                        aria-hidden="true"
                        filled
                        class="!mb-0 text-base"
                    />
                </button>
            </div>
            <span
                v-if="item.variant_sku"
                class="mt-1 text-xs leading-4 text-black/55"
            >
                {{ item.variant_sku }}
            </span>

            <div class="mt-auto flex items-end justify-between gap-3 pt-3">
                <div
                    class="inline-flex h-9 items-center rounded-lg border border-black/15"
                    :aria-label="`Количество товара ${title}`"
                >
                    <button
                        type="button"
                        class="flex size-8 cursor-pointer items-center justify-center text-lg leading-none disabled:cursor-not-allowed disabled:opacity-35"
                        :disabled="isUpdating || item.quantity <= 1"
                        :aria-label="`Уменьшить количество ${title}`"
                        @click="$emit('decrease')"
                    >
                        -
                    </button>
                    <span
                        aria-live="polite"
                        class="min-w-5 text-center text-sm tabular-nums"
                    >
                        {{ item.quantity }}
                    </span>
                    <button
                        type="button"
                        class="flex size-8 cursor-pointer items-center justify-center text-lg leading-none disabled:cursor-not-allowed disabled:opacity-35"
                        :disabled="isUpdating || item.quantity >= MAX_VARIANT_QUANTITY"
                        :aria-label="`Увеличить количество ${title}`"
                        @click="$emit('increase')"
                    >
                        +
                    </button>
                </div>
                <span class="shrink-0 text-sm font-medium">
                    {{ formatCartPrice(itemTotal, currencyCode) }}
                </span>
            </div>
        </div>
    </li>
</template>
