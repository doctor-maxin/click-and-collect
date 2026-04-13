<script setup lang="ts">
import type { IBannersBlock } from "~/widgets/render-blocks";
import BannerItem from "./banner-item.vue";
import BannerDetailedItem from "./banner-detailed-item.vue";

const { data } = defineProps<{
    data: IBannersBlock;
}>();

const columnsCount = computed(() =>
    Math.min(6, (data.items?.length ?? 0) + (data.detailedItems?.length ?? 0)),
);
</script>

<template>
    <section
        class="grid md:max-w-158 lg:max-w-none mx-auto px-4 my-4 lg:my-0 lg:px-0 grid-cols-1 lg:grid-cols-(--banners-count)"
        :style="{
            '--banners-count': `repeat(${columnsCount}, minmax(0, 1fr))`,
        }"
        role="navigation"
    >
        <BannerItem v-for="item of data.items" :key="item.id" :data="item" />
        <BannerDetailedItem
            v-for="item of data.detailedItems"
            :key="item.id"
            :data="item"
        />
    </section>
</template>
