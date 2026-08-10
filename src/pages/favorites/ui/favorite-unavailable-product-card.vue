<script setup lang="ts">
import type { FavoriteProductSnapshot } from "~/features/favorites";
import { FeatureFavoriteToggle } from "~/features/favorites";
import ProductImage from "~/widgets/products-grid/ui/product-image.vue";

defineProps<{
    product: FavoriteProductSnapshot;
}>();

const formatPrice = (price: number) =>
    price.toLocaleString("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
</script>

<template>
    <article class="flex w-full flex-col gap-2 lg:gap-4">
        <div class="relative aspect-15/18 overflow-hidden bg-gray/10">
            <ProductImage
                class="size-full object-cover object-center opacity-55"
                :src="product.image ?? '/not_found.png'"
                :alt="product.title ?? 'Товар недоступен'"
            />
            <div class="absolute inset-0 flex items-center justify-center p-4">
                <span
                    class="bg-white/50 w-full px-3 py-2 text-center text-xs font-medium uppercase text-black lg:text-base"
                >
                    Товар недоступен
                </span>
            </div>
            <ClientOnly>
                <FeatureFavoriteToggle
                    :product="product"
                    class="absolute right-2 top-2 z-10 flex size-6 cursor-pointer items-center justify-center rounded-full bg-white/90 text-black transition-colors hover:bg-white lg:size-10"
                    icon-class="!mb-0 text-sm! lg:text-xl!"
                />
            </ClientOnly>
        </div>
        <div class="flex flex-col gap-1.5">
            <div
                class="text-xs font-medium leading-4 uppercase lg:text-base lg:leading-6"
            >
                {{ product.title ?? "Товар" }}
            </div>
            <span v-if="product.sku" class="text-xs text-gray lg:text-sm">
                Арт. {{ product.sku }}
            </span>
            <span v-if="typeof product.price === 'number'" class="text-base lg:text-2xl">
                {{ formatPrice(product.price) }}
            </span>
        </div>
    </article>
</template>
