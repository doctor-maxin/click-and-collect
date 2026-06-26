<script setup lang="ts">
import ProductBreadCrumbs from "./product-bread-crumbs.vue";
import ProductMedia from "./product-media.vue";
import ProductInfo from "./product-info.vue";
import type { StoreProductCategory } from "@medusajs/types";
import { useProductStore } from "../lib/product-store";
import { useRecentlyViewedStore } from "~/features/recently-viewed";
import {
    hasMeaningfulQueryValue,
    INDEXABLE_ROBOTS,
    NOINDEX_FOLLOW_ROBOTS,
} from "#shared/lib/seo";
import { resolveSeoMeta, truncateDescription } from "#shared/lib/seo-meta";
import { toAbsoluteSiteUrl } from "#shared/lib/site-url";
import { WidgetRecentlyViewed } from "~/widgets/recently-viewed";

const route = useRoute();
const client = useMedusaClient();
const productStore = useProductStore();
const recentlyViewedStore = useRecentlyViewedStore();
const { variant, price } = storeToRefs(productStore);
const siteConfig = useSiteConfig();
const canonicalPath = computed(
    () => `/products/${route.params.handle as string}`,
);
const canonicalUrl = computed(() =>
    toAbsoluteSiteUrl(siteConfig.url, canonicalPath.value),
);
const isIndexableProductPage = computed(
    () =>
        !Object.entries(route.query).some(([key, value]) => {
            if (key === "variant") return hasMeaningfulQueryValue(value);
            return hasMeaningfulQueryValue(value);
        }),
);

if (!route.params.handle || route.params.handle === "undefined")
    throw createError({
        message: "Товар не найден",
        statusCode: 404,
        fatal: true,
        data: route.params,
    });

const { data: product, error } = await useAsyncData(
    () => route.params.handle as string,
    () =>
        client.store.product.list({
            handle: route.params.handle as string,
            fields: "title,handle,description,variants.*,thumbnail,images.url,images.metadata,external_id,categories.*,metadata,options.*,options.values.*,variants.options.*,+variants.inventory_quantity",
        }),
    {
        transform: (r) => r.products?.[0],
        watch: [() => route.params.handle as string],
    },
);
if (!product.value)
    throw createError({
        message: "Товар не найден",
        statusCode: 404,
        fatal: true,
        data: product.value,
    });

const { data: product_categories } =
    useNuxtData<StoreProductCategory[]>("categories");

const findCategoryPath = (
    categories: StoreProductCategory[],
    targetId: string,
    trail: StoreProductCategory[] = [],
): StoreProductCategory[] | null => {
    for (const category of categories) {
        const nextTrail = [...trail, category];
        if (category.id === targetId) return nextTrail;

        const childPath = findCategoryPath(
            category.category_children ?? [],
            targetId,
            nextTrail,
        );
        if (childPath) return childPath;
    }

    return null;
};

const productMeta = computed(() =>
    resolveSeoMeta({
        canonical: canonicalUrl.value,
        title: product.value?.title
            ? `${product.value.title} - купить в ${siteConfig.name}`
            : siteConfig.name,
        description: truncateDescription(
            product.value?.title
                ? `Купить ${product.value.title} в интернет-магазине ${siteConfig.name}. Актуальные цены, описание, характеристики и удобная доставка.`
                : product.value?.description,
        ),
        image: product.value?.images?.[0]?.url,
        robots: isIndexableProductPage.value
            ? INDEXABLE_ROBOTS
            : NOINDEX_FOLLOW_ROBOTS,
    }),
);

const productTitle = computed(
    () =>
        (variant.value?.metadata?.name as string | undefined) ??
        product.value?.title,
);

const sku = computed(() => {
    if (variant.value?.sku?.includes("-")) {
        return variant.value.sku.split("-").slice(2, -1).join("-");
    }

    return variant.value?.sku;
});

const isAvailable = computed(() => {
    if (!variant.value) return false;

    return Boolean(
        variant.value.manage_inventory &&
        !variant.value.allow_backorder &&
        variant.value.inventory_quantity > 0,
    );
});

const breadcrumbItems = computed(() => {
    const list: Array<{ item: string; name: string }> = [
        {
            item: toAbsoluteSiteUrl(siteConfig.url, "/"),
            name: "Главная",
        },
    ];

    if (!product.value?.categories?.[0] || !product_categories.value) {
        list.push({
            item: canonicalUrl.value,
            name: productTitle.value || "Товар",
        });

        return list;
    }

    const menuRoot = product_categories.value.find(
        (category) => category.handle === "menu",
    );
    if (!menuRoot) return list;

    let largestPath: StoreProductCategory[] = [];
    for (const category of product.value.categories ?? []) {
        const pathInMenu = findCategoryPath(
            menuRoot.category_children ?? [],
            category.id,
        );
        if (pathInMenu && pathInMenu.length > largestPath.length) {
            largestPath = pathInMenu;
        }
    }

    for (const category of largestPath) {
        if (!category.parent_category_id) continue;
        list.push({
            item: toAbsoluteSiteUrl(
                siteConfig.url,
                `/catalog/${category.handle}`,
            ),
            name: category.name,
        });
    }

    list.push({
        item: canonicalUrl.value,
        name: productTitle.value || "Товар",
    });

    return list;
});

// useHead(() => ({
//     link: [
//         {
//             rel: "canonical",
//             href: productMeta.value.canonical,
//         },
//     ],
// }));

// useSeoMeta({
//     title: () => productMeta.value.title,
//     description: () => productMeta.value.description,
//     robots: () => productMeta.value.robots,
//     ogTitle: () => productMeta.value.ogTitle,
//     ogDescription: () => productMeta.value.ogDescription,
//     ogUrl: () => productMeta.value.ogUrl,
//     ogType: "product",
//     ogImage: () => productMeta.value.ogImage,
//     twitterCard: "summary_large_image",
//     twitterTitle: () => productMeta.value.ogTitle,
//     twitterDescription: () => productMeta.value.ogDescription,
//     twitterImage: () => productMeta.value.ogImage,
// });

// useSchemaOrg([
//     defineBreadcrumb({
//         itemListElement: () =>
//             breadcrumbItems.value.map((item, index) => ({
//                 "@type": "ListItem",
//                 position: index + 1,
//                 name: item.name,
//                 item: item.item,
//             })),
//     }),
//     defineProduct({
//         name: () => productTitle.value,
//         description: () => product.value?.description,
//         image: () =>
//             product.value?.images
//                 ?.map((image) => image.url)
//                 .filter((image): image is string => Boolean(image)) ?? [],
//         sku: () => sku.value,
//         brand: () => ({
//             "@type": "Brand",
//             name: siteConfig.name,
//         }),
//         url: () => productMeta.value.canonical,
//         offers: () =>
//             typeof price.value === "number"
//                 ? {
//                       "@type": "Offer",
//                       price: price.value,
//                       priceCurrency: "RUB",
//                       availability: isAvailable.value
//                           ? "https://schema.org/InStock"
//                           : "https://schema.org/OutOfStock",
//                       url: productMeta.value.canonical,
//                   }
//                 : undefined,
//     }),
// ]);

productStore.setProduct(product.value);

onMounted(() => {
    if (!product.value) return;
    recentlyViewedStore.addProduct(product.value);
});

watch(
    () => route.query?.variant,
    () => {
        if (route.query.variant && product.value?.variants) {
            const id = route.query.variant as string;
            const variant = product.value.variants.find((v) => v.id === id);
            if (variant) productStore.setVariant(variant);
        } else if (product.value?.variants?.[0]) {
            productStore.setVariant(product.value.variants[0]);
        }
    },
    {
        deep: true,
        immediate: true,
    },
);

watch(
    variant,
    async (value) => {
        if (!value) return;
        const { price, compare_at_price, discount } =
            await client.client.fetch<{
                price: number;
                compare_at_price: number;
                discount: number;
                code: number;
            }>(`/store/variants/${value.id}/price`);
        productStore.setPrice(price);
        if (compare_at_price) productStore.setOldPrice(compare_at_price);
        if (discount) productStore.setDiscount(discount);
    },
    {
        deep: true,
        immediate: true,
    },
);
</script>
<template>
    <div v-if="product" class="mt-16 lg:mt-32.5">
        <div class="container px-4 mx-auto">
            <ProductBreadCrumbs :product="product" />
            <div class="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-2">
                <ProductMedia class="" :product="product" />
                <ProductInfo class="lg:max-w-106" :product="product" />
            </div>
            <ClientOnly>
                <WidgetRecentlyViewed :current-product-id="product.id" />
            </ClientOnly>
        </div>
    </div>
</template>
