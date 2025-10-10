<script setup lang="ts">
import { getHomePage } from "../api/get-home-page";
import { WidgetRenderBlocks } from "@/widgets/render-blocks";
const { data: homePage, error } = await useAsyncData("home-page", () =>
  getHomePage(),
);
</script>
<template>
  <div class="home-page">
    <h1 class="hidden">{{ homePage?.H1 }}</h1>
    <WidgetRenderBlocks v-if="homePage" :content="homePage?.content" />
  </div>
</template>
