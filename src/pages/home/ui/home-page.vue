<script setup lang="ts">
import { getHomePage } from "../api/get-home-page";
import { WidgetRenderBlocks } from "@/widgets/render-blocks";
const { data: homePage, error } = await useAsyncData("home-page", () =>
    getHomePage(),
);
</script>
<template>
    <div class="pt-[8.125rem]">
        <h1 class="hidden">{{ homePage?.data.H1 }}</h1>
        <WidgetRenderBlocks :content="homePage?.data.content" />
        <pre>
            {{ homePage }}
        </pre>
    </div>
</template>
