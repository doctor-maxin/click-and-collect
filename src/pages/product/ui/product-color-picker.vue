<script setup lang="ts">
import type {
    StoreProduct,
    StoreProductImage,
    StoreProductOptionValue,
    StoreProductVariant,
} from "@medusajs/types";
import type { SearchProductDocument } from "~/shared/types/search-product-document";
import { useProductStore } from "../lib/product-store";

const productStore = useProductStore();
const { product, color, size, variant } = storeToRefs(productStore);
const searchClient = useSearchClient();
const router = useRouter();
const route = useRoute();
const appConfig = useAppConfig();
const isS3 = computed(() => appConfig.provider === "s3");
const img = useImage();

function normalizeValue(value?: string | null) {
    return value?.trim().toLowerCase() ?? "";
}

function escapeFilterValue(value: string) {
    return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function getProductModel(item?: StoreProduct | SearchProductDocument | null) {
    return (
        (item?.metadata?.model as string | undefined) ??
        ("model" in (item ?? {}) ? item?.model : undefined) ??
        null
    );
}

function getVariantColor(product: StoreProduct | SearchProductDocument) {
    return product.variants?.[0]?.metadata?.color as string | undefined;
}

function getOptionColor(product: StoreProduct | SearchProductDocument) {
    return product.options?.find(
        (option) => option.title?.toLowerCase() === "color",
    )?.values?.[0]?.value;
}

function getDisplayColor(product: StoreProduct | SearchProductDocument) {
    return (
        (product.variants?.[0]?.metadata?.colorTranslation as
            | string
            | undefined) ??
        getVariantColor(product) ??
        getOptionColor(product) ??
        null
    );
}

function getProductImage(product: StoreProduct | SearchProductDocument) {
    const variantColor = normalizeValue(getVariantColor(product));
    const imageByColor = product.images?.find(
        (image) =>
            normalizeValue(image.metadata?.color as string | undefined) ===
            variantColor,
    );

    return imageByColor ?? product.images?.[0] ?? null;
}

function formatImageUrl(image?: StoreProductImage | null) {
    if (!image?.url?.trim()) {
        return "/not_found.png";
    }

    return isS3.value
        ? img(
              image.url,
              { width: 168 },
              {
                  // @ts-ignore custom provider
                  provider: "customS3",
              },
          )
        : image.url;
}

const currentModel = computed(() => getProductModel(product.value));
const currentColorKey = computed(() =>
    normalizeValue(getDisplayColor(product.value)),
);

const { data: siblingProductsResponse } = await useAsyncData(
    () => `product-colors-${currentModel.value ?? route.params.handle}`,
    async () => {
        if (!currentModel.value) {
            return [product.value].filter(Boolean) as SearchProductDocument[];
        }

        const response = await searchClient
            .index("cards")
            .search<SearchProductDocument>(null, {
                filter: [
                    `metadata.model = "${escapeFilterValue(currentModel.value)}"`,
                ],
                distinct: "id",
                hitsPerPage: 100,
            });

        return response.hits ?? [];
    },
    {
        watch: [currentModel, () => route.params.handle],
    },
);

const colorItems = computed(() => {
    const source = siblingProductsResponse.value?.length
        ? siblingProductsResponse.value
        : ([product.value].filter(Boolean) as SearchProductDocument[]);

    const deduped = new Map<string, SearchProductDocument>();

    for (const item of source) {
        const key =
            normalizeValue(getDisplayColor(item)) || item.handle || item.id;
        if (!deduped.has(key)) {
            deduped.set(key, item);
        }
    }

    return Array.from(deduped.values());
});

function findMatchingVariant(
    targetProduct: SearchProductDocument,
    selectedSize: StoreProductOptionValue | null,
) {
    if (!selectedSize) {
        return targetProduct.variants?.[0] ?? null;
    }

    return (
        targetProduct.variants?.find((productVariant) =>
            productVariant.options?.some(
                (option) =>
                    option.option?.title?.toLowerCase() === "size" &&
                    option.value === selectedSize.value,
            ),
        ) ??
        targetProduct.variants?.[0] ??
        null
    );
}

function goToProductColor(targetProduct: SearchProductDocument) {
    if (
        !targetProduct.handle ||
        targetProduct.handle === product.value?.handle
    ) {
        return;
    }

    const nextVariant = findMatchingVariant(targetProduct, size.value);

    router.push({
        path: `/products/${targetProduct.handle}`,
        query: nextVariant?.id ? { variant: nextVariant.id } : {},
    });
}
</script>

<template>
    <div class="flex my-4 lg:my-6 flex-col gap-5 lg:gap-4">
        <span>
            Цвет:
            <span class="capitalize">
                {{
                    variant?.metadata?.colorTranslation ??
                    color?.value ??
                    getDisplayColor(product)
                }}
            </span>
        </span>
        <div class="flex overflow-x-auto gap-3 w-full">
            <article
                v-for="item of colorItems"
                :key="item.id"
                class="cursor-pointer transition-opacity opacity-100 border-[3px] rounded-lg overflow-hidden"
                @click="goToProductColor(item)"
                :class="{
                    'border-blue':
                        normalizeValue(getDisplayColor(item)) ===
                        currentColorKey,
                    'border-transparent hover:opacity-70':
                        normalizeValue(getDisplayColor(item)) !==
                        currentColorKey,
                }"
            >
                <img
                    class="aspect-23/28 object-cover max-w-23"
                    :src="formatImageUrl(getProductImage(item))"
                    :alt="`Изображение товара ${getDisplayColor(item) ?? item.title}`"
                />
            </article>
        </div>
    </div>
</template>
