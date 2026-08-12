<script setup lang="ts">
import type { StoreCartLineItem } from "@medusajs/types";
import {
    createCheckoutLastOrder,
    getCheckoutRecipientErrors,
    formatRussianPhone,
    normalizeCheckoutRecipient,
    type CheckoutRecipientField,
    type PickupStore,
} from "#shared/types/checkout";
import { NOINDEX_FOLLOW_ROBOTS } from "#shared/lib/seo";
import { formatCartPrice, useCartStore } from "~/features/cart";
import { useAuthStore } from "~/features/auth/lib/auth.store";
import { useCheckoutStore } from "../lib/checkout.store";
import { formatPickupPhone } from "../lib/pickup-store";
import PickupStorePicker from "./pickup-store-picker.vue";

const cartStore = useCartStore();
const checkoutStore = useCheckoutStore();
const authStore = useAuthStore();
const isReady = ref(false);
const isStorePickerOpen = ref(false);
const recipientErrors = ref<
    Partial<Record<CheckoutRecipientField, string>>
>({});
const pickupStoreError = ref<string | null>(null);

const currencyCode = computed(
    () => cartStore.cart?.currency_code?.toUpperCase() || "RUB",
);
const total = computed(() => cartStore.cart?.total ?? 0);
const hasItems = computed(() => cartStore.items.length > 0);
const isSubmitting = computed(
    () => cartStore.isCheckingOut || cartStore.isUpdating,
);
const itemCountLabel = computed(() => {
    const count = cartStore.itemCount;

    if (count % 10 === 1 && count % 100 !== 11) {
        return `${count} товар`;
    }

    if (
        count % 10 >= 2 &&
        count % 10 <= 4 &&
        (count % 100 < 12 || count % 100 > 14)
    ) {
        return `${count} товара`;
    }

    return `${count} товаров`;
});

useSeoMeta({
    title: "Оформление заказа",
    robots: NOINDEX_FOLLOW_ROBOTS,
});

onMounted(async () => {
    await cartStore.restoreCart();

    const customer = await authStore.restoreSession();
    if (customer) {
        try {
            await checkoutStore.restorePreferredPickupStore();
        } catch {
            // The checkout remains usable when the saved pickup point is unavailable.
        }
    }

    isReady.value = true;
});

function updateRecipient(field: CheckoutRecipientField, event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    const value =
        field === "phone" ? formatRussianPhone(target.value) : target.value;

    if (target.value !== value) {
        target.value = value;
    }

    checkoutStore.setRecipientField(field, value);
    delete recipientErrors.value[field];
}

function openStorePicker(event: MouseEvent) {
    (event.currentTarget as HTMLButtonElement).blur();
    isStorePickerOpen.value = true;
}

async function selectPickupStore(store: PickupStore) {
    checkoutStore.setPickupStore(store);
    pickupStoreError.value = null;

    if (!authStore.customer) return;

    try {
        const customer = await checkoutStore.savePreferredPickupStore(store);
        authStore.setCustomer(customer);
    } catch (error) {
        console.error("Failed to save preferred pickup store", error);
    }
}

function getItemTitle(item: StoreCartLineItem) {
    return item.product_title || item.title || "Товар";
}

async function focusFirstInvalidField() {
    const field = Object.keys(recipientErrors.value)[0] as
        | CheckoutRecipientField
        | undefined;

    if (!field) return;

    await nextTick();
    document.getElementById(`checkout-${field}`)?.focus();
}

async function submitCheckout() {
    if (!hasItems.value || isSubmitting.value) return;

    const recipient = normalizeCheckoutRecipient(checkoutStore.recipient);
    const pickupStore = checkoutStore.pickupStore;
    const errors = getCheckoutRecipientErrors(recipient);
    recipientErrors.value = errors;
    checkoutStore.setRecipient(recipient);
    pickupStoreError.value = pickupStore
        ? null
        : "Выберите магазин для самовывоза.";

    if (Object.keys(errors).length || !pickupStore) {
        await focusFirstInvalidField();
        return;
    }

    try {
        if (authStore.customer) {
            await cartStore.transferCartToCustomer({ required: true });
        }

        const completedCheckout = await cartStore.completePickupCheckout(
            recipient,
            pickupStore,
        );

        checkoutStore.setLastOrder(
            createCheckoutLastOrder(
                completedCheckout.order,
                pickupStore,
                completedCheckout.items,
            ),
        );

        if (authStore.customer) {
            try {
                const customer = await checkoutStore.saveCustomerCheckoutProfile(
                    recipient,
                    pickupStore,
                );
                authStore.setCustomer(customer);
            } catch (error) {
                console.error("Failed to save customer checkout profile", error);
            }
        }

        cartStore.clearCart();
        cartStore.closeCart();
        await nextTick();

        await navigateTo("/checkout/thanks");
    } catch (err) {
        console.error('error')
        // The Store API error is retained in cartStore.errorMessage for the user.
    }
}
</script>

<template>
    <main class="min-h-screen bg-[#fafafa] pb-12 pt-4 lg:pb-20 lg:pt-10">
        <div class="container mx-auto px-4 2.5xl:px-0">
            <div
                v-if="!isReady"
                class="flex min-h-[50vh] items-center justify-center text-sm text-black/55"
            >
                Загружаем оформление заказа...
            </div>

            <section
                v-else-if="!hasItems"
                class="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center rounded-2xl bg-white px-6 text-center"
            >
                <SvgoCart
                    aria-hidden="true"
                    filled
                    class="!mb-5 text-5xl text-black/20"
                />
                <h1 class="text-2xl font-medium uppercase">
                    Корзина пуста
                </h1>
                <p class="mt-3 text-sm leading-5 text-black/60">
                    Добавьте товары в корзину, чтобы оформить заказ.
                </p>
                <NuxtLink
                    to="/catalog"
                    class="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-blue px-5 text-sm font-medium text-white transition-opacity hover:opacity-80"
                >
                    Перейти в каталог
                </NuxtLink>
            </section>

            <form v-else class="mx-auto max-w-6xl" @submit.prevent="submitCheckout">
                <header class="mb-7 lg:mb-10">
                    <p class="text-xs uppercase tracking-[0.14em] text-black/45">
                        Самовывоз из магазина
                    </p>
                    <h1 class="mt-2 font-serif text-2xl font-medium uppercase lg:text-4xl">
                        Оформление заказа
                    </h1>
                </header>

                <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start lg:gap-10">
                    <div class="space-y-5">
                        <section class="rounded-2xl bg-white p-4 lg:p-6">
                            <div class="flex items-start justify-between gap-4">
                                <div>
                                    <h2 class="text-lg font-medium">Получатель</h2>
                                    <p class="mt-1 text-sm leading-5 text-black/55">
                                        Пришлем подтверждение и сообщим, когда заказ будет готов.
                                    </p>
                                </div>
                                <span class="shrink-0 text-xs text-black/45">
                                    Шаг 1
                                </span>
                            </div>

                            <div class="mt-5 grid gap-4 sm:grid-cols-2">
                                <label class="block">
                                    <span class="mb-2 block text-sm font-medium">Имя</span>
                                    <input
                                        id="checkout-firstName"
                                        :value="checkoutStore.recipient.firstName"
                                        type="text"
                                        autocomplete="given-name"
                                        :aria-invalid="Boolean(recipientErrors.firstName)"
                                        :aria-describedby="
                                            recipientErrors.firstName
                                                ? 'checkout-firstName-error'
                                                : undefined
                                        "
                                        class="h-12 w-full rounded-lg border border-black/20 bg-white px-3 text-base outline-none transition-colors placeholder:text-black/35 focus:border-blue"
                                        @input="updateRecipient('firstName', $event)"
                                    />
                                    <span
                                        v-if="recipientErrors.firstName"
                                        id="checkout-firstName-error"
                                        class="mt-1 block text-xs text-red"
                                    >
                                        {{ recipientErrors.firstName }}
                                    </span>
                                </label>

                                <label class="block">
                                    <span class="mb-2 block text-sm font-medium">Фамилия</span>
                                    <input
                                        id="checkout-lastName"
                                        :value="checkoutStore.recipient.lastName"
                                        type="text"
                                        autocomplete="family-name"
                                        :aria-invalid="Boolean(recipientErrors.lastName)"
                                        :aria-describedby="
                                            recipientErrors.lastName
                                                ? 'checkout-lastName-error'
                                                : undefined
                                        "
                                        class="h-12 w-full rounded-lg border border-black/20 bg-white px-3 text-base outline-none transition-colors placeholder:text-black/35 focus:border-blue"
                                        @input="updateRecipient('lastName', $event)"
                                    />
                                    <span
                                        v-if="recipientErrors.lastName"
                                        id="checkout-lastName-error"
                                        class="mt-1 block text-xs text-red"
                                    >
                                        {{ recipientErrors.lastName }}
                                    </span>
                                </label>

                                <label class="block">
                                    <span class="mb-2 block text-sm font-medium">Телефон</span>
                                    <input
                                        id="checkout-phone"
                                        :value="formatRussianPhone(checkoutStore.recipient.phone)"
                                        type="tel"
                                        inputmode="tel"
                                        autocomplete="tel"
                                        maxlength="18"
                                        placeholder="+7 (___) ___-__-__"
                                        :aria-invalid="Boolean(recipientErrors.phone)"
                                        :aria-describedby="
                                            recipientErrors.phone
                                                ? 'checkout-phone-error'
                                                : undefined
                                        "
                                        class="h-12 w-full rounded-lg border border-black/20 bg-white px-3 text-base outline-none transition-colors placeholder:text-black/35 focus:border-blue"
                                        @input="updateRecipient('phone', $event)"
                                    />
                                    <span
                                        v-if="recipientErrors.phone"
                                        id="checkout-phone-error"
                                        class="mt-1 block text-xs text-red"
                                    >
                                        {{ recipientErrors.phone }}
                                    </span>
                                </label>

                                <label class="block">
                                    <span class="mb-2 block text-sm font-medium">Email</span>
                                    <input
                                        id="checkout-email"
                                        :value="checkoutStore.recipient.email"
                                        type="email"
                                        inputmode="email"
                                        autocomplete="email"
                                        :aria-invalid="Boolean(recipientErrors.email)"
                                        :aria-describedby="
                                            recipientErrors.email
                                                ? 'checkout-email-error'
                                                : undefined
                                        "
                                        class="h-12 w-full rounded-lg border border-black/20 bg-white px-3 text-base outline-none transition-colors placeholder:text-black/35 focus:border-blue"
                                        @input="updateRecipient('email', $event)"
                                    />
                                    <span
                                        v-if="recipientErrors.email"
                                        id="checkout-email-error"
                                        class="mt-1 block text-xs text-red"
                                    >
                                        {{ recipientErrors.email }}
                                    </span>
                                </label>
                            </div>
                        </section>

                        <section class="rounded-2xl bg-white p-4 lg:p-6">
                            <div class="flex items-start justify-between gap-4">
                                <div>
                                    <h2 class="text-lg font-medium">Магазин для самовывоза</h2>
                                    <p class="mt-1 text-sm leading-5 text-black/55">
                                        Выберите удобную точку на карте.
                                    </p>
                                </div>
                                <span class="shrink-0 text-xs text-black/45">
                                    Шаг 2
                                </span>
                            </div>

                            <div
                                v-if="checkoutStore.pickupStore"
                                class="mt-5 rounded-xl border border-black/15 bg-[#fafafa] p-4"
                            >
                                <div class="flex items-start justify-between gap-4">
                                    <div class="min-w-0">
                                        <h3 class="text-base font-medium">
                                            {{ checkoutStore.pickupStore.name }}
                                        </h3>
                                        <p class="mt-1 text-sm leading-5 text-black/60">
                                            {{ checkoutStore.pickupStore.address }}
                                        </p>
                                        <p
                                            v-if="checkoutStore.pickupStore.workingTime"
                                            class="mt-3 text-sm text-black/55"
                                        >
                                            {{ checkoutStore.pickupStore.workingTime }}
                                        </p>
                                        <a
                                            v-if="formatPickupPhone(checkoutStore.pickupStore)"
                                            :href="`tel:+${checkoutStore.pickupStore.phone}`"
                                            class="mt-2 inline-block text-sm underline underline-offset-2"
                                        >
                                            {{ formatPickupPhone(checkoutStore.pickupStore) }}
                                        </a>
                                    </div>
                                    <button
                                        type="button"
                                        class="shrink-0 cursor-pointer text-sm font-medium text-blue underline underline-offset-4"
                                        @click="openStorePicker"
                                    >
                                        Изменить
                                    </button>
                                </div>
                            </div>
                            <button
                                v-else
                                type="button"
                                class="mt-5 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border border-blue px-4 text-sm font-medium text-blue transition-colors hover:bg-blue hover:text-white"
                                @click="openStorePicker"
                            >
                                Выбрать магазин на карте
                            </button>
                            <p
                                v-if="pickupStoreError"
                                role="alert"
                                class="mt-3 text-sm text-red"
                            >
                                {{ pickupStoreError }}
                            </p>
                        </section>

                        <p
                            v-if="cartStore.errorMessage"
                            role="alert"
                            class="rounded-xl bg-red/10 px-4 py-3 text-sm leading-5 text-red"
                        >
                            {{ cartStore.errorMessage }}
                        </p>
                    </div>

                    <aside class="rounded-2xl bg-white p-4 lg:sticky lg:top-36 lg:p-6">
                        <div class="flex items-center justify-between gap-3">
                            <h2 class="text-lg font-medium">Ваш заказ</h2>
                            <span class="text-sm text-black/55">
                                {{ itemCountLabel }}
                            </span>
                        </div>

                        <ul class="mt-4 divide-y divide-black/10">
                            <li
                                v-for="item in cartStore.items"
                                :key="item.id"
                                class="flex items-start gap-3 py-3 first:pt-0"
                            >
                                <NuxtLink
                                    v-if="item.product_handle"
                                    :to="`/products/${item.product_handle}`"
                                    class="h-20 w-[4.25rem] shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5]"
                                    :aria-label="`Открыть товар ${getItemTitle(item)}`"
                                >
                                    <img
                                        v-if="item.thumbnail"
                                        :src="item.thumbnail"
                                        :alt="getItemTitle(item)"
                                        width="68"
                                        height="80"
                                        class="size-full object-cover"
                                        loading="lazy"
                                    />
                                </NuxtLink>
                                <div
                                    v-else
                                    class="h-20 w-[4.25rem] shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5]"
                                >
                                    <img
                                        v-if="item.thumbnail"
                                        :src="item.thumbnail"
                                        :alt="getItemTitle(item)"
                                        width="68"
                                        height="80"
                                        class="size-full object-cover"
                                        loading="lazy"
                                    />
                                </div>

                                <div class="min-w-0 flex-1">
                                    <NuxtLink
                                        v-if="item.product_handle"
                                        :to="`/products/${item.product_handle}`"
                                        class="block  text-sm font-medium uppercase hover:opacity-60"
                                    >
                                        {{ getItemTitle(item) }}
                                    </NuxtLink>
                                    <p
                                        v-else
                                        class=" text-sm font-medium uppercase"
                                    >
                                        {{ getItemTitle(item) }}
                                    </p>
                                    <p
                                        v-if="item.variant_sku"
                                        class="mt-1  text-xs text-black/55"
                                    >
                                        {{ item.variant_sku }}
                                    </p>
                                    <p class="mt-1 text-xs text-black/55">
                                        {{ item.quantity }} шт.
                                    </p>
                                </div>
                                <span class="shrink-0 text-sm font-medium">
                                    {{
                                        formatCartPrice(
                                            item.total ??
                                                item.unit_price * item.quantity,
                                            currencyCode,
                                        )
                                    }}
                                </span>
                            </li>
                        </ul>

                        <div class="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-lg font-medium">
                            <span>Итого</span>
                            <span>{{ formatCartPrice(total, currencyCode) }}</span>
                        </div>
                        <p class="mt-3 text-xs leading-4 text-black/50">
                            Оплата на этом этапе не требуется.
                        </p>
                        <button
                            type="submit"
                            class="mt-5 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-blue px-5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:bg-blue disabled:opacity-35"
                            :disabled="isSubmitting"
                            :aria-busy="isSubmitting"
                        >
                            {{
                                cartStore.isCheckingOut
                                    ? "Оформляем заказ..."
                                    : "Оформить заказ"
                            }}
                        </button>
                    </aside>
                </div>
            </form>
        </div>

        <PickupStorePicker
            v-model:open="isStorePickerOpen"
            :selected-store="checkoutStore.pickupStore"
            @select="selectPickupStore"
        />
    </main>
</template>
