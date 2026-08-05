<script setup lang="ts">
import { FeatureMainMenu } from "~/features/main-menu";
import { FeatureSearch } from "~/features/search";
import { FeatureFavoriteCountBadge } from "~/features/favorites";

const isHeaderVisible = ref(true);
const lastScrollY = ref(0);
const route = useRoute();

const TOP_OFFSET = 40;
const TOGGLE_THRESHOLD = 12;

const headerTranslateY = computed(() =>
    isHeaderVisible.value ? "0%" : "-100%",
);
const headerOpacity = computed(() => (isHeaderVisible.value ? "1" : "0"));
const headerPointerEvents = computed(() =>
    isHeaderVisible.value ? "auto" : "none",
);

const getScrollY = () => {
    if (import.meta.client) {
        return Math.max(window.scrollY, 0);
    }

    return 0;
};

const syncHeaderState = () => {
    const currentScrollY = getScrollY();

    lastScrollY.value = currentScrollY;
    isHeaderVisible.value = currentScrollY <= TOP_OFFSET;
};

const onScroll = () => {
    const currentScrollY = getScrollY();
    const delta = currentScrollY - lastScrollY.value;

    if (currentScrollY <= TOP_OFFSET) {
        isHeaderVisible.value = true;
        lastScrollY.value = currentScrollY;
        return;
    }

    if (delta > TOGGLE_THRESHOLD) {
        isHeaderVisible.value = false;
    } else if (delta < -TOGGLE_THRESHOLD) {
        isHeaderVisible.value = true;
    }

    lastScrollY.value = currentScrollY;
};

onMounted(() => {
    syncHeaderState();
});

useEventListener(import.meta.client ? window : undefined, "scroll", onScroll, {
    passive: true,
});

watch(
    () => route.fullPath,
    () => {
        syncHeaderState();
    },
    {
        immediate: true,
    },
);

const client = useStrapiClient();
await useAsyncData(
    "main-menu",
    () =>
        client
            .single("navigation/render/main-menu?type=TREE")
            .find() as unknown as Promise<NavigationMenu>,
);
</script>
<template>
    <div
        class="fixed ui-header left-0 top-0 z-30 bg-transparent w-full flex justify-center"
    >
        <div
            class="ui-header-content container px-4 items-center text-black grid grid-cols-[1fr_auto_1fr]"
        >
            <FeatureMainMenu />

            <NuxtLink to="/" class="mx-auto" aria-label="На главную">
                <SvgoLogo
                    aria-hidden="true"
                    class="h-12 lg:h-22.5 mx-auto"
                    :fontControlled="false"
                />
            </NuxtLink>
            <div class="flex items-center justify-self-end gap-3">
                <FeatureSearch />
                <NuxtLink
                    to="/favorites"
                    class="relative flex size-6 items-center justify-center"
                    aria-label="Избранное"
                >
                    <SvgoHeart
                        aria-hidden="true"
                        filled
                        class="!mb-0 text-2xl"
                    />
                    <ClientOnly>
                        <FeatureFavoriteCountBadge />
                    </ClientOnly>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.ui-header {
    position: absolute;
}

.ui-header-content {
    padding-top: calc(0.5rem + env(safe-area-inset-top, 0px));
    padding-bottom: 0.5rem;
}

@media (min-width: 1024px) {
    .ui-header-content {
        padding-top: calc(1.25rem + env(safe-area-inset-top, 0px));
        padding-bottom: 1.25rem;
    }
}

.ui-header-shell {
    transform: translate3d(0, v-bind(headerTranslateY), 0);
    opacity: v-bind(headerOpacity);
    pointer-events: v-bind(headerPointerEvents);
    transition:
        background-color 200ms ease,
        transform 200ms ease,
        opacity 200ms ease;
    will-change: transform, opacity;
}

body:has(.search-dialog[data-state="open"]) .ui-header {
    background-image: unset !important;
    color: black !important;
}
</style>
