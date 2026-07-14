<script setup lang="ts">
import type { IMedia } from "#shared/types/media";

const props = withDefaults(
    defineProps<{
        media: IMedia;
        mobileMedia: IMedia;
        loading?: HTMLImageElement["loading"];
        fetchPriority?: "auto" | "high" | "low";
        preload?: boolean;
        sizes?: string;
    }>(),
    {
        loading: "lazy",
        fetchPriority: "auto",
        preload: false,
        sizes: "100vw",
    },
);

const image = useImage();
const isImage = computed(() => props.media.mime.startsWith("image"));
const isImageMobile = computed(() => props.mobileMedia.mime.startsWith("image"));
const imageLoaded = ref(false);
const imageRef = ref<HTMLImageElement | null>(null);

const desktopImage = computed(() =>
    image.getSizes(props.media.url, {
        provider: "strapi",
        sizes: props.sizes,
    }),
);
const mobileImage = computed(() =>
    image.getSizes(props.mobileMedia.url, {
        provider: "strapi",
        sizes: props.sizes,
    }),
);

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

onMounted(() => {
    syncLoadedState(imageRef, imageLoaded);
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
                    href:
                        desktopImage.value.src ??
                        image(props.media.url, undefined, {
                            provider: "strapi",
                        }),
                    imagesrcset: desktopImage.value.srcset,
                    imagesizes: desktopImage.value.sizes,
                },
            ],
        };
    }

    return {
        link: [
            {
                ...sharedLinkAttrs,
                media: "(min-width: 1024px)",
                href:
                    desktopImage.value.src ??
                    image(props.media.url, undefined, { provider: "strapi" }),
                imagesrcset: desktopImage.value.srcset,
                imagesizes: desktopImage.value.sizes,
            },
            {
                ...sharedLinkAttrs,
                media: "(max-width: 1023.98px)",
                href:
                    mobileImage.value.src ??
                    image(props.mobileMedia.url, undefined, {
                        provider: "strapi",
                    }),
                imagesrcset: mobileImage.value.srcset,
                imagesizes: mobileImage.value.sizes,
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
                    :srcset="desktopImage.srcset"
                    :sizes="desktopImage.sizes"
                />
                <img
                    ref="imageRef"
                    :src="
                        mobileImage.src ??
                        image(props.mobileMedia.url, undefined, {
                            provider: 'strapi',
                        })
                    "
                    :srcset="mobileImage.srcset"
                    :sizes="mobileImage.sizes"
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
                    :src="
                        desktopImage.src ??
                        image(props.media.url, undefined, {
                            provider: 'strapi',
                        })
                    "
                    :srcset="desktopImage.srcset"
                    :sizes="desktopImage.sizes"
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
                :src="
                    image(props.media.url, undefined, { provider: 'strapi' })
                "
                playsinline
                :loading="props.loading"
                autoplay
                muted
                loop
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
                    :src="
                        mobileImage.src ??
                        image(props.mobileMedia.url, undefined, {
                            provider: 'strapi',
                        })
                    "
                    :srcset="mobileImage.srcset"
                    :sizes="mobileImage.sizes"
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
                :src="
                    image(props.mobileMedia.url, undefined, {
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
