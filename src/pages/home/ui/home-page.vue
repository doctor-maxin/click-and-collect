<script setup lang="ts">
import { getHomePage } from "../api/get-home-page";
import { WidgetRenderBlocks } from "~/widgets/render-blocks";
import {
    resolveSeoMeta,
    truncateDescription,
    extractFirstImageUrl,
    extractPlainText,
    toAbsoluteSiteUrl,
} from "#shared/lib";

const { data: homePage, error } = await useAsyncData("home-page", () =>
    getHomePage(),
);

const siteConfig = useSiteConfig();
const canonicalUrl = computed(() =>
    toAbsoluteSiteUrl(siteConfig.url, "/"),
);
const homeMeta = computed(() =>
    resolveSeoMeta({
        canonical: canonicalUrl.value,
        title: homePage.value?.H1
            ? `${homePage.value.H1} | ${siteConfig.name}`
            : siteConfig.name,
        description: truncateDescription(
            extractPlainText(homePage.value?.content),
        ),
        image: extractFirstImageUrl(homePage.value?.content),
        //@ts-expect-error generated gql types may lag behind query updates
        seo: homePage.value?.seo,
    }),
);

useHead(() => ({
    link: [
        {
            rel: "canonical",
            href: homeMeta.value.canonical,
        },
    ],
}));

useSeoMeta({
    title: () => homeMeta.value.title,
    description: () => homeMeta.value.description,
    keywords: () => homeMeta.value.keywords,
    robots: () => homeMeta.value.robots,
    ogTitle: () => homeMeta.value.ogTitle,
    ogDescription: () => homeMeta.value.ogDescription,
    ogUrl: () => homeMeta.value.ogUrl,
    ogImage: () => homeMeta.value.ogImage,
    twitterCard: "summary_large_image",
    twitterTitle: () => homeMeta.value.ogTitle,
    twitterDescription: () => homeMeta.value.ogDescription,
    twitterImage: () => homeMeta.value.ogImage,
});
</script>
<template>
    <div class="home-page">
        <h1 class="hidden">{{ homePage?.H1 }}</h1>
        <WidgetRenderBlocks v-if="homePage" :content="homePage?.content" />
    </div>
</template>
