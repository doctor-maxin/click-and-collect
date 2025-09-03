<script setup lang="ts">
import { FeatureRenderMedia } from "~/features/render-media";
import type { IThematicsBlocks } from "~/widgets/render-blocks";

defineProps<{
    data: IThematicsBlocks;
}>();
</script>
<template>
    <section
        v-if="data.items?.length"
        class="container mx-auto my-12 flex justify-center gap-11"
    >
        <article v-for="item of data.items" :key="item.id">
            <NuxtLink
                :to="item.link"
                class="flex max-w-[10rem] flex-col gap-3 items-center"
            >
                <FeatureRenderMedia
                    class="aspect-square w-[7.5rem]"
                    :media="item.image"
                    :mobile-media="item.image"
                />

                <span
                    class="text-center block w-full font-semibold leading-6 text-[1.25rem]"
                    :style="{
                        color: item.textColor ? item.textColor : 'inherit',
                    }"
                    >{{ item.text }}</span
                >
            </NuxtLink>
        </article>
    </section>
</template>
