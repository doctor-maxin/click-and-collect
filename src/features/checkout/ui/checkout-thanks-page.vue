<script setup lang="ts">
import { NOINDEX_FOLLOW_ROBOTS } from "#shared/lib/seo";
import { formatCartPrice } from "~/features/cart";
import { useCheckoutStore } from "../lib/checkout.store";
import { formatPickupPhone } from "../lib/pickup-store";

const checkoutStore = useCheckoutStore();
const {lastOrder} = storeToRefs(checkoutStore);
const orderNumber = computed(() => lastOrder.value?.displayId ?? null);
const pickupStore = computed(() => lastOrder.value?.pickupStore ?? null);
const orderItems = computed(() => lastOrder.value?.items ?? []);
const orderTotal = computed(() =>
    lastOrder.value
        ? formatCartPrice(lastOrder.value.total, lastOrder.value.currencyCode)
        : null,
);

useSeoMeta({
    title: "Заказ принят",
    robots: NOINDEX_FOLLOW_ROBOTS,
});
</script>

<template>
    <main class="min-h-screen bg-[#fafafa] pb-12 pt-20 lg:pb-20 lg:pt-40">
        <section
            class="container mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-4 text-center 2.5xl:px-0"
        >
            <div
                class="flex size-16 items-center justify-center rounded-full bg-blue text-2xl text-white"
                aria-hidden="true"
            >
                ✓
            </div>
            <p class="mt-6 text-sm text-black/50">
                Самовывоз из магазина
            </p>
            <h1 class="mt-2 font-serif text-3xl font-medium lg:text-5xl">
                Заказ принят
            </h1>
            <p v-if="orderNumber" class="mt-4 text-base text-black/65">
                Номер заказа: <span class="font-medium text-black">{{ orderNumber }}</span>
            </p>
            <p v-if="orderTotal" class="mt-2 text-sm text-black/60">
                Сумма заказа: {{ orderTotal }}
            </p>
            <p class="mt-3 max-w-lg text-sm leading-6 text-black/60">
                Мы проверим и соберем заказ. Подтверждение придет на указанный
                email, а о готовности к выдаче сообщим отдельно.
            </p>

            <div
                v-if="pickupStore"
                class="mt-7 w-full max-w-lg rounded-2xl bg-white p-5 text-left shadow-sm"
            >
                <p class="text-xs uppercase tracking-[0.12em] text-black/45">
                    Забрать в магазине
                </p>
                <h2 class="mt-2 text-lg font-medium">
                    {{ pickupStore.name }}
                </h2>
                <p class="mt-1 text-sm leading-5 text-black/60">
                    {{ pickupStore.address }}
                </p>
                <p
                    v-if="pickupStore.workingTime"
                    class="mt-3 text-sm text-black/55"
                >
                    {{ pickupStore.workingTime }}
                </p>
                <a
                    v-if="formatPickupPhone(pickupStore)"
                    :href="`tel:+${pickupStore.phone}`"
                    class="mt-2 inline-block text-sm underline underline-offset-2"
                >
                    {{ formatPickupPhone(pickupStore) }}
                </a>
            </div>

            <div
                v-if="orderItems.length"
                class="mt-5 w-full max-w-lg rounded-2xl bg-white p-5 text-left shadow-sm"
            >
                <p class="text-xs uppercase tracking-[0.12em] text-black/45">
                    Состав заказа
                </p>
                <ul class="mt-3 divide-y divide-black/10">
                    <li
                        v-for="item in orderItems"
                        :key="item.id"
                        class="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                        <div class="min-w-0">
                            <p class="truncate text-sm font-medium">
                                {{ item.title }}
                            </p>
                            <p
                                v-if="item.variantTitle"
                                class="mt-1 text-xs text-black/50"
                            >
                                {{ item.variantTitle }}
                            </p>
                            <p class="mt-1 text-xs text-black/50">
                                Количество: {{ item.quantity }}
                            </p>
                        </div>
                        <span class="shrink-0 text-sm font-medium">
                            {{
                                formatCartPrice(
                                    item.total,
                                    lastOrder?.currencyCode ?? "rub",
                                )
                            }}
                        </span>
                    </li>
                </ul>
            </div>

            <NuxtLink
                to="/"
                class="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-blue px-6 text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
                Продолжить покупки
            </NuxtLink>
        </section>
    </main>
</template>
