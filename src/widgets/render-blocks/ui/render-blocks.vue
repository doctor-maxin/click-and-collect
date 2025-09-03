<script setup lang="ts">
import type { IUiBlocks } from "../model/render-blocks.model";
import CarouselBlock from "./blocks/carousel";
import AnnouncementBarBlock from "./blocks/announcement-bar";
import ThematicsBlock from "./blocks/thematics";
import DepartmentsBlock from "./blocks/departments";
import BannersBlock from "./blocks/banners";
import SubscriptionForm from "./blocks/subscription-form";

defineProps<{
    content: IUiBlocks;
}>();

function getBlock(componentName: string): any {
    switch (componentName) {
        case "blocks.carousel":
            return CarouselBlock;
        case "blocks.announcement-bar":
            return AnnouncementBarBlock;
        case "blocks.temy":
            return ThematicsBlock;
        case "blocks.departments":
            return DepartmentsBlock;
        case "blocks.banners":
            return BannersBlock;
        case "blocks.subscription-form":
            return SubscriptionForm;
        default:
            null;
    }
}
</script>
<template>
    <template v-for="block in content" :key="block.id">
        <component :is="getBlock(block.__component)" :data="block" />
    </template>
</template>
