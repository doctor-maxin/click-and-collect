<script setup lang="ts">
import { PublicationStatus } from "#gql/default";
import { StrapiBlocks, type BlocksContent } from "vue-strapi-blocks-renderer";
import {
    extractFirstImageUrl,
    extractPlainText,
} from "#shared/lib/seo-content";
import { resolveSeoMeta, truncateDescription } from "#shared/lib/seo-meta";
import { toAbsoluteSiteUrl } from "#shared/lib/site-url";

const route = useRoute();
const siteConfig = useSiteConfig();
const canonicalUrl = computed(
    () => toAbsoluteSiteUrl(siteConfig.url, `/pages/${route.params.handle as string}`),
);

const { data: page, error } = await useAsyncData(
    () => route.params.handle as string,
    () =>
        GqlGetStaticPage({
            status: PublicationStatus.PUBLISHED,
            filters: {
                handle: {
                    eq: route.params.handle as string,
                },
            },
        }),
    {
        transform: (r) => {
            return r?.pages?.[0];
        },
        watch: [() => route.params.handle as string],
    },
);
if (!page.value)
    throw createError({
        message: "Страница не найдена",
        statusCode: 404,
        fatal: true,
        data: route.params,
    });

const staticMeta = computed(() =>
    resolveSeoMeta({
        canonical: canonicalUrl.value,
        title: page.value?.title
            ? `${page.value.title} | ${siteConfig.name}`
            : siteConfig.name,
        description: truncateDescription(
            extractPlainText(page.value?.preamble) ||
                extractPlainText(page.value?.content),
        ),
        image:
            extractFirstImageUrl(page.value?.preamble) ||
            extractFirstImageUrl(page.value?.content),
        //@ts-expect-error generated gql types may lag behind query updates
        seo: page.value?.seo,
    }),
);

useHead(() => ({
    link: [
        {
            rel: "canonical",
            href: staticMeta.value.canonical,
        },
    ],
}));

useSeoMeta({
    title: () => staticMeta.value.title,
    description: () => staticMeta.value.description,
    keywords: () => staticMeta.value.keywords,
    robots: () => staticMeta.value.robots,
    ogTitle: () => staticMeta.value.ogTitle,
    ogDescription: () => staticMeta.value.ogDescription,
    ogUrl: () => staticMeta.value.ogUrl,
    ogType: () => staticMeta.value.ogType,
    ogImage: () => staticMeta.value.ogImage,
    twitterCard: "summary_large_image",
    twitterTitle: () => staticMeta.value.ogTitle,
    twitterDescription: () => staticMeta.value.ogDescription,
    twitterImage: () => staticMeta.value.ogImage,
});

const breadcrumbItems = computed(() => [
    {
        item: toAbsoluteSiteUrl(siteConfig.url, "/"),
        name: "Главная",
    },
    {
        item: canonicalUrl.value,
        name: page.value?.title || "Страница",
    },
]);

useSchemaOrg([
    defineBreadcrumb({
        itemListElement: () =>
            breadcrumbItems.value.map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.name,
                item: item.item,
            })),
    }),
]);
</script>
<template>
    <div v-if="page" class="mt-16 lg:mt-[8.125rem]">
        <div class="container mx-auto px-4">
            <h1
                class="mt-6 mb-4 lg:my-9 text-center font-semibold text-[1.25rem] leading-6"
            >
                {{ page.title }}
            </h1>
            <div
                v-if="page?.preamble?.length"
                class="content max-w-[37rem] ml-auto"
            >
                <StrapiBlocks :content="page?.preamble as BlocksContent" />
            </div>
            <div v-if="page.content" class="content">
                <StrapiBlocks :content="page?.content as BlocksContent" />
            </div>
        </div>
    </div>
</template>
