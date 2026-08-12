<script setup lang="ts">
import type { StoreOrder } from "@medusajs/types";
import { useAuthStore } from "~/features/auth/lib/auth.store";
import { formatCartPrice } from "~/features/cart";
import { formatPickupPhone } from "~/features/checkout/lib/pickup-store";
import type { PickupStore } from "#shared/types/checkout";

const route = useRoute();
const authStore = useAuthStore();
const client = useMedusaClient();
const isSessionReady = ref(false);
const isGuest = ref(false);
const orderId = computed(() => String(route.params.id ?? ""));

const { data: order, status, error, refresh } = await useAsyncData(
    () => `account-order-${orderId.value}`,
    async () => {
        const response = await client.store.order.retrieve(orderId.value, {
            fields: "*items,*shipping_address,*billing_address,*shipping_methods",
        });

        return response.order;
    },
    {
        server: false,
        immediate: false,
        watch: [orderId],
    },
);

const orderStatusLabels: Record<string, string> = {
    pending: "В обработке",
    completed: "Оформлен",
    canceled: "Отменен",
    archived: "Завершен",
    requires_action: "Требуется действие",
};
const fulfillmentStatusLabels: Record<string, string> = {
    not_fulfilled: "Ожидает подтверждения",
    partially_fulfilled: "Частично собран",
    fulfilled: "Готов к выдаче",
    partially_shipped: "Частично отправлен",
    shipped: "Отправлен",
    delivered: "Завершен",
    canceled: "Отменен",
    requires_action: "Требуется подтверждение",
};

const pickupStore = computed(() => {
    const currentOrder = order.value;
    if (!currentOrder) return null;

    const metadataSources = [
        currentOrder.metadata,
        currentOrder.shipping_address?.metadata,
        ...(currentOrder.shipping_methods ?? []).map((method) => method.data),
    ];

    return (
        metadataSources
            .map(getPickupStore)
            .find((store): store is PickupStore => Boolean(store)) ?? null
    );
});
const recipient = computed(
    () => order.value?.shipping_address ?? order.value?.billing_address,
);

function getPickupStore(metadata: unknown): PickupStore | null {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
        return null;
    }

    const pickup = (metadata as Record<string, unknown>).pickup_store;
    if (!pickup || typeof pickup !== "object" || Array.isArray(pickup)) {
        return null;
    }

    const value = pickup as Record<string, unknown>;
    const coordinates = value.coordinates as Record<string, unknown> | undefined;
    const longitude = Number(coordinates?.longitude);
    const latitude = Number(coordinates?.latitude);
    if (
        typeof value.id !== "string" ||
        typeof value.name !== "string" ||
        typeof value.address !== "string" ||
        typeof value.city !== "string" ||
        typeof value.working_time !== "string" ||
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude)
    ) {
        return null;
    }

    return {
        id: value.id,
        name: value.name,
        address: value.address,
        city: value.city,
        workingTime: value.working_time,
        phone: typeof value.phone === "string" ? value.phone : null,
        phoneExtension:
            typeof value.phone_extension === "string"
                ? value.phone_extension
                : null,
        coordinates: [longitude, latitude],
    };
}

function getOrderNumber(value: StoreOrder) {
    return value.display_id ? `#${value.display_id}` : `#${value.id.slice(-8)}`;
}

function getOrderStatus(value: StoreOrder) {
    return (
        fulfillmentStatusLabels[value.fulfillment_status] ||
        orderStatusLabels[value.status] ||
        "В обработке"
    );
}

function getOrderStatusClass(value: StoreOrder) {
    if (value.fulfillment_status === "delivered") {
        return "bg-[#edf5ee] text-[#3d6e48]";
    }
    if (value.fulfillment_status === "fulfilled") {
        return "bg-[#eaf1f7] text-[#3e6381]";
    }
    if (value.status === "canceled" || value.fulfillment_status === "canceled") {
        return "bg-[#f8eeee] text-[#9a4c4c]";
    }

    return "bg-[#f4f1eb] text-[#766752]";
}

function formatOrderDate(value: string | Date) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

onMounted(async () => {
    const customer = await authStore.restoreSession();
    isSessionReady.value = true;

    if (!customer) {
        isGuest.value = true;
        return;
    }

    await refresh();
});

useSeoMeta({
    title: "Заказ",
    robots: "noindex, follow",
});
</script>

<template>
    <section class="min-w-0 rounded-2xl bg-white px-6 py-4">
        <NuxtLink
            to="/account"
            class="inline-flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black"
        >
            <SvgoChevron aria-hidden="true" filled class="!mb-0 rotate-180 text-xl" />
            Все заказы
        </NuxtLink>

            <div v-if="!isSessionReady || status === 'pending'" class="mt-7 space-y-4">
                <div class="h-12 w-2/5 animate-pulse bg-black/5" />
                <div class="h-80 animate-pulse bg-black/5" />
            </div>

            <div v-else-if="isGuest" class="py-20 text-center">
                <h1 class="font-serif text-2xl font-medium">Войдите в личный кабинет</h1>
                <UiButton class="mt-6" @click="authStore.open">Войти</UiButton>
            </div>

            <div v-else-if="error || !order" class="border-y border-black/10 py-16 text-center">
                <h1 class="font-serif text-2xl font-medium">Заказ не найден</h1>
                <p class="mt-2 text-sm text-black/55">Возможно, он недоступен для этого аккаунта.</p>
                <NuxtLink to="/account" class="mt-5 inline-flex text-sm underline underline-offset-4">
                    Вернуться к заказам
                </NuxtLink>
            </div>

            <section v-else class="mt-7 max-w-4xl lg:mt-9">
                <header class="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-6">
                    <div>
                        <p class="text-sm text-black/45">Заказ {{ getOrderNumber(order) }}</p>
                        <h1 class="mt-1 font-serif text-3xl font-medium lg:text-4xl">Детали заказа</h1>
                        <p class="mt-3 text-sm text-black/55">{{ formatOrderDate(order.created_at) }}</p>
                    </div>
                    <span class="rounded-full px-3 py-1 text-xs font-medium" :class="getOrderStatusClass(order)">
                        {{ getOrderStatus(order) }}
                    </span>
                </header>

                <div class="grid gap-10 py-7 lg:grid-cols-[minmax(0,1fr)_16rem] lg:py-9">
                    <section>
                        <h2 class="font-serif text-xl font-medium">Состав заказа</h2>
                        <ul class="mt-5 divide-y divide-black/10 border-y border-black/10">
                            <li v-for="item in order.items ?? []" :key="item.id" class="flex gap-4 py-4">
                                <NuxtLink
                                    v-if="item.product_handle"
                                    :to="`/products/${item.product_handle}`"
                                    class="size-18 shrink-0 overflow-hidden bg-[#f1efec]"
                                >
                                    <NuxtImg
                                        v-if="item.thumbnail"
                                        :src="item.thumbnail"
                                        :alt="item.product_title || item.title"
                                        width="72"
                                        height="72"
                                        class="h-full w-full object-cover"
                                    />
                                </NuxtLink>
                                <div v-else class="size-18 shrink-0 overflow-hidden bg-[#f1efec]">
                                    <NuxtImg
                                        v-if="item.thumbnail"
                                        :src="item.thumbnail"
                                        :alt="item.product_title || item.title"
                                        width="72"
                                        height="72"
                                        class="h-full w-full object-cover"
                                    />
                                </div>
                                <div class="min-w-0 flex-1">
                                    <component
                                        :is="item.product_handle ? NuxtLink : 'p'"
                                        :to="item.product_handle ? `/products/${item.product_handle}` : undefined"
                                        class="text-sm font-medium transition-opacity hover:opacity-60"
                                    >
                                        {{ item.product_title || item.title }}
                                    </component>
                                    <p v-if="item.variant_title" class="mt-1 text-sm text-black/50">{{ item.variant_title }}</p>
                                    <p class="mt-1 text-sm text-black/50">{{ item.quantity }} шт.</p>
                                </div>
                                <span class="shrink-0 text-sm font-medium">
                                    {{ formatCartPrice(item.total, order.currency_code) }}
                                </span>
                            </li>
                        </ul>
                    </section>

                    <aside class="space-y-7">
                        <section v-if="pickupStore">
                            <h2 class="font-serif text-xl font-medium">Самовывоз</h2>
                            <p class="mt-3 text-sm font-medium">{{ pickupStore.name }}</p>
                            <p class="mt-1 text-sm leading-5 text-black/55">{{ pickupStore.address }}</p>
                            <p v-if="pickupStore.workingTime" class="mt-3 text-sm text-black/55">{{ pickupStore.workingTime }}</p>
                            <a
                                v-if="formatPickupPhone(pickupStore)"
                                :href="`tel:+${pickupStore.phone}`"
                                class="mt-2 inline-flex text-sm underline underline-offset-4"
                            >
                                {{ formatPickupPhone(pickupStore) }}
                            </a>
                        </section>

                        <section v-if="recipient">
                            <h2 class="font-serif text-xl font-medium">Получатель</h2>
                            <p class="mt-3 text-sm font-medium">
                                {{ [recipient.first_name, recipient.last_name].filter(Boolean).join(' ') }}
                            </p>
                            <p v-if="recipient.phone" class="mt-1 text-sm text-black/55">{{ recipient.phone }}</p>
                            <p v-if="order.email" class="mt-1 text-sm text-black/55">{{ order.email }}</p>
                        </section>

                        <section class="border-t border-black/10 pt-5">
                            <div class="flex items-center justify-between gap-4 text-sm text-black/55">
                                <span>Товары</span>
                                <span>{{ formatCartPrice(order.item_total, order.currency_code) }}</span>
                            </div>
                            <div v-if="order.shipping_total" class="mt-3 flex items-center justify-between gap-4 text-sm text-black/55">
                                <span>Доставка</span>
                                <span>{{ formatCartPrice(order.shipping_total, order.currency_code) }}</span>
                            </div>
                            <div class="mt-4 flex items-center justify-between gap-4 text-lg font-medium">
                                <span>Итого</span>
                                <span>{{ formatCartPrice(order.total, order.currency_code) }}</span>
                            </div>
                        </section>
                    </aside>
                </div>
            </section>
    </section>
</template>
