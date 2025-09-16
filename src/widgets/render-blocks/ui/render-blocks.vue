<script setup lang="ts">
import type { IUiBlocks, IUiBlock } from "../model/render-blocks.model";
import CarouselBlock from "./blocks/carousel";
import AnnouncementBarBlock from "./blocks/announcement-bar";
import ThematicsBlock from "./blocks/thematics";
import DepartmentsBlock from "./blocks/departments";
import BannersBlock from "./blocks/banners";
import SubscriptionForm from "./blocks/subscription-form";
import MapBlock from "./blocks/map";

defineProps<{
    content: IUiBlocks;
}>();

function getBlock(componentName: IUiBlock["__typename"]): any {
    switch (componentName) {
        case "ComponentBlocksCarousel":
            return CarouselBlock;
        case "ComponentBlocksAnnouncementBar":
            return AnnouncementBarBlock;
        case "ComponentBlocksTemy":
            return ThematicsBlock;
        case "ComponentBlocksDepartments":
            return DepartmentsBlock;
        case "ComponentBlocksBanners":
            return BannersBlock;
        case "ComponentBlocksSubscriptionForm":
            return SubscriptionForm;
        case "ComponentSharedMap":
            return MapBlock;
        default:
            null;
    }
}
</script>
<template>
    <template v-for="block in content" :key="block.id + block.__typename">
        <component :is="getBlock(block.__typename)" :data="block" />
    </template>
</template>
