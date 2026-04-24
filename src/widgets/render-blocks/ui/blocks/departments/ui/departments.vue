<script setup lang="ts">
import { FeatureRenderMedia } from "~/features/render-media";
import type { IDepartmentsBlocks } from "~/widgets/render-blocks";

defineProps<{
    data: IDepartmentsBlocks;
}>();
</script>
<template>
    <section
        v-if="data?.items?.length"
        class="mx-auto my-9 px-4 gap-4 container hidden md:grid grid-cols-2 lg:grid-cols-[repeat(var(--departments-cols),minmax(0,1fr))]"
        :style="{
            '--departments-cols': data.items.length,
        }"
        role="navigation"
    >
        <article v-for="item of data.items" :key="item.id">
            <NuxtLink
                :to="item.link"
                class="flex justify-center items-center relative aspect-3/4"
            >
                <h3
                    class="absolute max-w-[95%] text-center uppercase font-bold z-10 text-[1.75rem] leading-9 text-white"
                >
                    {{ item.name }}
                </h3>
                <FeatureRenderMedia
                    class="w-full h-full"
                    :media="item.image"
                    :mobile-media="item.image"
                />
            </NuxtLink>
        </article>
    </section>
</template>
