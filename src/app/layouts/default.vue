<script setup lang="ts">
import { WidgetHeader } from "@/widgets/header";
import { WidgetFooter } from "@/widgets/footer";
import { WidgetScrollUp } from "@/widgets/scroll-up";

const client = useMedusaClient();

await useAsyncData("config", () => GqlGetConfig());
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
  <div class="flex flex-col min-h-page w-full pb-12 lg:pb-0">
    <WidgetHeader />
    <NuxtPage class="flex-1" />
    <WidgetFooter />
    <WidgetScrollUp />
  </div>
</template>
