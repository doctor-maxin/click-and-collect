<script setup lang="ts">
import {
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    VisuallyHidden,
} from "reka-ui";
import { useEventListener } from "@vueuse/core";
import PopularProducts from "./popular-products.vue";
import SearchInput from "./search-input.vue";

const isOpen = ref(false);
const headerOffset = ref(0);
const route = useRoute();

const updateHeaderOffset = () => {
    if (!import.meta.client) return;

    const header = document.querySelector(".ui-header");
    if (!(header instanceof HTMLElement)) {
        headerOffset.value = 0;
        return;
    }

    headerOffset.value = header.offsetHeight;
};

const openSearch = async () => {
    isOpen.value = true;
    await nextTick();
    updateHeaderOffset();
};

const closeSearch = () => {
    isOpen.value = false;
};

const toggleSearch = async () => {
    if (isOpen.value) {
        closeSearch();
        return;
    }

    await openSearch();
};

onMounted(() => {
    updateHeaderOffset();
});

watch(
    () => route.fullPath,
    () => {
        closeSearch();
        nextTick(updateHeaderOffset);
    },
    {
        immediate: true,
    },
);

watch(isOpen, async (open) => {
    if (!open) return;

    await nextTick();
    updateHeaderOffset();
});

useEventListener(import.meta.client ? window : undefined, "resize", () => {
    if (!isOpen.value) return;
    updateHeaderOffset();
});

useEventListener(import.meta.client ? window : undefined, "scroll", () => {
    if (!isOpen.value) return;
    updateHeaderOffset();
});
</script>
<template>
    <DialogRoot v-model:open="isOpen">
        <div class="relative z-20">
            <button type="button" class="cursor-pointer" @click="toggleSearch">
                <SvgoClose v-if="isOpen" filled class="text-2xl" />
                <SvgoSearch v-else filled class="text-2xl" />
            </button>
        </div>

        <DialogPortal>
            <DialogOverlay
                class="search-dialog-overlay fixed inset-0 z-[25] bg-white"
            />
            <DialogContent
                class="search-dialog fixed inset-x-0 bottom-0 z-[26] overflow-y-auto box-border py-6 lg:py-9 bg-white outline-none"
                :style="{ top: `${headerOffset}px` }"
            >
                <VisuallyHidden as-child>
                    <DialogTitle>Поиск</DialogTitle>
                </VisuallyHidden>
                <VisuallyHidden as-child>
                    <DialogDescription>
                        Поиск по каталогу и популярным товарам
                    </DialogDescription>
                </VisuallyHidden>
                <div
                    class="container px-4 grid grid-cols-1 lg:grid-cols-2 gap-4 mx-auto"
                >
                    <div class="order-1 lg:order-2 lg:pl-[7.75rem]">
                        <SearchInput @close="closeSearch" />
                    </div>
                    <div class="order-2 lg:order-1">
                        <PopularProducts @close="closeSearch" />
                    </div>
                </div>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>
