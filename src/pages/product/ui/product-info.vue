<script setup lang="ts">
import type { StoreProduct } from "@medusajs/types";
import { useProductStore } from "../lib/product-store";
import { PRODUCT_CHARACTERISTICS_MAP } from "../lib/product-characteristics-map";
import ProductColorPicker from "./product-color-picker.vue";
import ProductSizePicker from "./product-size-picker.vue";
import ProductDescriptionDrawer from "./product-description-drawer.vue";
import ProductCharacteristicsDrawer from "./product-characteristics-drawer.vue";
import {
    ProductDisplayTagBadge,
    ProductPriceTags,
} from "~/features/product-display-tags";
import { normalizeProductDisplayTags } from "#shared/types/product-display-tag";
import { UiWbButton } from "#components";

const productStore = useProductStore();
const { product, variant, price, oldPrice, discount } =
    storeToRefs(productStore);
const router = useRouter();
const sku = computed(() => {
    if (variant.value?.sku?.includes("-")) {
        return variant.value?.sku?.split("-").slice(2, 4).join("-");
    }
    return variant.value?.sku;
});

const productTitle = computed(
    () => variant.value?.metadata?.name ?? product.value?.title,
);
const displayTags = computed(() =>
    normalizeProductDisplayTags(product.value?.product_display_tags),
);
const otherDisplayTags = computed(() =>
    displayTags.value.filter((tag) => tag.placement !== "under_price"),
);

const marketplaces = computed(
    () =>
        variant?.value?.metadata?.marketplaces as {
            link: string;
            provider: string;
        }[],
);

const hasDescription = computed(() => {
    const variantDescription = variant.value?.metadata?.description as
        | string
        | undefined;
    const productDescription = product.value?.description;
    const metadataDescription = product.value?.metadata?.description as
        | string
        | undefined;

    return Boolean(
        variantDescription?.trim() ||
        productDescription?.trim() ||
        metadataDescription?.trim(),
    );
});

const hasCharacteristics = computed(() => {
    const metadata = {
        ...(product.value?.metadata ?? {}),
        ...(variant.value?.metadata ?? {}),
    } as Record<string, unknown>;

    return PRODUCT_CHARACTERISTICS_MAP.some(({ key }) => {
        const value = metadata[key];
        if (
            typeof value !== "string" &&
            typeof value !== "number" &&
            typeof value !== "boolean"
        ) {
            return false;
        }

        return Boolean(String(value).trim());
    });
});

watch(
    variant,
    (v) => {
        if (!v) return;
        router.replace({
            query: {
                variant: v.id,
            },
        });
    },
    {
        deep: true,
    },
);

const isAvailableProduct = computed(() => {
    if (!marketplaces.value?.length) return false;
    return (
        variant.value?.manage_inventory &&
        !variant.value?.allow_backorder &&
        variant.value?.inventory_quantity > 0
    );
});
</script>
<template>
    <div class="w-full">
        <div
            v-if="displayTags.length"
            class="mb-3 flex flex-col gap-1.5 lg:mb-4"
        >
            <ProductPriceTags
                :tags="displayTags"
                class="flex-wrap gap-1.5"
            />
            <div
                v-if="otherDisplayTags.length"
                role="list"
                class="flex flex-wrap gap-1.5"
            >
                <ProductDisplayTagBadge
                    v-for="tag in otherDisplayTags"
                    :key="tag.id"
                    :tag="tag"
                />
            </div>
        </div>
        <h1
            class="text-base md:text-[1.25rem] font-medium leading-5 lg:leading-6 uppercase mb-3 lg:mb-4"
        >
            {{ productTitle }}
        </h1>
        <span
            class="text-base block mb-3 md:mb-4 lg:mb-6 leading-5 text-[hsl(216,64%,15%)]/50"
            >Арт. {{ sku }}</span
        >
        <div class="my-6 flex flex-col gap-2">
            <div class="flex items-center gap-4">
                <template v-if="oldPrice && price !== oldPrice">
                    <span
                        v-if="typeof price === 'number'"
                        class="text-red text-2xl font-medium"
                        >{{
                            price.toLocaleString("ru-RU", {
                                style: "currency",
                                currency: "RUB",
                                maximumFractionDigits: 0,
                            })
                        }}</span
                    >
                    <span
                        v-if="typeof oldPrice === 'number'"
                        class="text-2xl text-gray line-through"
                        >{{
                            oldPrice.toLocaleString("ru-RU", {
                                style: "currency",
                                currency: "RUB",
                                maximumFractionDigits: 0,
                            })
                        }}</span
                    >
                    <span
                        v-if="typeof discount === 'number'"
                        class="text-red text-2xl"
                        >-{{ discount }}%</span
                    >
                </template>
                <template v-else>
                    <span
                        v-if="typeof price === 'number'"
                        class="text-2xl font-medium"
                        >{{
                            price.toLocaleString("ru-RU", {
                                style: "currency",
                                currency: "RUB",
                                maximumFractionDigits: 0,
                            })
                        }}</span
                    >
                </template>
            </div>
        </div>
        <ProductColorPicker />
        <ProductSizePicker />
        <span
            v-if="!isAvailableProduct"
            class="text-base leading-5 leading-6 my-3 block"
            >Товар доступен только в розничных магазинах</span
        >
        <span class="text-gray block text-base leading-5"
            >Данная цена может отличаться от цены в магазинах и на
            маркетплейсах</span
        >
        <div
            v-if="hasDescription || hasCharacteristics"
            class="my-6 flex flex-col gap-4"
        >
            <ProductDescriptionDrawer v-if="hasDescription" />
            <ProductCharacteristicsDrawer v-if="hasCharacteristics" />
        </div>
        <div v-if="isAvailableProduct" class="my-6 gap-6 w-full flex flex-col">
            <template v-for="item of marketplaces" :key="item.provider">
                <UiButton
                    is-link
                    :to="item.link"
                    target="_blank"
                    class="max-w-70"
                    variant="outline"
                    >Купить на сайте партнера</UiButton
                >
            </template>
        </div>
    </div>
</template>
