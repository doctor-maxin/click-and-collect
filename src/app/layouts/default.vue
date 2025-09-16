<script setup lang="ts">
import { WidgetHeader } from "@/widgets/header";
import { WidgetFooter } from "@/widgets/footer";

await useAsyncData("config", () => GqlGetConfig());
</script>

<template>
    <div class="flex flex-col min-h-page w-full">
        <WidgetHeader />
        <NuxtPage class="flex-1" />
        <WidgetFooter />
    </div>
</template>
