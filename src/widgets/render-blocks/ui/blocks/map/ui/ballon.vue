<script setup lang="ts">
import type { MapPoint } from "../model/map-point.model";

defineProps<{
    marker: MapPoint;
}>();

defineEmits<{
    close: [];
}>();
</script>

<template>
    <div
        class="ballon absolute bottom-full left-1/2 z-20 mb-3 flex w-[20rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col rounded-2xl border border-gray bg-white p-5 text-left shadow-xl"
        @click.stop
    >
        <button
            type="button"
            class="absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-[hsl(180,16%,93%)]"
            aria-label="Закрыть информацию о магазине"
            @click.stop="$emit('close')"
        >
            <SvgoClose aria-hidden="true" filled class="mb-0! text-lg" />
        </button>

        <h4 class="pr-9 text-base font-semibold">
            {{ marker.name }}
        </h4>
        <p class="mt-2 pr-4 text-sm leading-5">
            {{ marker.address }}
        </p>

        <dl class="mt-4 flex flex-col gap-3 text-sm">
            <div>
                <dt class="sr-only">Режим работы</dt>
                <dd>{{ marker["working-time"] }}</dd>
            </div>
            <div
                v-if="marker.phone.type === 'phone' && marker.phone.number"
            >
                <dt class="sr-only">Телефон</dt>
                <dd>
                    <a
                        class="underline underline-offset-2"
                        :href="`tel:+${marker.phone.number}`"
                    >
                        +{{ marker.phone.number }}
                    </a>
                    <span v-if="marker.phone.ext">
                        (Доб. {{ marker.phone.ext }})
                    </span>
                </dd>
            </div>
        </dl>
    </div>
</template>
