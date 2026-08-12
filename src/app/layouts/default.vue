<script setup lang="ts">
import { WidgetHeader } from "~/widgets/header";
import { WidgetFooter } from "~/widgets/footer";
import { WidgetTouchBar } from "~/widgets/touch-bar";
import { WidgetScrollUp } from "~/widgets/scroll-up";
import { WidgetCookieBanner } from "~/widgets/cookie-banner";
import { FeatureCartDrawer } from "~/features/cart";
import { FeatureAuthDrawer } from "~/features/auth";
import { useAsyncData } from "#app";
import { toAbsoluteSiteUrl } from "#shared/lib/site-url";
import euclidRegularUrl from "~/app/assets/fonts/euclid-woff2/Euclid Circular B Regular.woff2?url";
import euclidSemiBoldUrl from "~/app/assets/fonts/euclid-woff2/Euclid Circular B SemiBold.woff2?url";
import AnnouncementBar from "~/widgets/render-blocks/ui/blocks/announcement-bar/ui/announcement-bar.vue";

useHead({
  link: [
    {
      rel: "preload",
      href: euclidRegularUrl,
      as: "font",
      type: "font/woff2",
      crossorigin: "anonymous",
    },
    {
      rel: "preload",
      href: euclidSemiBoldUrl,
      as: "font",
      type: "font/woff2",
      crossorigin: "anonymous",
    },
  ],
});

const client = useMedusaClient();
const searchClient = useSearchClient();
const filtersStore = useFiltersStore();
const siteConfig = useSiteConfig();

const { data: config } = await useAsyncData("config", () => GqlGetConfig());
filtersStore.setCatalogSettings(config.value?.config?.catalogSettings);

const organizationSeo = computed(() => config.value?.config);
const organizationImage = computed(() => {
  const image = organizationSeo.value?.ogImage?.url;
  return image ? toAbsoluteSiteUrl(siteConfig.url, image) : undefined;
});

useSeoMeta({
  title: () => organizationSeo.value?.seoTitle || siteConfig.name,
  description: () => organizationSeo.value?.seoDescription || undefined,
  ogTitle: () => organizationSeo.value?.seoTitle || siteConfig.name,
  ogDescription: () => organizationSeo.value?.seoDescription || undefined,
  ogImage: () => organizationImage.value,
  twitterCard: "summary_large_image",
  twitterTitle: () => organizationSeo.value?.seoTitle || siteConfig.name,
  twitterDescription: () => organizationSeo.value?.seoDescription || undefined,
  twitterImage: () => organizationImage.value,
});

useSchemaOrg([
  defineOrganization({
    name: () => siteConfig.name,
    url: () => siteConfig.url,
    description: () => organizationSeo.value?.seoDescription || undefined,
    image: () => organizationImage.value,
    email: () => organizationSeo.value?.email || undefined,
    telephone: () => organizationSeo.value?.phone || undefined,
    address: () =>
      organizationSeo.value?.address
        ? {
            "@type": "PostalAddress",
            streetAddress: organizationSeo.value.address,
          }
        : undefined,
    contactPoint: () =>
      organizationSeo.value?.contactPoint
        ? {
            "@type": "ContactPoint",
            name: organizationSeo.value.contactPoint,
            email: organizationSeo.value.email || undefined,
            telephone: organizationSeo.value.phone || undefined,
          }
        : undefined,
  }),
]);
await useAsyncData(
  "available-categories",
  () =>
    searchClient.index("categories").search(null, {
      filter: "products > 0",
      limit: 1000,
      attributesToRetrieve: ["id"],
    }),
  {
    transform: (r) => r.hits?.map((c) => c.id),
  },
);
await useAsyncData("region", () => client.store.region.list(), {
  transform: (r) => r.regions?.[0],
});

await useAsyncData("categories", () =>
  client.store.category
    .list({
      include_descendants_tree: true,
      parent_category_id: "null",
    })
    .then((r) => r.product_categories),
);
</script>

<template>
  <div class="flex layout flex-col min-h-screen w-full pb-[calc(4.5rem_+_env(safe-area-inset-bottom,0px))] lg:pb-0">
      <AnnouncementBar class="hidden! lg:block lg:py-2!" :data="{text: 'Большая распродажа школьной коллекции до -70%', textColor: '#ffffff', isRunning: true, bgColor: '#ffa32d'}" />
    <KeepAlive>
      <WidgetHeader />
    </KeepAlive>

    <NuxtPage
      class="flex-1"
      :keepalive="{
        include: ['CatalogRoutePage', 'index'],
        max: 10,
      }"
    />
    <KeepAlive>
      <WidgetFooter />
    </KeepAlive>

    <WidgetTouchBar />
    <FeatureCartDrawer />
    <FeatureAuthDrawer />
    <WidgetScrollUp />
    <WidgetCookieBanner />
  </div>
</template>
