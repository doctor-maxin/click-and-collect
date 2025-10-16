<script setup lang="ts">
import { WidgetHeader } from "@/widgets/header";
import { WidgetFooter } from "@/widgets/footer";
import { WidgetScrollUp } from "@/widgets/scroll-up";
import { WidgetCookieBanner } from "@/widgets/cookie-banner";
import { useAsyncData } from "#app";

const client = useMedusaClient();
const searchClient = useSearchClient();

await useAsyncData("config", () => GqlGetConfig());
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
        <WidgetHeader />
        <NuxtPage class="flex-1" />
        <WidgetFooter />
        <WidgetScrollUp />
        <WidgetCookieBanner />
    </div>
</template>
