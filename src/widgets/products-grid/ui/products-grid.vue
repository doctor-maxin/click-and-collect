<script setup lang="ts">
import type { StoreProduct } from "@medusajs/types";
import { computed } from "vue";
import ProductSkeleton from "./product-skeleton.vue";
import ProductCard from "./product-card.vue";

const {
    products,
    isLoading = false,
    hasMore = false,
    currentPage = 1,
    totalPages = 1,
    emptyMessage = "",
} = defineProps<{
    products: StoreProduct[];
    isLoading?: boolean;
    hasMore?: boolean;
    currentPage?: number;
    totalPages?: number;
    emptyMessage?: string;
}>();

defineEmits<{
    (e: "load-more"): void;
    (e: "page-change", page: number): void;
}>();

const filtersStore = useFiltersStore();
const { appliedFilters } = storeToRefs(filtersStore);

const visiblePages = computed<(number | "...")[]>(() => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
        pages.push("...");
    }

    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }

    if (end < totalPages - 1) {
        pages.push("...");
    }

    pages.push(totalPages);

    return pages;
});
</script>
<template>
    <div v-if="products.length > 0 || isLoading">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ProductCard
                v-for="product of products"
                :key="product.id"
                :product="product"
            />

            <template v-if="isLoading">
                <template v-for="i in 16"> <ProductSkeleton /></template>
            </template>
        </div>
        <div v-if="hasMore" class="flex justify-center w-full my-9">
            <UiButton
                variant="outline"
                class="text-base cursor-pointer text-center h-8! lg:h-9!"
                @click="$emit('load-more')"
            >
                Показать больше
            </UiButton>
        </div>
        <div v-if="totalPages > 1" class="flex justify-center w-full my-9">
            <nav class="flex items-center gap-2">
                <UiButton
                    variant="outline"
                    class="text-base cursor-pointer text-center w-8 h-8! lg:h-9! min-w-8 lg:min-w-9 px-3! py-2! lg:w-9"
                    :disabled="currentPage <= 1"
                    @click="$emit('page-change', currentPage - 1)"
                >
                    <SvgoChevron
                        filled
                        class="min-w-4 lg:min-w-6 lg:text-2xl mb-0! rotate-180"
                    />
                </UiButton>
                <template
                    v-for="(page, idx) in visiblePages"
                    :key="`${page}-${idx}`"
                >
                    <span
                        v-if="page === '...'"
                        class="px-1 text-base text-gray-500"
                        >...</span
                    >
                    <UiButton
                        v-else
                        :variant="page === currentPage ? 'default' : 'outline'"
                        class="text-sm lg:text-base cursor-pointer text-center h-8! lg:h-9! min-w-8 lg:min-w-9 px-0! py-2! lg:w-9"
                        @click="$emit('page-change', Number(page))"
                    >
                        {{ page }}
                    </UiButton>
                </template>

                <UiButton
                    variant="outline"
                    class="text-base cursor-pointer text-center h-8! lg:h-9! min-w-8 w-8 px-3! py-2! lg:w-9"
                    :disabled="currentPage >= totalPages"
                    @click="$emit('page-change', currentPage + 1)"
                >
                    <SvgoChevron
                        filled
                        class="text-2xl mb-0! lg:min-w-6 min-w-4 scroll-mb-0"
                    />
                </UiButton>
            </nav>
        </div>
    </div>
    <div v-else class="py-24 flex w-full justify-center items-center">
        <span
            class="lg:text-[1.5rem] font-medium lg:leading-8 text-center whitespace-pre-line"
            >{{
                emptyMessage ||
                (Object.keys(appliedFilters).length > 0
                    ? "Нет товаров по указанным фильтрам"
                    : "Нет товаров")
            }}</span
        >
    </div>
</template>
