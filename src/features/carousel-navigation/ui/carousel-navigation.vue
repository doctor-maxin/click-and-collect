<script setup lang="ts">
withDefaults(
    defineProps<{
        visible?: boolean;
        colorScheme?: "dark" | "light";
        horizontalOffset?: "outside" | "inside";
        previousLabel?: string;
        nextLabel?: string;
        previousDisabled?: boolean;
        nextDisabled?: boolean;
    }>(),
    {
        visible: true,
        colorScheme: "dark",
        horizontalOffset: "outside",
        previousLabel: "Предыдущий слайд",
        nextLabel: "Следующий слайд",
    },
);

const emit = defineEmits<{
    previous: [];
    next: [];
}>();
</script>

<template>
    <div
        v-show="visible"
        class="carousel-navigation pointer-events-none absolute top-0 z-20 hidden h-full items-center justify-between lg:flex"
    >
        <button
            type="button"
            :aria-label="previousLabel"
            :disabled="previousDisabled"
            :class="[
                'pointer-events-auto flex size-12 items-center justify-center cursor-pointer rounded-full rotate-180 disabled:pointer-events-none disabled:opacity-0',
                horizontalOffset === 'outside'
                    ? '3xl:-translate-x-[calc(100%+16px)]'
                    : '',
                colorScheme === 'light'
                    ? 'bg-white text-black'
                    : 'bg-black/25 text-white',
            ]"
            @click="emit('previous')"
        >
            <SvgoChevron
                aria-hidden="true"
                filled
                class="!mb-0 "
                :class="{
                    'text-4xl': colorScheme === 'dark',
                    'text-3xl': colorScheme === 'light',
                }"
            />
        </button>
        <button
            type="button"
            :aria-label="nextLabel"
            :disabled="nextDisabled"
            :class="[
                'pointer-events-auto flex size-12 items-center justify-center cursor-pointer rounded-full disabled:pointer-events-none disabled:opacity-0',
                horizontalOffset === 'outside'
                    ? '3xl:translate-x-[calc(100%+16px)]'
                    : '',
                colorScheme === 'light'
                    ? 'bg-white text-black'
                    : 'bg-black/25 text-white',
            ]"
            @click="emit('next')"
        >
            <SvgoChevron
                aria-hidden="true"
                filled
                class="!mb-0"
                :class="{
                    'text-4xl': colorScheme === 'dark',
                    'text-3xl': colorScheme === 'light',
                }"
            />
        </button>
    </div>
</template>
