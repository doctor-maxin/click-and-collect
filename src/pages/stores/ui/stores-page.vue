<script setup lang="ts">
import { StrapiBlocks, type BlocksContent } from "vue-strapi-blocks-renderer";
import { getContactPage } from "../api/get-stores-page";
import { FeatureRenderMedia } from "~/features/render-media";
import { resolveSeoMeta, toAbsoluteSiteUrl } from "#shared/lib";
import type { IGlobalConfig } from "#shared/types/config";
import Map from "~/widgets/render-blocks/ui/blocks/map/ui/map.vue";

const { data: contactPage } = await useAsyncData("contact-page", () =>
    getContactPage(),
);
console.log(contactPage.value)
if (!contactPage.value) {
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
const { data: config } = useNuxtData<IGlobalConfig>("config");
const headerContent = computed(() =>
    Array.isArray(contactPage.value?.header)
        ? (contactPage.value.header as BlocksContent)
        : null,
);
const footerContent = computed(() =>
    Array.isArray(contactPage.value?.footer)
        ? (contactPage.value.footer as BlocksContent)
        : null,
);
const contactMeta = computed(() =>
    resolveSeoMeta({
        canonical: canonicalUrl.value,
        title: contactPage.value?.title
            ? `${contactPage.value.title} | ${siteConfig.name}`
            : `Контакты | ${siteConfig.name}`,
        image: contactPage.value?.media?.url,
        seo: contactPage.value?.seo,
    }),
);

useHead(() => ({
    link: [
        {
            rel: "canonical",
            href: contactMeta.value.canonical,
        },
    ],
}));

useSeoMeta({
    title: () => contactMeta.value.title,
    description: () => contactMeta.value.description,
    keywords: () => contactMeta.value.keywords,
    robots: () => contactMeta.value.robots,
    ogTitle: () => contactMeta.value.ogTitle,
    ogDescription: () => contactMeta.value.ogDescription,
    ogUrl: () => contactMeta.value.ogUrl,
    ogType: () => contactMeta.value?.ogType,
    ogImage: () => contactMeta.value.ogImage,
    twitterCard: "summary_large_image",
    twitterTitle: () => contactMeta.value.ogTitle,
    twitterDescription: () => contactMeta.value.ogDescription,
    twitterImage: () => contactMeta.value.ogImage,
});
</script>

<template>
    <main v-if="contactPage" class="">
        <div class="relative h-19 lg:h-62 overflow-hidden">
             <template v-if="contactPage.media?.url && !contactPage.bgColor">
                <FeatureRenderMedia
                    v-if="contactPage.media || contactPage.mobileMedia"
                    :media="contactPage.media"
                    :mobile-media="contactPage.mobileMedia"
                    loading="lazy"
                    class="h-full"
                />
                <div class="absolute inset-0 bg-black/25" aria-hidden="true" />
            </template>
             <div v-else-if="contactPage.bgColor" class="absolute inset-0" :style="{
                backgroundColor: contactPage.bgColor
            }" aria-hidden="true" />

            <h1
                class="absolute inset-0 z-1 flex items-center justify-center px-4 text-center text-base font-bold text-white lg:text-[2rem] lg:leading-tight"
            >
                {{ contactPage.title }}
            </h1>
        </div>

        <div v-if="contactPage.showDiscount" class="mt-5 text-balance lg:mt-8 gap-6 flex flex-col w-full justify-center items-center mb-10 mx-auto container ">
            <div class="text-center max-w-240">
                <StrapiBlocks :content="contactPage.header"  />
            </div>
            <div class="mx-4 lg:mx-auto rounded-2xl gap-1 text-center shadow flex flex-col w-fit min-w-71 justify-center text-white items-center px-11 py-6.5" :style="{
    'background-color': contactPage.promocodeColor ?? '#ed892c',
        color: contactPage.promocodeFooterColor || undefined
            }">
                <span class="text-[1.25rem] leading-6">ПРОМОКОД</span>
                <span class="font-semibold text-[2rem] leading-10">{{contactPage.promocode}}</span>
                <span


                class="text-base leading-4">{{contactPage.promocodeFooter}}</span>
            </div>
            <div class="text-sm  lg:text-base text-center text-[#929292] max-w-240">
                <StrapiBlocks :content="contactPage.footer"  />
            </div>
        </div>


        <Map :data="{showHeader: false}" />
    </main>
</template>
