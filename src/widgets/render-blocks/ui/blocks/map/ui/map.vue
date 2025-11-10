<script setup lang="ts">
import { FeatureRenderMedia } from "~/features/render-media";
import type { YMap, LngLat } from "@yandex/ymaps3-types";
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultMarker,
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
      data.filter((point) => point.coordinates.lat && point.coordinates.lon),
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
  console.log(list);

  return Array.from(list).map((city) => ({
    label: city,
    value: city,
  }));
});
const openMarker = ref<number | null>(null);

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
      (point) => [+point.coordinates.lon, +point.coordinates.lat] as LngLat,
    );
    const center = getCenterFromCoords(coords);
    map.value.setLocation({
      duration: 300,
      center,
    });
    console.log("changed center");
  } else {
    const coords = cityPoints.value.map(
      (point) => [+point.coordinates.lon, +point.coordinates.lat] as LngLat,
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
watch(city, centerToCity);

watch(viewMode, (mode) => {
  if (mode === "map" && city.value) {
    setTimeout(() => {
      centerToCity();
    }, 300);
  }
});
</script>
<template>
  <section class="pt-6 lg:pt-9 container lg:max-w-none mx-auto">
    <h2 class="font-bold mb-6 lg:mb-[3.25rem] text-[2rem] text-center">
      {{ data.header }}
    </h2>
    <header
      class="flex flex-col-reverse gap-3 px-4 lg:px-0 lg:flex-row mb-3 lg:mb-9 lg:mx-auto lg:container justify-end py-2"
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
      class="grid grid-cols-1 grid-rows-2 lg:grid-rows-1 lg:grid-cols-2"
    >
      <FeatureRenderMedia
        :media="data.defaultMedia"
        :mobile-media="data.defaultMobileMedia"
        loading="lazy"
        class="aspect-[6/7] lg:h-full"
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
              coordinates: [marker.coordinates.lon, marker.coordinates.lat],
              hideOutsideViewport: true,
            }"
            @click="openMarker = openMarker === index ? null : index"
          >
            <SvgoSinMarker filled class="text-[4rem] cursor-pointer !mb-0" />

            <Ballon
              v-if="openMarker === index"
              :marker="marker"
              @close="openMarker = null"
            />
          </YandexMapMarker>
        </template>
      </yandex-map>
    </div>
    <div v-if="viewMode === 'list'" class="px-4 container mx-auto">
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
                <span class="font-medium block mb-3"> {{ marker.name }}</span>
                <span class="block max-w-[80%]"> {{ marker.address }}</span>
              </div>
            </td>
            <td class="py-7 pr-7">{{ marker["working-time"] }}</td>
            <td class="py-7">
              <template
                v-if="marker.phone.type === 'phone' && marker.phone.number"
              >
                +{{ marker.phone.number }} (Доб. {{ marker.phone.ext }})
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
