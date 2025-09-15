<script setup lang="ts">
import { getHomePage } from "../api/get-home-page";
import { WidgetRenderBlocks } from "@/widgets/render-blocks";
const { data: homePage, error } = await useAsyncData("home-page", () =>
    getHomePage(),
);
console.log(homePage.value);
</script>
<template>
    <div class="">
        <h1 class="hidden">{{ homePage?.data.H1 }}</h1>
        <WidgetRenderBlocks v-if="homePage" :content="homePage?.data.content" />
    </div>
</template>
