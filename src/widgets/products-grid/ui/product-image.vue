<script setup lang="ts">
defineOptions({
    inheritAttrs: false,
});

interface Props {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fetchpriority?: string;
    loading?: "lazy" | "eager";
    sizes?: string;
    format?: "webp" | "avif" | "jpeg" | "jpg" | "png" | "svg" | "gif";
}

const props = withDefaults(defineProps<Props>(), {
    loading: "lazy",
});

const attrs = useAttrs();
const appConfig = useAppConfig();
const isS3 = computed(() => appConfig.provider === "s3");
const isLoaded = ref(false);
const imageRef = ref<HTMLImageElement | null>(null);

const wrapperClass = computed(() => attrs.class);
const wrapperStyle = computed(() => attrs.style);

async function syncLoadedState() {
    await nextTick();

    if (imageRef.value?.complete) {
        isLoaded.value = true;
    }
}

function onLoad() {
    isLoaded.value = true;
}

function onError() {
    isLoaded.value = true;
}

watch(
    () => props.src,
    async () => {
        isLoaded.value = false;
        await syncLoadedState();
    },
    { immediate: true },
);

onMounted(() => {
    syncLoadedState();
});
</script>

<template>
    <NuxtImg
        v-if="isS3"
        custom
        :src="src"
        :alt="alt"
        :width="width"
        :height="height"
        :loading="loading"
        :format="format"
        provider="customS3"
        :fetchpriority="fetchpriority"
        :sizes="sizes"
        v-slot="{ src: imageSrc, imgAttrs }"
    >
        <div
            class="ui-image-shell"
            :class="[wrapperClass, { 'is-loaded': isLoaded }]"
            :style="wrapperStyle"
        >
            <img
                ref="imageRef"
                v-bind="{ ...imgAttrs, ...attrs }"
                :src="imageSrc"
                :alt="alt"
                @load="onLoad"
                @error="onError"
            />
        </div>
    </NuxtImg>
    <div
        v-else
        class="ui-image-shell"
        :class="[wrapperClass, { 'is-loaded': isLoaded }]"
        :style="wrapperStyle"
    >
        <img
            ref="imageRef"
            v-bind="attrs"
            :src="src"
            :alt="alt"
            :width="width"
            :height="height"
            :loading="loading"
            :sizes="sizes"
            @load="onLoad"
            @error="onError"
        />
    </div>
</template>
