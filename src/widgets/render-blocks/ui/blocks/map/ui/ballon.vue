<script setup lang="ts">
import type { MapPoint } from "../model/map-point.model";

defineProps<{
    marker: MapPoint;
}>();
</script>

<template>
    <div
        class="bg-white ballon z-20 absolute left-0 top-full w-[20rem] border border-gray gap-4 p-6 flex flex-col"
    >
        <h4 class="font-bold">{{ marker.name ?? "" }}</h4>
        <p>{{ marker.address ?? "" }}</p>
        <div>
            <p>{{ marker["working-time"] ?? "" }}</p>
            <a
                class="underline"
                v-if="marker.phone.type === 'phone'"
                :href="`tel:+${marker.phone.number}`"
                >+{{ marker.phone.number }}</a
            >
        </div>
    </div>
</template>
