<script setup lang="ts">
import { StrapiBlocks, type BlocksContent } from "vue-strapi-blocks-renderer";
import { getContactPage } from "../api/get-stores-page";
import { FeatureRenderMedia } from "~/features/render-media";
import { resolveSeoMeta, toAbsoluteSiteUrl } from "#shared/lib";
import type { IGlobalConfig } from "#shared/types/config";

const { data: contactPage } = await useAsyncData("contact-page", () =>
    getContactPage(),
);

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
    ogType: () => contactMeta.value.ogType,
    ogImage: () => contactMeta.value.ogImage,
    twitterCard: "summary_large_image",
    twitterTitle: () => contactMeta.value.ogTitle,
    twitterDescription: () => contactMeta.value.ogDescription,
    twitterImage: () => contactMeta.value.ogImage,
});
</script>

<template>
    <main v-if="contactPage" class="pt-16 lg:pt-[8.125rem]">
        <section
            class="relative overflow-hidden"
            :style="{
                backgroundColor: contactPage.bgColor || undefined,
            }"
        >
            <FeatureRenderMedia
                v-if="contactPage.media"
                class="absolute inset-0 size-full opacity-25"
                :media="contactPage.media"
                :mobile-media="contactPage.mobileMedia ?? contactPage.media"
            />
            <div class="container relative mx-auto px-4 py-12 lg:py-20">
                <h1 class="font-serif text-2xl font-semibold uppercase lg:text-4xl">
                    {{ contactPage.title || "Контакты" }}
                </h1>
                <StrapiBlocks
                    v-if="headerContent"
                    class="content mt-6 max-w-2xl"
                    :content="headerContent"
                />
            </div>
        </section>
        <section class="container mx-auto grid gap-4 px-4 py-10 text-base lg:grid-cols-3 lg:py-16">
            <p v-if="config?.config.address">{{ config.config.address }}</p>
            <a v-if="config?.config.phone" :href="`tel:${config.config.phone}`">
                {{ config.config.phone }}
            </a>
            <a v-if="config?.config.email" :href="`mailto:${config.config.email}`">
                {{ config.config.email }}
            </a>
        </section>
        <section
            v-if="contactPage.showDiscount && contactPage.promocode"
            class="container mx-auto px-4 pb-10 text-center lg:pb-16"
        >
            <p :style="{ color: contactPage.promocodeColor || undefined }">
                {{ contactPage.promocode }}
            </p>
            <p
                v-if="contactPage.promocodeFooter"
                class="mt-2 text-gray"
                :style="{ color: contactPage.promocodeFooterColor || undefined }"
            >
                {{ contactPage.promocodeFooter }}
            </p>
        </section>
        <section v-if="footerContent" class="container content mx-auto px-4 pb-12 lg:pb-18">
            <StrapiBlocks :content="footerContent" />
        </section>
    </main>
</template>
