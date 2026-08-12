<script setup lang="ts">
import type { StoreOrder } from "@medusajs/types";
import { useAuthStore } from "~/features/auth";
import { formatCartPrice } from "~/features/cart";

const authStore = useAuthStore();
const client = useMedusaClient();
const isSessionReady = ref(false);
const isGuest = ref(false);

const { data: ordersResponse, status, error, refresh } = await useAsyncData(
    "account-orders",
    () =>
        client.store.order.list({
            limit: 50,
            order: "-created_at",
            fields: "*items",
        }),
    {
        server: false,
        immediate: false,
    },
);

const orders = computed(() => ordersResponse.value?.orders ?? []);
const customerName = computed(
    () =>
        [authStore.customer?.first_name, authStore.customer?.last_name]
            .filter(Boolean)
            .join(" ") || "Личный кабинет",
);
const breadcrumbs = [
    { path: "/", label: "Главная" },
    { path: "/account", label: "Личный кабинет" },
];

const orderStatusLabels: Record<string, string> = {
    pending: "В обработке",
    completed: "Оформлен",
    canceled: "Отменен",
    archived: "Завершен",
    requires_action: "Требуется действие",
};

const fulfillmentStatusLabels: Record<string, string> = {
    not_fulfilled: "Ожидает отправки",
    partially_fulfilled: "Частично собран",
    fulfilled: "Собран",
    partially_shipped: "Частично отправлен",
    shipped: "Отправлен",
    delivered: "Доставлен",
    canceled: "Отменен",
    requires_action: "Требуется действие",
};

function formatOrderDate(value: string | Date) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function getOrderNumber(order: StoreOrder) {
    return order.display_id ? `#${order.display_id}` : `#${order.id.slice(-8)}`;
}

function getOrderStatus(order: StoreOrder) {
    return (
        fulfillmentStatusLabels[order.fulfillment_status] ||
        orderStatusLabels[order.status] ||
        "В обработке"
    );
}

async function logout() {
    await authStore.logout();
    await navigateTo("/");
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
    title: "Личный кабинет",
    robots: "noindex, follow",
});
</script>

<template>
    <main class="min-h-screen">
        <div class="container mx-auto px-4 pb-12 lg:pb-18">
            <div class="my-9 hidden lg:block">
                <UiBreadcrumbs :items="breadcrumbs" />
            </div>

            <div class="mb-6 mt-6 flex items-start justify-between gap-4 lg:my-9">
                <div>
                    <h1 class="font-serif text-xl font-medium uppercase lg:text-[1.75rem]">
                        {{ customerName }}
                    </h1>
                    <p v-if="authStore.customer?.email" class="mt-1 text-sm text-black/55">
                        {{ authStore.customer.email }}
                    </p>
                </div>
                <button
                    v-if="authStore.customer"
                    type="button"
                    class="shrink-0 cursor-pointer text-sm uppercase underline underline-offset-4"
                    @click="logout"
                >
                    Выйти
                </button>
            </div>

            <div v-if="!isSessionReady" class="space-y-4">
                <div v-for="index in 3" :key="index" class="h-40 animate-pulse rounded-lg bg-black/5" />
            </div>

            <div v-else-if="isGuest" class="py-20 text-center">
                <h2 class="font-serif text-xl font-medium uppercase lg:text-2xl">Войдите в личный кабинет</h2>
                <p class="mx-auto mt-3 max-w-sm text-sm leading-5 text-black/60">
                    Здесь появится история ваших заказов.
                </p>
                <UiButton class="mt-6 uppercase" @click="authStore.open">
                    Войти
                </UiButton>
            </div>

            <template v-else>
                <h2 class="mb-4 font-serif text-lg font-medium uppercase lg:mb-6 lg:text-xl">
                    Мои заказы
                </h2>

                <div v-if="status === 'pending' || status === 'idle'" class="space-y-4">
                    <div v-for="index in 3" :key="index" class="h-40 animate-pulse rounded-lg bg-black/5" />
                </div>

                <div v-else-if="error" class="py-20 text-center">
                    <p class="font-medium lg:text-xl">Не удалось загрузить заказы.</p>
                    <UiButton class="mt-5 uppercase" variant="outline" @click="refresh">
                        Повторить
                    </UiButton>
                </div>

                <div v-else-if="orders.length" class="space-y-4">
                    <article
                        v-for="order in orders"
                        :key="order.id"
                        class="border border-black/10 p-4 lg:p-6"
                    >
                        <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                            <div>
                                <h3 class="font-medium">Заказ {{ getOrderNumber(order) }}</h3>
                                <p class="mt-1 text-sm text-black/55">
                                    {{ formatOrderDate(order.created_at) }}
                                </p>
                            </div>
                            <span class="rounded-full bg-black/5 px-3 py-1 text-xs uppercase">
                                {{ getOrderStatus(order) }}
                            </span>
                        </div>

                        <div v-if="order.items?.length" class="mt-5 flex items-center gap-2 overflow-hidden">
                            <div
                                v-for="item in order.items.slice(0, 4)"
                                :key="item.id"
                                class="size-14 shrink-0 overflow-hidden bg-black/5"
                            >
                                <NuxtImg
                                    v-if="item.thumbnail"
                                    :src="item.thumbnail"
                                    :alt="item.product_title || item.title"
                                    width="56"
                                    height="56"
                                    class="h-full w-full object-cover"
                                />
                            </div>
                            <span v-if="order.items.length > 4" class="shrink-0 text-sm text-black/55">
                                +{{ order.items.length - 4 }}
                            </span>
                        </div>

                        <div class="mt-5 flex items-end justify-between gap-4 border-t border-black/10 pt-4">
                            <span class="text-sm text-black/55">
                                {{ order.items?.length ?? 0 }} шт.
                            </span>
                            <span class="text-lg font-medium">
                                {{ formatCartPrice(order.total, order.currency_code) }}
                            </span>
                        </div>
                    </article>
                </div>

                <div v-else class="py-20 text-center">
                    <p class="font-medium lg:text-xl">У вас пока нет заказов.</p>
                    <NuxtLink to="/catalog/for-women" class="mt-5 inline-flex text-sm uppercase underline underline-offset-4">
                        Перейти в каталог
                    </NuxtLink>
                </div>
            </template>
        </div>
    </main>
</template>
