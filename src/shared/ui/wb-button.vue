<script setup lang="ts">
import { SvgoWb } from "#components";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "reka-ui";

defineProps<{
    item: {
        provider: string;
        link: string;
    };
}>();

const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    isPopoverOpen.value = true;
    setTimeout(() => {
        isPopoverOpen.value = false;
    }, 2000);
};
const isPopoverOpen = ref(false);
</script>
<template>
    <a :href="item.link" class="text-[hsla(274,98%,61%,1)]" target="_blank">
        <span class="flex text-xl leading-6 uppercase font-medium"
            >Купить на сайте партнера</span
        >
    </a>
</template>
