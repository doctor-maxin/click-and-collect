<script setup lang="ts">
import { useProductStore } from "../lib/product-store";
import { PRODUCT_CHARACTERISTICS_MAP } from "../lib/product-characteristics-map";
import { normalizeProductCharacteristicValue } from "../lib/product-characteristic-value";
import ProductColorPicker from "./product-color-picker.vue";
import ProductSizePicker from "./product-size-picker.vue";
import ProductCharacteristicsDrawer from "./product-characteristics-drawer.vue";
import {
    ProductDisplayTagBadge,
    ProductPriceTags,
} from "~/features/product-display-tags";
import {
    getDefaultProductDisplayTags,
    normalizeProductDisplayTags,
} from "#shared/types/product-display-tag";
import {
    type FavoriteProductSnapshot,
    FeatureFavoriteToggle,
    resolveFavoriteProductImage,
} from "~/features/favorites";
import { FeatureAddToCart } from "~/features/cart";

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
const favoriteProduct = computed<FavoriteProductSnapshot | null>(() => {
    const currentProduct = product.value;
    if (!currentProduct) return null;

    return {
        id: currentProduct.id,
        image: resolveFavoriteProductImage(
            currentProduct.images,
            currentProduct.thumbnail,
            variant.value?.metadata?.color,
        ),
        title:
            typeof productTitle.value === "string"
                ? productTitle.value
                : currentProduct.title ?? null,
        sku: sku.value ?? null,
        price: typeof price.value === "number" ? price.value : null,
        link: `/products/${currentProduct.handle}?variant=${variant.value?.id}`,
    };
});
const displayTags = computed(() => [
    ...normalizeProductDisplayTags(product.value?.product_display_tags),
    ...getDefaultProductDisplayTags(
        product.value?.metadata?.productType,
    ),
]);
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

const description = computed(() => {
    const variantDescription = variant.value?.metadata?.description as
        | string
        | undefined;
    const productDescription = product.value?.description;
    const metadataDescription = product.value?.metadata?.description as
        | string
        | undefined;

    return (
        variantDescription?.trim() ||
        productDescription?.trim() ||
        metadataDescription?.trim() ||
        null
    );
});

const hasCharacteristics = computed(() => {
    const metadata = {
        ...(product.value?.metadata ?? {}),
        ...(variant.value?.metadata ?? {}),
    } as Record<string, unknown>;

    return PRODUCT_CHARACTERISTICS_MAP.some(({ key }) =>
        Boolean(normalizeProductCharacteristicValue(metadata[key])),
    );
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
    const selectedVariant = variant.value;
    if (!selectedVariant) return false;

    return Boolean(
        !selectedVariant.manage_inventory ||
            selectedVariant.allow_backorder ||
            (selectedVariant.inventory_quantity ?? 0) > 0,
    );
});

const availabilityMessage = computed(() => {
    if (!variant.value) return "Выберите вариант товара";

    return "Товара нет в наличии";
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
        <div class="mb-3 flex items-center gap-4 lg:mb-4">
            <h1
                class="text-base md:text-[1.25rem] font-medium leading-5 lg:leading-6 uppercase"
            >
                {{ productTitle }}
            </h1>
            <ClientOnly>
                <FeatureFavoriteToggle
                    v-if="favoriteProduct"
                    :product="favoriteProduct"
                    class="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-black transition-colors hover:bg-black hover:text-white"
                    icon-class="mb-0! text-2xl"
                />
                <template #fallback>
                    <span
                        class="flex size-10 shrink-0 items-center justify-center rounded-full text-black"
                    >
                        <SvgoHeart
                            aria-hidden="true"
                            filled
                            class="mb-0! text-2xl"
                        />
                    </span>
                </template>
            </ClientOnly>
        </div>
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
        <FeatureAddToCart
            v-if="isAvailableProduct && product"
            :product="product"
            :variant="variant"
            quantity-controls-only-in-cart
            class="my-6 w-full"
        />
        <span
            v-if="!isAvailableProduct"
            class="text-base leading-5 leading-6 my-3 block"
            >{{ availabilityMessage }}</span
        >
        <span class="text-gray block text-base leading-5"
            >Данная цена может отличаться от цены в магазинах и на
            маркетплейсах</span
        >
        <div v-if="description" class="my-5">
            <h2 class="text-xl font-medium mb-5">Описание:</h2>
            <div
                class="whitespace-pre-line text-base leading-6"
            >
                {{ description }}
            </div>
        </div>

        <div
            v-if="hasCharacteristics"
            class="my-6 flex flex-col gap-4"
        >
            <ProductCharacteristicsDrawer v-if="hasCharacteristics" />
        </div>
        <div
            v-if="marketplaces?.length"
            class="my-6 gap-6 w-full flex flex-col"
        >
            <template v-for="item of marketplaces" :key="item.provider">
                <UiButton
                    is-link
                    :to="item.link"
                    target="_blank"
                    class="max-w-70 bg-[#9410A8]! text-white! border-none!"
                    variant="outline"
                    >Купить на сайте партнера</UiButton
                >
            </template>
        </div>
    </div>
</template>
