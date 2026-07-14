<script setup lang="ts">
import { defineAsyncComponent, type Component } from "vue";
import type { IUiBlocks, IUiBlock } from "../model/render-blocks.model";

const props = defineProps<{
    content: IUiBlocks;
}>();

const blockComponents = {
    ComponentBlocksCarousel: defineAsyncComponent(() => import("./blocks/carousel")),
    ComponentBlocksAnnouncementBar: defineAsyncComponent(
        () => import("./blocks/announcement-bar"),
    ),
    ComponentBlocksTemy: defineAsyncComponent(() => import("./blocks/thematics")),
    ComponentBlocksDepartments: defineAsyncComponent(
        () => import("./blocks/departments"),
    ),
    ComponentBlocksBanners: defineAsyncComponent(() => import("./blocks/banners")),
    ComponentBlocksSubscriptionForm: defineAsyncComponent(
        () => import("./blocks/subscription-form"),
    ),
    ComponentBlocksProducts: defineAsyncComponent(() => import("./blocks/products")),
    ComponentBlocksProductCategories: defineAsyncComponent(
        () => import("./blocks/products"),
    ),
    ComponentSharedMap: defineAsyncComponent(() => import("./blocks/map")),
} satisfies Record<IUiBlock["__typename"], Component>;

function getBlock(componentName: IUiBlock["__typename"]): Component | null {
    return blockComponents[componentName] ?? null;
}

const supportedContent = computed(() =>
    props.content.filter((block) => Boolean(getBlock(block.__typename))),
);

const visibleCount = ref(supportedContent.value.length > 0 ? 1 : 0);

const visibleContent = computed(() =>
    supportedContent.value.slice(0, visibleCount.value),
);

const contentSignature = computed(() =>
    props.content
        .map((block) => `${block.id}:${block.__typename}`)
        .join("|"),
);

watch(
    contentSignature,
    () => {
        visibleCount.value = supportedContent.value.length > 0 ? 1 : 0;
    },
);

function showNextBlock(index: number) {
    if (index !== visibleCount.value - 1) return;
    if (visibleCount.value >= supportedContent.value.length) return;

    const showNext = () => {
        visibleCount.value += 1;
    };

    if (import.meta.client) {
        requestAnimationFrame(showNext);
        return;
    }

    showNext();
}
</script>
<template>
    <template
        v-for="(block, index) in visibleContent"
        :key="block.id + block.__typename"
    >
        <component
            :is="getBlock(block.__typename)"
            :data="block"
            @vue:mounted="showNextBlock(index)"
        />
    </template>
</template>
