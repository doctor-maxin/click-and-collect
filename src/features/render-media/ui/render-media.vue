<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import type { IMedia } from "#shared/types/media";

type ImageModifiers = {
    width: number;
    height?: number;
    quality?: number;
};

const props = withDefaults(
    defineProps<{
        media: IMedia;
        mobileMedia: IMedia;
        imageProvider?: "strapi" | "customS3";
        desktopImageModifiers?: ImageModifiers;
        mobileImageModifiers?: ImageModifiers;
        loading?: HTMLImageElement["loading"];
        fetchPriority?: "auto" | "high" | "low";
        preload?: boolean;
        videoAutoplay?: boolean;
        videoLoop?: boolean;
        videoControls?: boolean;
        videoActive?: boolean;
    }>(),
    {
        imageProvider: "strapi",
        loading: "lazy",
        fetchPriority: "auto",
        preload: false,
        videoAutoplay: true,
        videoLoop: true,
        videoControls: false,
        videoActive: true,
    },
);

const image = useImage();
const {
    public: { cdnDomain, mediaStorageUrl },
} = useRuntimeConfig();
const isImage = computed(() => props.media.mime.startsWith("image"));
const isImageMobile = computed(() => props.mobileMedia.mime.startsWith("image"));
const imageLoaded = ref(false);
const imageRef = ref<HTMLImageElement | null>(null);
const desktopVideoRef = ref<HTMLVideoElement | null>(null);
const mobileVideoRef = ref<HTMLVideoElement | null>(null);
const isDesktopViewport = useMediaQuery("(min-width: 1024px)");

function isGif(media: IMedia) {
    return media.mime.toLowerCase() === "image/gif";
}

function resolveGifUrl(media: IMedia) {
    if (!isGif(media) || !cdnDomain || !mediaStorageUrl) {
        return media.url;
    }

    try {
        const sourceUrl = new URL(media.url);
        const normalizedCdnUrl = new URL(
            String(cdnDomain).includes("://")
                ? String(cdnDomain)
                : `https://${String(cdnDomain)}`,
        );

        if (sourceUrl.hostname !== normalizedCdnUrl.hostname) {
            return media.url;
        }

        const originalPath = sourceUrl.pathname.replace(
            /^\/ioss\([^)]+\)(?=\/)/,
            "",
        );
        return new URL(
            `${originalPath}${sourceUrl.search}${sourceUrl.hash}`,
            String(mediaStorageUrl),
        ).toString();
    } catch {
        return media.url;
    }
}

function resolveMediaUrl(media: IMedia, modifiers?: ImageModifiers) {
    if (isGif(media)) {
        return resolveGifUrl(media);
    }

    if (!media.mime.startsWith("image")) {
        return media.url;
    }

    return image(media.url, modifiers, {
        provider: props.imageProvider as 'ipx',
    });
}

const desktopMediaUrl = computed(() =>
    resolveMediaUrl(props.media, props.desktopImageModifiers),
);
const mobileMediaUrl = computed(() =>
    resolveMediaUrl(props.mobileMedia, props.mobileImageModifiers),
);

function pauseVideo(video: HTMLVideoElement | null, reset = true) {
    if (!video) return;

    video.pause();
    if (!reset) return;

    try {
        video.currentTime = 0;
    } catch {
        // The source may not have loaded its metadata yet.
    }
}

async function syncVideoPlayback() {
    await nextTick();

    const activeVideo = isDesktopViewport.value
        ? desktopVideoRef.value
        : mobileVideoRef.value;
    const videos = [desktopVideoRef.value, mobileVideoRef.value];

    for (const video of videos) {
        if (
            video &&
            video === activeVideo &&
            props.videoActive &&
            props.videoAutoplay
        ) {
            video.defaultMuted = true;
            video.muted = true;
            void video.play().catch(() => undefined);
            continue;
        }

        pauseVideo(video);
    }
}

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
    () => [props.media.url, props.mobileMedia.url],
    async () => {
        imageLoaded.value = false;
        await syncLoadedState(imageRef, imageLoaded);
    },
    { immediate: true },
);

watch(
    [
        () => props.videoActive,
        () => props.videoAutoplay,
        desktopMediaUrl,
        mobileMediaUrl,
        isDesktopViewport,
    ],
    () => void syncVideoPlayback(),
    { flush: "post" },
);

onMounted(() => {
    syncLoadedState(imageRef, imageLoaded);
    void syncVideoPlayback();
});

onActivated(() => {
    void syncVideoPlayback();
});

onDeactivated(() => {
    pauseVideo(desktopVideoRef.value, false);
    pauseVideo(mobileVideoRef.value, false);
});

onBeforeUnmount(() => {
    pauseVideo(desktopVideoRef.value, false);
    pauseVideo(mobileVideoRef.value, false);
});

useHead(() => {
    if (!props.preload || !isImage.value || !isImageMobile.value) {
        return {};
    }

    const fetchpriority = props.fetchPriority;
    const sharedLinkAttrs = {
        rel: "preload",
        as: "image",
        fetchpriority,
    };

    if (props.media.url === props.mobileMedia.url) {
        return {
            link: [
                {
                    ...sharedLinkAttrs,
                    href: desktopMediaUrl.value,
                },
            ],
        };
    }

    return {
        link: [
            {
                ...sharedLinkAttrs,
                media: "(min-width: 1024px)",
                href: desktopMediaUrl.value,
            },
            {
                ...sharedLinkAttrs,
                media: "(max-width: 1023.98px)",
                href: mobileMediaUrl.value,
            },
        ],
    };
});
</script>

<template>
    <div class="relative ui-media">
        <template v-if="isImage && isImageMobile">
            <picture
                class="ui-image-shell block h-full"
                :class="{ 'is-loaded': imageLoaded }"
            >
                <source
                    media="(min-width: 1024px)"
                    :srcset="desktopMediaUrl"
                />
                <img
                    ref="imageRef"
                    :src="mobileMediaUrl"
                    :alt="
                        props.mobileMedia.alternativeText ??
                        props.media.alternativeText ??
                        ''
                    "
                    :loading="props.loading"
                    :fetchpriority="props.fetchPriority"
                    decoding="async"
                    @load="imageLoaded = true"
                    @error="imageLoaded = true"
                />
            </picture>
        </template>

        <div v-else class="hidden lg:block h-full">
            <div
                v-if="isImage"
                class="ui-image-shell h-full"
                :class="{ 'is-loaded': imageLoaded }"
            >
                <img
                    ref="imageRef"
                    :src="desktopMediaUrl"
                    :alt="props.media.alternativeText ?? ''"
                    :loading="props.loading"
                    :fetchpriority="props.fetchPriority"
                    decoding="async"
                    @load="imageLoaded = true"
                    @error="imageLoaded = true"
                />
            </div>
            <video
                v-else
                ref="desktopVideoRef"
                :src="desktopMediaUrl"
                :autoplay="props.videoAutoplay && props.videoActive"
                :controls="props.videoControls"
                :loop="props.videoLoop"
                :preload="props.loading === 'eager' ? 'auto' : 'metadata'"
                :class="{ 'pointer-events-none': !props.videoControls }"
                playsinline
                muted
                disablepictureinpicture
                disableremoteplayback
                controlslist="nodownload nofullscreen noremoteplayback"
                @loadedmetadata="syncVideoPlayback"
            />
        </div>
        <div v-if="!isImage || !isImageMobile" class="lg:hidden h-full">
            <div
                v-if="isImageMobile"
                class="ui-image-shell h-full"
                :class="{ 'is-loaded': imageLoaded }"
            >
                <img
                    ref="imageRef"
                    :src="mobileMediaUrl"
                    :alt="props.mobileMedia.alternativeText ?? ''"
                    :loading="props.loading"
                    :fetchpriority="props.fetchPriority"
                    decoding="async"
                    @load="imageLoaded = true"
                    @error="imageLoaded = true"
                />
            </div>
            <video
                v-else
                ref="mobileVideoRef"
                :src="mobileMediaUrl"
                :autoplay="props.videoAutoplay && props.videoActive"
                :controls="props.videoControls"
                :loop="props.videoLoop"
                :preload="props.loading === 'eager' ? 'auto' : 'metadata'"
                :class="{ 'pointer-events-none': !props.videoControls }"
                playsinline
                muted
                disablepictureinpicture
                disableremoteplayback
                controlslist="nodownload nofullscreen noremoteplayback"
                @loadedmetadata="syncVideoPlayback"
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
