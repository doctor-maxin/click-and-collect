<script setup lang="ts">
import { WidgetHeader } from "~/widgets/header";
import { WidgetFooter } from "~/widgets/footer";
import { WidgetScrollUp } from "~/widgets/scroll-up";
import { WidgetCookieBanner } from "~/widgets/cookie-banner";
import { useAsyncData } from "#app";
import euclidRegularUrl from "~/app/assets/fonts/euclid-woff2/Euclid Circular B Regular.woff2?url";
import euclidSemiBoldUrl from "~/app/assets/fonts/euclid-woff2/Euclid Circular B SemiBold.woff2?url";

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

const { data: config } = await useAsyncData("config", () => GqlGetConfig());
filtersStore.setCatalogSettings(config.value?.config?.catalogSettings);
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
  <div class="flex layout flex-col min-h-screen w-full pb-12 lg:pb-0">
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

    <WidgetScrollUp />
    <WidgetCookieBanner />
  </div>
</template>
