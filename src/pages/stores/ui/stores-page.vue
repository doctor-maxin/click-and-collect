<script setup lang="ts">
import { getStoresPage } from "../api/get-stores-page";
import { WidgetRenderBlocks } from "~/widgets/render-blocks";
import { resolveSeoMeta, toAbsoluteSiteUrl } from "#shared/lib";

const { data: storesPage } = await useAsyncData("stores-page", () =>
    getStoresPage(),
);

if (!storesPage.value) {
    throw createError({
        message: "Страница не найдена",
        statusCode: 404,
        fatal: true,
    });
}

const siteConfig = useSiteConfig();
const canonicalUrl = computed(() =>
    toAbsoluteSiteUrl(siteConfig.url, "/stores"),
);
const mapBlocks = computed(() =>
    storesPage.value?.map ? [storesPage.value.map] : [],
);
const storesMeta = computed(() =>
    resolveSeoMeta({
        canonical: canonicalUrl.value,
        title: `Наши магазины | ${siteConfig.name}`,
        image: storesPage.value?.map.defaultMedia?.url,
        seo: storesPage.value?.seo,
    }),
);

useHead(() => ({
    link: [
        {
            rel: "canonical",
            href: storesMeta.value.canonical,
        },
    ],
}));

useSeoMeta({
    title: () => storesMeta.value.title,
    description: () => storesMeta.value.description,
    keywords: () => storesMeta.value.keywords,
    robots: () => storesMeta.value.robots,
    ogTitle: () => storesMeta.value.ogTitle,
    ogDescription: () => storesMeta.value.ogDescription,
    ogUrl: () => storesMeta.value.ogUrl,
    ogType: () => storesMeta.value.ogType,
    ogImage: () => storesMeta.value.ogImage,
    twitterCard: "summary_large_image",
    twitterTitle: () => storesMeta.value.ogTitle,
    twitterDescription: () => storesMeta.value.ogDescription,
    twitterImage: () => storesMeta.value.ogImage,
});
</script>

<template>
    <main class="pt-16 lg:pt-[8.125rem]">
        <h1 class="sr-only">Наши магазины</h1>
        <WidgetRenderBlocks
            v-if="mapBlocks.length"
            :content="mapBlocks"
        />
    </main>
</template>
