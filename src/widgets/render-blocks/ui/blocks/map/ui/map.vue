<script setup lang="ts">
import { FeatureRenderMedia } from "~/features/render-media";
import type { YMap, LngLat } from "@yandex/ymaps3-types";
import {
    YandexMap,
    YandexMapDefaultSchemeLayer,
    YandexMapDefaultFeaturesLayer,
    YandexMapClusterer,
    YandexMapMarker,
    getLocationFromBounds,
    getCenterFromCoords,
    getBoundsFromCoords,
} from "vue-yandex-maps";
import type { ISharedMap } from "~/widgets/render-blocks";
import { useAsyncData } from "#app";
import { shallowRef, markRaw, ref } from "vue";
import type { MapPoint } from "../model/map-point.model";
import Ballon from "./ballon.vue";

defineProps<{
    data: ISharedMap;
}>();

const { data: points } = await useAsyncData<MapPoint[]>(
    "map-points",
    () => $fetch("/api/map-points"),
    {
        transform: (data) =>
            data.filter(
                (point) => point.coordinates.lat && point.coordinates.lon,
            ),
    },
);

const map = shallowRef<null | YMap>(null);
const options = markRaw([
    {
        label: "Карта",
        value: "map",
    },
    {
        label: "Список",
        value: "list",
    },
]);

const viewMode = ref("map");
const city = ref();
const cities = computed(() => {
    const list = new Set<string>();
    if (!points.value) {
        return [];
    }
    points.value.forEach((item) => list.add(item.city));

    return Array.from(list).map((city) => ({
        label: city,
        value: city,
    }));
});
const openMarker = ref<number | null>(null);
const clusterMarkerProps = markRaw({
    position: "top-center left-center" as const,
    zIndex: 1,
    onClick: () => {
        openMarker.value = null;
    },
});

const cityPoints = computed(
    () =>
        points.value?.filter((point) =>
            city.value ? point.city === city.value : point,
        ) ?? [],
);

const centerToCity = async () => {
    if (!cityPoints.value.length || !map.value) return;

    if (cityPoints.value.length < 4) {
        const coords = cityPoints.value.map(
            (point) =>
                [+point.coordinates.lon, +point.coordinates.lat] as LngLat,
        );
        const center = getCenterFromCoords(coords);
        map.value.setLocation({
            duration: 300,
            center,
        });
    } else {
        const coords = cityPoints.value.map(
            (point) =>
                [+point.coordinates.lon, +point.coordinates.lat] as LngLat,
        );

        const bounds = getBoundsFromCoords(coords);
        const { center, zoom } = await getLocationFromBounds({
            bounds,
            map: map.value,
            comfortZoomLevel: true,
            roundZoom: true,
        });

        map.value.setLocation({
            center,
            zoom,
            duration: 300,
        });
    }
};

function selectMarker(index: number, marker: MapPoint) {
    if (openMarker.value === index) {
        openMarker.value = null;
        return;
    }

    openMarker.value = index;
    if (!map.value) return;

    map.value.setLocation({
        center: [+marker.coordinates.lon, +marker.coordinates.lat],
        zoom: Math.max(map.value.zoom, 14),
        duration: 300,
    });
}

watch(city, () => {
    openMarker.value = null;
    void centerToCity();
});

watch(viewMode, (mode) => {
    if (mode === "map" && city.value) {
        setTimeout(() => {
            centerToCity();
        }, 300);
    }
});
</script>
<template>
    <section id="stores" class="">
        <div class="relative h-[248px] overflow-hidden">
            <FeatureRenderMedia
                :media="data.defaultMedia"
                :mobile-media="data.defaultMobileMedia"
                loading="lazy"
                class="h-full"
            />
            <div class="absolute inset-0 bg-black/25" aria-hidden="true" />
            <h2
                class="absolute inset-0 z-1 flex items-center justify-center px-4 text-center text-2xl font-bold text-white lg:text-[2.5rem] lg:leading-tight"
            >
                {{ data.header }}
            </h2>
        </div>

        <header
            class="container mx-auto flex flex-col gap-3 px-4 py-6 lg:flex-row lg:items-center lg:justify-end lg:py-9"
        >
            <div class="mr-auto">
                <UiCombobox
                    placeholder="Введите город"
                    label="Город"
                    :options="cities"
                    v-model="city"
                    class="mr-auto ml-0"
                />
            </div>
            <UiToggle :options="options" v-model="viewMode" />
        </header>
        <div
            v-if="viewMode === 'map'"
            class="w-full"
        >
            <yandex-map
                v-model="map"
                :settings="{
                    location: {
                        center: [37.617644, 55.755819],
                        zoom: 9,
                    },
                }"
                class="!h-[32rem] w-full lg:!h-[46rem]"
            >
                <yandex-map-default-scheme-layer />
                <yandex-map-default-features-layer />
                <YandexMapClusterer
                    :grid-size="72"
                    :cluster-marker-props="clusterMarkerProps"
                    :zoom-on-cluster-click="{ duration: 350 }"
                >
                    <YandexMapMarker
                        v-for="(marker, index) of cityPoints"
                        :key="marker['company-id']"
                        position="left-center top"
                        :settings="{
                            id: String(marker['company-id']),
                            zIndex: openMarker === index ? 2 : 0,
                            coordinates: [
                                marker.coordinates.lon,
                                marker.coordinates.lat,
                            ],
                            hideOutsideViewport: true,
                        }"
                        @click="selectMarker(index, marker)"
                    >
                        <SvgoSinMarker
                            filled
                            class="mb-0! cursor-pointer text-[4rem]"
                        />

                        <Ballon
                            v-if="openMarker === index"
                            :marker="marker"
                            @close="openMarker = null"
                        />
                    </YandexMapMarker>

                    <template #cluster="{ length }">
                        <div
                            class="flex h-12 min-w-12 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-black px-3 text-base font-semibold text-white shadow-lg"
                            :aria-label="`Магазинов в группе: ${length}`"
                        >
                            {{ length }}
                        </div>
                    </template>
                </YandexMapClusterer>
            </yandex-map>
        </div>
        <div
            v-if="viewMode === 'list'"
            class="container mx-auto px-4 pb-8"
        >
            <div class="divide-y divide-gray lg:hidden">
                <article
                    v-for="(marker, index) of cityPoints"
                    :key="index"
                    class="py-6"
                >
                    <h3 class="mb-2 text-base font-medium">
                        {{ marker.name }}
                    </h3>
                    <p class="text-base">{{ marker.address }}</p>

                    <dl class="mt-5 flex flex-col gap-4 text-base">
                        <div>
                            <dt class="mb-1 text-sm text-[hsla(216,64%,15%,0.5)]">
                                Режим работы магазина
                            </dt>
                            <dd>{{ marker["working-time"] }}</dd>
                        </div>
                        <div
                            v-if="
                                marker.phone.type === 'phone' &&
                                marker.phone.number
                            "
                        >
                            <dt class="mb-1 text-sm text-[hsla(216,64%,15%,0.5)]">
                                Телефон магазина
                            </dt>
                            <dd>
                                <a :href="`tel:+${marker.phone.number}`">
                                    +{{ marker.phone.number }}
                                </a>
                                <span v-if="marker.phone.ext">
                                    (Доб. {{ marker.phone.ext }})
                                </span>
                            </dd>
                        </div>
                    </dl>
                </article>
            </div>

            <table class="hidden w-full text-left text-base lg:table">
                <thead>
                    <tr>
                        <th
                            class="text-[1.25rem] border-b border-gray w-1/3 py-6 text-[hsla(216,64%,15%,0.5)] font-normal"
                        >
                            Адрес
                        </th>
                        <th
                            class="text-[1.25rem] border-b border-gray w-1/3 py-6 text-[hsla(216,64%,15%,0.5)] font-normal"
                        >
                            Режим работы магазина
                        </th>
                        <th
                            class="text-[1.25rem] border-b border-gray w-1/3 py-6 text-[hsla(216,64%,15%,0.5)] font-normal"
                        >
                            Телефон магазина
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(marker, index) of cityPoints" :key="index">
                        <td class="py-7 pr-7">
                            <div>
                                <span class="font-medium block mb-3">
                                    {{ marker.name }}</span
                                >
                                <span class="block max-w-[80%]">
                                    {{ marker.address }}</span
                                >
                            </div>
                        </td>
                        <td class="py-7 pr-7">{{ marker["working-time"] }}</td>
                        <td class="py-7">
                            <template
                                v-if="
                                    marker.phone.type === 'phone' &&
                                    marker.phone.number
                                "
                            >
                                +{{ marker.phone.number }} (Доб.
                                {{ marker.phone.ext }})
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
</template>
