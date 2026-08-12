<script setup lang="ts">
import type { StoreOrder } from "@medusajs/types";
import { useAuthStore } from "~/features/auth/lib/auth.store";
import { formatCartPrice } from "~/features/cart";

const authStore = useAuthStore();
const route = useRoute();
const client = useMedusaClient();
const isSessionReady = ref(false);
const isGuest = ref(false);
const isOrdersListRoute = computed(() => route.name === "account");

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
const customerInitials = computed(() => {
    const nameParts = customerName.value
        .split(" ")
        .filter(Boolean)
        .slice(0, 2);

    return nameParts.map((name) => name[0]).join("").toUpperCase() || "ЛК";
});
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
    not_fulfilled: "Ожидает подтверждения",
    partially_fulfilled: "Частично собран",
    fulfilled: "Готов к выдаче",
    partially_shipped: "Частично отправлен",
    shipped: "Отправлен",
    delivered: "Завершен",
    canceled: "Отменен",
    requires_action: "Требуется подтверждение",
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

function getOrderStatusClass(order: StoreOrder) {
    if (order.fulfillment_status === "delivered") {
        return "bg-[#edf5ee] text-[#3d6e48]";
    }

    if (order.fulfillment_status === "fulfilled") {
        return "bg-[#eaf1f7] text-[#3e6381]";
    }

    if (order.status === "canceled" || order.fulfillment_status === "canceled") {
        return "bg-[#f8eeee] text-[#9a4c4c]";
    }

    return "bg-[#f4f1eb] text-[#766752]";
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
    <main class="min-h-screen bg-[#fcfbf9]">
        <div class="container mx-auto px-4 pb-14 pt-6 lg:pb-24 lg:pt-0">
            <div class="my-9 hidden lg:block">
                <UiBreadcrumbs :items="breadcrumbs" />
            </div>

            <div v-if="!isSessionReady" class="space-y-4">
                <div v-for="index in 3" :key="index" class="h-36 animate-pulse bg-black/5" />
            </div>

            <div v-else-if="isGuest" class="mx-auto max-w-md py-20 text-center lg:py-28">
                <h1 class="font-serif text-2xl font-medium lg:text-3xl">Личный кабинет</h1>
                <p class="mx-auto mt-3 max-w-sm text-sm leading-5 text-black/60">
                    Здесь появится история ваших заказов.
                </p>
                <UiButton class="mt-6" @click="authStore.open">
                    Войти
                </UiButton>
            </div>

            <div v-else class="grid gap-10 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-16">
                <aside class="lg:sticky lg:top-32 lg:self-start">
                    <div class="flex items-center gap-4 lg:block">
                        <div class="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#e9e5df] font-serif text-xl text-[#5d5449] lg:size-24 lg:text-3xl">
                            {{ customerInitials }}
                        </div>
                        <div class="min-w-0 lg:mt-4">
                            <h1 class="font-serif text-xl font-medium lg:text-2xl">
                                {{ customerName }}
                            </h1>
                            <p
                                v-if="authStore.customer?.email"
                                class="mt-1 truncate text-sm text-black/50"
                            >
                                {{ authStore.customer.email }}
                            </p>
                        </div>
                    </div>

                    <nav
                        aria-label="Навигация по личному кабинету"
                        class="hide-scrollbar -mx-4 mt-7 flex gap-1 overflow-x-auto border-y border-black/10 px-4 py-2 lg:mx-0 lg:mt-8 lg:flex-col lg:overflow-visible lg:border-0 lg:px-0 lg:py-0"
                    >
                        <NuxtLink
                            to="/account"
                            class="flex shrink-0 items-center gap-3 border-b-2 border-black px-3 py-2 text-sm font-medium lg:w-full"
                        >
                            <SvgoHistory aria-hidden="true" filled class="!mb-0 text-xl" />
                            Заказы
                        </NuxtLink>
                    </nav>

                    <button
                        type="button"
                        class="mt-5 hidden cursor-pointer px-3 py-2 text-sm text-black/50 transition-colors hover:text-black lg:block"
                        @click="logout"
                    >
                        Выйти из аккаунта
                    </button>
                </aside>

                <section
                    v-if="isOrdersListRoute"
                    class="min-w-0 rounded-2xl bg-white px-6 py-4"
                >
                    <div class="mb-6 flex items-end justify-between gap-4 lg:mb-8">
                        <div>
                            <p class="text-sm text-black/45">Личный кабинет</p>
                            <h2 class="mt-1 font-serif text-2xl font-medium lg:text-3xl">Мои заказы</h2>
                        </div>
                        <button
                            type="button"
                            class="cursor-pointer text-sm text-black/50 underline underline-offset-4 lg:hidden"
                            @click="logout"
                        >
                            Выйти
                        </button>
                    </div>

                    <div v-if="status === 'pending' || status === 'idle'" class="space-y-3">
                        <div v-for="index in 3" :key="index" class="h-44 animate-pulse bg-black/5" />
                    </div>

                    <div v-else-if="error" class="border-y border-black/10 py-16 text-center">
                        <p class="font-medium lg:text-lg">Не удалось загрузить заказы.</p>
                        <UiButton class="mt-5" variant="outline" @click="refresh">
                            Повторить
                        </UiButton>
                    </div>

                    <div v-else-if="orders.length" class="divide-y divide-black/10 ">
                        <article
                            v-for="order in orders"
                            :key="order.id"
                            class="py-5 border-t last:border-b border-black/10 lg:py-6"
                        >
                            <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                                <div>
                                    <h3 class="font-medium">Заказ {{ getOrderNumber(order) }}</h3>
                                    <p class="mt-1 text-sm text-black/50">
                                        {{ formatOrderDate(order.created_at) }}
                                    </p>
                                </div>
                                <span
                                    class="rounded-full px-3 py-1 text-xs font-medium"
                                    :class="getOrderStatusClass(order)"
                                >
                                    {{ getOrderStatus(order) }}
                                </span>
                            </div>

                            <div v-if="order.items?.length" class="mt-5 flex items-center gap-2 overflow-hidden">
                                <div
                                    v-for="item in order.items.slice(0, 4)"
                                    :key="item.id"
                                    class="size-14 shrink-0 overflow-hidden bg-[#f1efec] lg:size-16"
                                >
                                    <NuxtImg
                                        v-if="item.thumbnail"
                                        :src="item.thumbnail"
                                        :alt="item.product_title || item.title"
                                        width="64"
                                        height="64"
                                        class="h-full w-full object-cover"
                                    />
                                </div>
                                <span v-if="order.items.length > 4" class="shrink-0 pl-1 text-sm text-black/50">
                                    +{{ order.items.length - 4 }}
                                </span>
                            </div>

                            <div class="mt-5 flex items-end justify-between gap-4">
                                <span class="text-sm text-black/50">
                                    {{ order.items?.length ?? 0 }} шт.
                                </span>
                                <div class="flex items-center gap-5">
                                    <NuxtLink
                                        :to="`/account/orders/${order.id}`"
                                        class="text-sm text-black/60 underline underline-offset-4 transition-colors hover:text-black"
                                    >
                                        Подробнее
                                    </NuxtLink>
                                    <span class="text-lg font-medium">
                                        {{ formatCartPrice(order.total, order.currency_code) }}
                                    </span>
                                </div>
                            </div>
                        </article>
                    </div>

                    <div v-else class="border-y border-black/10 py-16 text-center">
                        <p class="font-medium lg:text-lg">У вас пока нет заказов.</p>
                        <NuxtLink to="/catalog/for-women" class="mt-4 inline-flex text-sm text-black/65 underline underline-offset-4 hover:text-black">
                            Перейти в каталог
                        </NuxtLink>
                    </div>
                </section>

                <NuxtPage v-else />
            </div>
        </div>
    </main>
</template>
