<script setup lang="ts">
import { FeatureRenderMedia } from "~/features/render-media";
import type { IBannerDetailedItem } from "../../../../model/render-blocks.model";
import { NuxtLink } from "#components";

defineProps<{
    data: IBannerDetailedItem;
}>();
</script>
<template>
    <article class="relative">
        <component :is="data.link ? NuxtLink : 'div'" :to="data.link">
            <FeatureRenderMedia
                :media="data.media"
                :mobile-media="data.mobileMedia"
            />

            <div
                class="absolute text-white bottom-0 left-0 px-[4.6875rem] pb-8 flex w-full flex-col gap-9"
            >
                <p class="text-[1.5rem] font-bold leading-8">
                    {{ data.description }}
                </p>
                <span
                    v-if="data.showLinkButton"
                    class="flex ml-auto gap-4 items-center text-[1.5rem] font-semibold"
                    >{{
                        data.linkButtonText ? data.linkButtonText : "Смотреть"
                    }}
                    <SvgoLongArray class="text-[3rem] !mb-0" filled
                /></span>
            </div>
        </component>
    </article>
</template>
