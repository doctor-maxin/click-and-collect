<script setup lang="ts">
import { FeatureRenderMedia } from "~/features/render-media";
import type { YMap } from "@yandex/ymaps3-types";
import {
    YandexMap,
    YandexMapDefaultSchemeLayer,
    YandexMapDefaultFeaturesLayer,
    YandexMapDefaultMarker,
    YandexMapMarker,
} from "vue-yandex-maps";
import type { ISharedMap } from "~/widgets/render-blocks";
import { useAsyncData } from "#app";
import { shallowRef, markRaw, ref } from "vue";
import type { MapPoint } from "../model/map-point.model";
import Ballon from "./ballon.vue";

defineProps<{
    data: ISharedMap;
}>();

const { data: points } = await useAsyncData<MapPoint[]>("map-points", () =>
    $fetch("/api/map-points"),
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
const openMarker = ref<number | null>(null);
</script>
<template>
    <section class="pt-8 lg:pt-9 container lg:max-w-none mx-auto">
        <h2 class="font-bold mb-6 lg:mb-[3.25rem] text-[2rem] text-center">
            {{ data.header }}
        </h2>
        <header
            class="flex mb-6 lg:mb-9 lg:mx-auto lg:container justify-end py-2"
        >
            <UiToggle :options="options" v-model="viewMode" />
        </header>
        <div
            v-if="viewMode === 'map'"
            class="grid grid-cols-1 grid-rows-2 lg:grid-rows-1 lg:grid-cols-2"
        >
            <FeatureRenderMedia
                :media="data.defaultMedia"
                :mobile-media="data.defaultMobileMedia"
                loading="lazy"
                class="aspect-[6/7] lg:aspect-[7/5]"
            />

            <yandex-map
                v-model="map"
                :settings="{
                    location: {
                        center: [37.617644, 55.755819],
                        zoom: 9,
                    },
                }"
                class="h-full"
            >
                <yandex-map-default-scheme-layer />
                <yandex-map-default-features-layer />
                <template v-for="(marker, index) of points" :key="index">
                    <YandexMapMarker
                        position="left-center top"
                        :settings="{
                            zIndex: openMarker === index ? 2 : 0,
                            coordinates: [
                                marker.coordinates.lon,
                                marker.coordinates.lat,
                            ],
                            hideOutsideViewport: true,
                        }"
                        @click="
                            openMarker = openMarker === index ? null : index
                        "
                    >
                        <SvgoSinMarker
                            filled
                            class="text-[4rem] cursor-pointer !mb-0"
                        />

                        <Ballon
                            v-if="openMarker === index"
                            :marker="marker"
                            @close="openMarker = null"
                        />
                    </YandexMapMarker>
                </template>
            </yandex-map>
        </div>
        <div v-if="viewMode === 'list'" class="container mx-auto">
            <table class="text-base text-left">
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
                            Режим работы
                        </th>
                        <th
                            class="text-[1.25rem] border-b border-gray w-1/3 py-6 text-[hsla(216,64%,15%,0.5)] font-normal"
                        >
                            Служба поддержки
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(marker, index) of points" :key="index">
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
