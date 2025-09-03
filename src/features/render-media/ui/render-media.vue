<script setup lang="ts">
import type { IMedia } from "#shared/types/media";

const { media, mobileMedia } = defineProps<{
    media: IMedia;
    mobileMedia: IMedia;
    loading?: HTMLImageElement["loading"];
}>();

const formatVideo = useImage();

const isImage = computed(() => media.mime.startsWith("image"));
const isImageMobile = computed(() => mobileMedia.mime.startsWith("image"));
</script>

<template>
    <div class="relative ui-media">
        <div class="hidden lg:block h-full">
            <NuxtImg
                provider="strapi"
                v-if="isImage"
                :loading="loading"
                :src="media.url"
            />
            <video
                v-else
                :src="formatVideo(media.url, undefined, { provider: 'strapi' })"
                playsinline
                autoplay
                muted
                loop
            />
        </div>
        <div class="lg:hidden h-full">
            <NuxtImg
                provider="strapi"
                v-if="isImageMobile"
                :loading="loading"
                :src="mobileMedia.url"
            />
            <video
                v-else
                :src="
                    formatVideo(mobileMedia.url, undefined, {
                        provider: 'strapi',
                    })
                "
                playsinline
                autoplay
                muted
                loop
            />
        </div>
    </div>
</template>

<style>
.ui-media {
    img,
    video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center center;
    }
}
</style>
