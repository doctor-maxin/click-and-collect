<script setup lang="ts">
import type { YMap } from "@yandex/ymaps3-types";
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    VisuallyHidden,
} from "reka-ui";
import {
    YandexMap,
    YandexMapClusterer,
    YandexMapDefaultFeaturesLayer,
    YandexMapDefaultSchemeLayer,
    YandexMapMarker,
} from "vue-yandex-maps";
import { computed, markRaw, nextTick, ref, shallowRef, watch } from "vue";
import type { PickupStore } from "#shared/types/checkout";
import type { MapPoint } from "~/widgets/render-blocks/ui/blocks/map/model/map-point.model";
import { formatPickupPhone, normalizePickupStores } from "../lib/pickup-store";

const props = defineProps<{
    open: boolean;
    selectedStore?: PickupStore | null;
}>();

const emit = defineEmits<{
    "update:open": [value: boolean];
    select: [store: PickupStore];
}>();

const map = shallowRef<YMap | null>(null);
const searchQuery = ref("");
const activeStoreId = ref<string | null>(null);
const clusterMarkerProps = markRaw({
    position: "top-center left-center" as const,
    zIndex: 1,
});
const {
    data: rawPoints,
    error: pointsError,
    execute: loadPoints,
    status: pointsStatus,
} = await useAsyncData<MapPoint[]>(
    "checkout-pickup-points",
    () => $fetch("/api/map-points"),
    {
        default: () => [],
        immediate: false,
        server: false,
    },
);

const allStores = computed(() => normalizePickupStores(rawPoints.value));
const stores = computed(() => {
    const query = searchQuery.value.trim().toLocaleLowerCase("ru-RU");

    if (!query) return allStores.value;

    return allStores.value.filter((store) =>
        [store.name, store.address, store.city].some((value) =>
            value.toLocaleLowerCase("ru-RU").includes(query),
        ),
    );
});
const activeStore = computed(
    () =>
        stores.value.find((store) => store.id === activeStoreId.value) ??
        allStores.value.find((store) => store.id === activeStoreId.value) ??
        null,
);

function setOpen(value: boolean) {
    emit("update:open", value);
}

function focusStore(store: PickupStore) {
    if (!map.value) return;

    map.value.setLocation({
        center: store.coordinates,
        zoom: Math.max(map.value.zoom, 14),
        duration: 300,
    });
}

function activateStore(store: PickupStore) {
    activeStoreId.value = store.id;
    focusStore(store);
}

function chooseStore(store: PickupStore) {
    emit("select", store);
    setOpen(false);
}

async function ensurePointsLoaded() {
    if (pointsStatus.value === "pending" || rawPoints.value.length) return;

    await loadPoints();
}

watch(
    () => props.open,
    async (isOpen) => {
        if (!isOpen) return;

        activeStoreId.value = props.selectedStore?.id ?? null;
        await ensurePointsLoaded();
        await nextTick();

        const selectedStore =
            allStores.value.find((store) => store.id === activeStoreId.value) ??
            allStores.value[0];

        if (selectedStore) focusStore(selectedStore);
    },
);

watch(map, () => {
    if (props.open && activeStore.value) {
        focusStore(activeStore.value);
    }
});

watch(stores, (nextStores) => {
    if (
        activeStoreId.value &&
        !nextStores.some((store) => store.id === activeStoreId.value)
    ) {
        activeStoreId.value = null;
    }
});
</script>

<template>
    <DialogRoot :open="open" @update:open="setOpen">
        <DialogPortal>
            <DialogOverlay class="fixed inset-0 z-[100] bg-black/45" />
            <DialogContent
                class="fixed inset-0 z-[105] flex h-[100dvh] w-screen flex-col overflow-hidden bg-white outline-none lg:grid lg:grid-cols-[minmax(0,1fr)_23rem]"
            >
                <VisuallyHidden as-child>
                    <DialogTitle>Выберите магазин для самовывоза</DialogTitle>
                </VisuallyHidden>
                <VisuallyHidden as-child>
                    <DialogDescription>
                        Выберите магазин на карте или в списке
                    </DialogDescription>
                </VisuallyHidden>

                <section class="relative order-2 flex min-h-0 flex-1 flex-col">
                    <header
                        class="flex shrink-0 items-center justify-between border-b border-black/10 px-4 py-4 lg:px-6"
                    >
                        <div>
                            <p class="text-xs uppercase tracking-[0.12em] text-black/45">
                                Самовывоз
                            </p>
                            <h2 class="mt-1 text-lg font-medium">
                                Выберите магазин
                            </h2>
                        </div>
                        <DialogClose
                            type="button"
                            class="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-black/5"
                            aria-label="Закрыть выбор магазина"
                        >
                            <SvgoClose
                                aria-hidden="true"
                                filled
                                class="!mb-0 text-xl"
                            />
                        </DialogClose>
                    </header>

                    <div class="border-b border-black/10 px-4 py-3 lg:px-6">
                        <label class="sr-only" for="pickup-store-search">
                            Найти магазин
                        </label>
                        <input
                            id="pickup-store-search"
                            v-model="searchQuery"
                            type="search"
                            autocomplete="off"
                            placeholder="Город или адрес"
                            class="h-11 w-full rounded-lg border border-black/20 bg-white px-3 text-sm outline-none transition-colors placeholder:text-black/40 focus:border-blue"
                        />
                    </div>

                    <div
                        v-if="pointsStatus === 'pending'"
                        class="flex min-h-0 flex-1 items-center justify-center px-6 text-sm text-black/55"
                    >
                        Загружаем магазины...
                    </div>
                    <div
                        v-else-if="pointsError"
                        class="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center"
                    >
                        <p class="text-sm leading-5">
                            Не удалось загрузить список магазинов.
                        </p>
                        <button
                            type="button"
                            class="mt-4 text-sm font-medium underline underline-offset-4"
                            @click="loadPoints"
                        >
                            Повторить
                        </button>
                    </div>
                    <div
                        v-else-if="!stores.length"
                        class="flex min-h-0 flex-1 items-center justify-center px-6 text-center text-sm text-black/55"
                    >
                        Магазины по этому запросу не найдены.
                    </div>
                    <ul v-else class="min-h-0 flex-1 overflow-y-auto px-4 lg:px-6">
                        <li
                            v-for="store in stores"
                            :key="store.id"
                            class="border-b border-black/10 py-4 first:pt-4"
                        >
                            <button
                                type="button"
                                class="w-full cursor-pointer rounded-lg p-1 text-left transition-colors hover:bg-blue/5"
                                :class="{
                                    'bg-blue/10': activeStore?.id === store.id,
                                }"
                                :aria-pressed="activeStore?.id === store.id"
                                @click="activateStore(store)"
                            >
                                <span class="block text-sm font-medium">
                                    {{ store.name }}
                                </span>
                                <span class="mt-1 block text-sm leading-5 text-black/60">
                                    {{ store.address }}
                                </span>
                                <span
                                    v-if="store.workingTime"
                                    class="mt-2 block text-xs leading-4 text-black/55"
                                >
                                    {{ store.workingTime }}
                                </span>
                            </button>
                            <button
                                type="button"
                                class="mt-3 h-10 w-full cursor-pointer rounded-lg border border-blue px-4 text-sm font-medium text-blue transition-colors hover:bg-blue hover:text-white"
                                @click="chooseStore(store)"
                            >
                                Выбрать этот магазин
                            </button>
                        </li>
                    </ul>
                </section>

                <section
                    class="relative order-1 h-[55dvh] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1"
                >
                    <ClientOnly>
                        <YandexMap
                            v-model="map"
                            :settings="{
                                location: {
                                    center: [37.617644, 55.755819],
                                    zoom: 9,
                                },
                            }"
                            class="!h-full !min-h-70 w-full lg:!h-full lg:min-h-0"
                        >
                            <YandexMapDefaultSchemeLayer />
                            <YandexMapDefaultFeaturesLayer />
                            <YandexMapClusterer
                                :grid-size="72"
                                :cluster-marker-props="clusterMarkerProps"
                                :zoom-on-cluster-click="{ duration: 300 }"
                            >
                                <YandexMapMarker
                                    v-for="store in stores"
                                    :key="store.id"
                                    :aria-label="`Магазин: ${store.name}`"
                                    position="left-center top"
                                    :settings="{
                                        id: store.id,
                                        zIndex:
                                            activeStore?.id === store.id
                                                ? 2
                                                : 0,
                                        coordinates: store.coordinates,
                                        hideOutsideViewport: true,
                                    }"
                                    @click="activateStore(store)"
                                >
                                    <SvgoSinMarker
                                        aria-hidden="true"
                                        filled
                                        class="mb-0! cursor-pointer text-[3.5rem]"
                                        :class="{
                                            'text-black':
                                                activeStore?.id === store.id,
                                        }"
                                    />
                                </YandexMapMarker>

                                <template #cluster="{ length }">
                                    <div
                                        class="flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-black px-3 text-sm font-semibold text-white shadow-lg"
                                        :aria-label="`Магазинов в группе: ${length}`"
                                    >
                                        {{ length }}
                                    </div>
                                </template>
                            </YandexMapClusterer>
                        </YandexMap>
                        <template #fallback>
                            <div class="h-full min-h-70 bg-[#f3f3f3] lg:h-full lg:min-h-0" />
                        </template>
                    </ClientOnly>

                    <div
                        v-if="activeStore"
                        class="absolute inset-x-3 bottom-3 rounded-xl bg-white p-4 shadow-xl lg:inset-x-6 lg:bottom-6 lg:max-w-sm"
                    >
                        <p class="text-sm font-medium">
                            {{ activeStore.name }}
                        </p>
                        <p class="mt-1 text-sm leading-5 text-black/60">
                            {{ activeStore.address }}
                        </p>
                        <p
                            v-if="activeStore.workingTime"
                            class="mt-2 text-xs text-black/55"
                        >
                            {{ activeStore.workingTime }}
                        </p>
                        <a
                            v-if="formatPickupPhone(activeStore)"
                            :href="`tel:+${activeStore.phone}`"
                            class="mt-2 block text-xs text-black/55 underline underline-offset-2"
                        >
                            {{ formatPickupPhone(activeStore) }}
                        </a>
                        <button
                            type="button"
                            class="mt-3 h-10 w-full cursor-pointer rounded-lg bg-blue px-4 text-sm font-medium text-white transition-opacity hover:opacity-80"
                            @click="chooseStore(activeStore)"
                        >
                            Выбрать магазин
                        </button>
                    </div>
                </section>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>
