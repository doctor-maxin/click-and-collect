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
import type { SearchProductDocument } from "#shared/types/search-product-document";
import PopularProducts from "./popular-products.vue";
import QueryProducts from "./query-products.vue";
import SearchInput from "./search-input.vue";

const isOpen = ref(false);
const headerOffset = ref(0);
const route = useRoute();
const hasSearchQuery = ref(false);
const searchProducts = ref<SearchProductDocument[]>([]);

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
    hasSearchQuery.value = false;
    searchProducts.value = [];
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
    if (!open) {
        hasSearchQuery.value = false;
        searchProducts.value = [];
        return;
    }

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
        <div class="relative flex z-20">
            <button
                type="button"
                class="cursor-pointer"
                :aria-label="isOpen ? 'Закрыть поиск' : 'Открыть поиск'"
                :aria-expanded="isOpen"
                @click="toggleSearch"
            >
                <SvgoClose
                    v-if="isOpen"
                    aria-hidden="true"
                    filled
                    class="text-2xl mb-0!"
                />
                <SvgoSearch
                    v-else
                    aria-hidden="true"
                    filled
                    class="text-2xl mb-0!"
                />
            </button>
        </div>

        <DialogPortal>
            <DialogOverlay
                class="search-dialog-overlay fixed inset-0 z-30 bg-white"
            />
            <DialogContent
                class="search-dialog mobile-search-sheet fixed inset-x-0 bottom-[calc(4.5rem_+_env(safe-area-inset-bottom,0px))] z-70 box-border flex h-[calc(100dvh_-_4.5rem_-_env(safe-area-inset-bottom,0px))] flex-col overflow-hidden rounded-t-2xl bg-white py-4 outline-none sm:bottom-0 sm:block sm:h-auto sm:max-h-none sm:overflow-y-auto sm:rounded-none sm:py-6 lg:py-9"
                :style="{ '--search-header-offset': `${headerOffset}px` }"
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
                    class="container mx-auto flex min-h-0 flex-1 flex-col-reverse gap-4 px-4 sm:flex-col lg:grid lg:grid-cols-2"
                >
                    <div class="z-10 shrink-0 bg-white pt-2 lg:order-2 lg:pl-31 lg:pt-0">
                        <SearchInput
                            @close="closeSearch"
                            @query-change="hasSearchQuery = $event"
                            @products-change="searchProducts = $event"
                        />
                    </div>
                    <div
                        class="min-h-0 overflow-y-auto pb-2 lg:order-1 -mx-4 md:mx-0 "
                    >
                        <QueryProducts
                            v-if="hasSearchQuery"
                            :products="searchProducts"
                            @close="closeSearch"
                        />
                        <PopularProducts
                            v-else
                            compact-mobile
                            @close="closeSearch"
                        />
                    </div>
                </div>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>

<style scoped>
@media (width < 40rem) {
    .mobile-search-sheet[data-state="open"] {
        animation: bottomSheetIn 220ms ease-out;
    }

    .mobile-search-sheet[data-state="closed"] {
        animation: bottomSheetOut 180ms ease-in;
    }

    .mobile-search-sheet {
        top: auto !important;
    }
}

@media (width >= 40rem) {
    .mobile-search-sheet {
        top: var(--search-header-offset) !important;
    }
}
</style>
