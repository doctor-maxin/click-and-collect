<script setup lang="ts">
import type { IMedia } from "#shared/types/media";

const { media, mobileMedia, loading } = defineProps<{
    media: IMedia;
    mobileMedia: IMedia;
    loading?: HTMLImageElement["loading"];
}>();

const formatVideo = useImage();
const isImage = computed(() => media.mime.startsWith("image"));
const isImageMobile = computed(() => mobileMedia.mime.startsWith("image"));
const desktopLoaded = ref(false);
const mobileLoaded = ref(false);
const desktopImageRef = ref<HTMLImageElement | null>(null);
const mobileImageRef = ref<HTMLImageElement | null>(null);

async function syncLoadedState(
    target: Ref<HTMLImageElement | null>,
    state: Ref<boolean>,
) {
    await nextTick();

    if (target.value?.complete) {
        state.value = true;
    }
}

watch(
    () => media.url,
    async () => {
        desktopLoaded.value = false;
        await syncLoadedState(desktopImageRef, desktopLoaded);
    },
    { immediate: true },
);

watch(
    () => mobileMedia.url,
    async () => {
        mobileLoaded.value = false;
        await syncLoadedState(mobileImageRef, mobileLoaded);
    },
    { immediate: true },
);

onMounted(() => {
    syncLoadedState(desktopImageRef, desktopLoaded);
    syncLoadedState(mobileImageRef, mobileLoaded);
});
</script>

<template>
    <div class="relative ui-media">
        <div class="hidden lg:block h-full">
            <NuxtImg
                v-if="isImage"
                custom
                provider="strapi"
                :src="media.url"
                v-slot="{ src, imgAttrs }"
            >
                <div
                    class="ui-image-shell h-full"
                    :class="{ 'is-loaded': desktopLoaded }"
                >
                    <img
                        ref="desktopImageRef"
                        v-bind="imgAttrs"
                        :src="src"
                        :loading="loading"
                        @load="desktopLoaded = true"
                    />
                </div>
            </NuxtImg>
            <video
                v-else
                :src="formatVideo(media.url, undefined, { provider: 'strapi' })"
                playsinline
                :loading="loading"
                autoplay
                muted
                loop
            />
        </div>
        <div class="lg:hidden h-full">
            <NuxtImg
                v-if="isImageMobile"
                custom
                provider="strapi"
                :src="mobileMedia.url"
                v-slot="{ src, imgAttrs }"
            >
                <div
                    class="ui-image-shell h-full"
                    :class="{ 'is-loaded': mobileLoaded }"
                >
                    <img
                        ref="mobileImageRef"
                        v-bind="imgAttrs"
                        :loading="loading"
                        :src="src"
                        @load="mobileLoaded = true"
                    />
                </div>
            </NuxtImg>
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
