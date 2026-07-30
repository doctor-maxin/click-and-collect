<script setup lang="ts">
import type { StoreProductCategory } from "@medusajs/types";
import type { SwiperContainer } from "swiper/element";
import type { SwiperOptions } from "swiper/types";
import type { ProductWithDisplayTags } from "#shared/types/product-display-tag";
import { normalizeProductWithDisplayTags } from "#shared/types/product-display-tag";
import { useKeepAliveSwiper } from "~/shared/lib/use-keep-alive-swiper";
import type {
    IProductCategoriesBlock,
    IProductsBlock,
} from "~/widgets/render-blocks";
import { ProductCard } from "~/widgets/products-grid";

const { data } = defineProps<{
    data: IProductsBlock | IProductCategoriesBlock;
}>();

const PRODUCT_FIELDS =
    "title,handle,description,variants.*,thumbnail,images.url,images.metadata,external_id,categories.*,metadata,options.*,options.values.*,variants.options.*,+variants.inventory_quantity,+variants.calculated_price,+product_display_tags.*";

type ProductGroup = {
    id: string;
    title: string;
    productIds: string[];
    categoryId?: string | null;
    categoryLink?: string | null;
};

function normalizeProductIds(
    productIds?: Array<string | number | null> | string | number | null,
) {
    const list = Array.isArray(productIds)
        ? productIds
        : typeof productIds === "string"
          ? productIds.split(",")
          : productIds
            ? [productIds]
            : [];

    return list.map((productId) => String(productId).trim()).filter(Boolean);
}

const blockId = computed(
    () => `products-${String(data.id).replace(/[^a-zA-Z0-9_-]/g, "-")}`,
);
const nextButtonClass = computed(() => `${blockId.value}-next`);
const prevButtonClass = computed(() => `${blockId.value}-prev`);
const containerRef = ref<SwiperContainer | null>(null);
const activeGroupId = ref("");
const { data: productCategories } =
    useNuxtData<StoreProductCategory[]>("categories");

function findCategoryByIdOrHandle(
    categoryId?: string | null,
    categories: StoreProductCategory[] = productCategories.value ?? [],
): StoreProductCategory | null {
    if (!categoryId) return null;

    for (const category of categories) {
        if (category.id === categoryId || category.handle === categoryId) {
            return category;
        }

        const found = findCategoryByIdOrHandle(
            categoryId,
            category.category_children ?? [],
        );
        if (found) return found;
    }

    return null;
}

function getCategoryLink(categoryId?: string | null) {
    const trimmedCategoryId = categoryId?.trim();
    if (!trimmedCategoryId) return null;

    const category = findCategoryByIdOrHandle(trimmedCategoryId);
    if (category?.handle) return `/catalog/${category.handle}`;

    // If CMS stores a handle in categoryId, keep the block usable.
    if (!trimmedCategoryId.startsWith("pcat_")) {
        return `/catalog/${trimmedCategoryId}`;
    }

    return null;
}

const groups = computed<ProductGroup[]>(() => {
    if (data.__typename === "ComponentBlocksProductCategories") {
        return (data.categories ?? [])
            .map((category, index) => {
                const categoryId = category.categoryId?.trim() ?? null;

                return {
                    id: [categoryId, category.id].join("-"),
                    title: category.title?.trim() || `Список ${index + 1}`,
                    productIds: normalizeProductIds(category.productIds),
                    categoryId,
                    categoryLink: getCategoryLink(categoryId),
                };
            })
            .filter((group) => group.productIds.length > 0);
    }

    const productIds = normalizeProductIds(data.productIds);
    if (!productIds.length) return [];

    return [
        {
            id: String(data.id),
            title: data.title?.trim() ?? "",
            productIds,
        },
    ];
});

const blockTitle = computed(() =>
    data.__typename === "ComponentBlocksProducts"
        ? data.title?.trim()
        : undefined,
);
const hasTabs = computed(
    () =>
        data.__typename === "ComponentBlocksProductCategories" &&
        groups.value.length > 1,
);
const activeGroup = computed(
    () =>
        groups.value.find((group) => group.id === activeGroupId.value) ??
        groups.value[0],
);
const allProductIds = computed(() => [
    ...new Set(groups.value.flatMap((group) => group.productIds)),
]);
const productIdsKey = computed(() => allProductIds.value.join(","));

watch(
    groups,
    (nextGroups) => {
        if (nextGroups.some((group) => group.id === activeGroupId.value)) {
            return;
        }

        activeGroupId.value = nextGroups[0]?.id ?? "";
    },
    { immediate: true },
);

const client = useMedusaClient();

const { data: products, status } = await useAsyncData(
    () => `${blockId.value}-${productIdsKey.value}`,
    async () => {
        if (!allProductIds.value.length) return [];

        const response = await client.store.product.list({
            id: allProductIds.value,
            limit: allProductIds.value.length,
            country_code: "ru",
            fields: PRODUCT_FIELDS,
        });

        return (response.products ?? []).map(normalizeProductWithDisplayTags);
    },
    {
        watch: [productIdsKey],
    },
);

const productsById = computed(() => {
    const map = new Map<string, ProductWithDisplayTags>();

    for (const product of products.value ?? []) {
        map.set(product.id, product);

        if (product.external_id) {
            map.set(product.external_id, product);
        }
    }

    return map;
});

const activeProducts = computed(() =>
    (activeGroup.value?.productIds ?? [])
        .map((productId) => productsById.value.get(productId))
        .filter((product): product is ProductWithDisplayTags =>
            Boolean(product),
        ),
);
const activeSlidesCount = computed(
    () =>
        activeProducts.value.length + (activeGroup.value?.categoryLink ? 1 : 0),
);
const shouldRenderBlock = computed(
    () => status.value === "pending" || activeProducts.value.length > 0,
);

const swiperOptions = {
    effect: "slide",
    slidesPerView: 2,
    spaceBetween: 16,
    watchOverflow: true,
    navigation: {
        enabled: true,
        nextEl: `.${nextButtonClass.value}`,
        prevEl: `.${prevButtonClass.value}`,
    },
    breakpoints: {
        1024: {
            slidesPerView: 4,
            spaceBetween: 16,
        },
    },
} satisfies SwiperOptions;

const swiper = useKeepAliveSwiper(containerRef, swiperOptions);

watch(
    [activeGroupId, activeProducts],
    async () => {
        await nextTick();
        swiper.instance.value?.slideTo(0, 0);
        swiper.instance.value?.update();
    },
    { flush: "post" },
);

function selectGroup(groupId: string) {
    activeGroupId.value = groupId;
}
</script>

<template>
    <section
        v-if="shouldRenderBlock"
        class="container mx-auto my-9 px-4 lg:my-14 2.5xl:px-0"
    >
        <div
            v-if="blockTitle || hasTabs"
            class="mb-4 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-center"
        >
            <h2
                v-if="blockTitle"
                class="font-serif mx-auto text-center text-xl font-semibold uppercase lg:text-[1.25rem] lg:leading-9"
            >
                {{ blockTitle }}
            </h2>

            <div
                v-if="hasTabs"
                class="hide-scrollbar mx-auto justify-center -mx-4 flex gap-2 lg:gap-4 overflow-x-auto px-4 lg:mx-0 lg:px-0"
                role="tablist"
                aria-label="Списки товаров"
            >
                <button
                    v-for="group in groups"
                    :key="group.id"
                    type="button"
                    class="shrink-0 cursor-pointer rounded-full text-sm uppercase transition-colors lg:text-xl"
                    :class="
                        group.id === activeGroup?.id
                            ? 'font-semibold text-black'
                            : 'text-[#BFBFBF]'
                    "
                    role="tab"
                    :aria-selected="group.id === activeGroup?.id"
                    @click="selectGroup(group.id)"
                >
                    {{ group.title }}
                </button>
            </div>
        </div>

        <div class="relative">
            <swiper-container ref="containerRef" :init="false" class="w-full">
                <swiper-slide
                    v-for="(product, index) in activeProducts"
                    :key="`${activeGroup?.id}-${product.id}`"
                >
                    <ProductCard
                        :product="product"
                        :analytics-list="
                            activeGroup?.title ||
                            blockTitle ||
                            'Подборка товаров'
                        "
                        :analytics-position="index + 1"
                        :image-width="384"
                        image-sizes="sm:50vw lg:25vw 2xl:384px"
                        first-image-loading="lazy"
                        first-image-fetch-priority="low"
                    />
                </swiper-slide>
                <swiper-slide
                    v-if="activeGroup?.categoryLink"
                    :key="`${activeGroup.id}-category-link`"
                >
                    <NuxtLink
                        :to="activeGroup.categoryLink"
                        class="flex gap-4 aspect-15/18 h-full w-full flex-col items-center justify-center p-4 text-center"
                    >
                        <span
                            class="bg-white shadow rounded-full flex justify-center items-center size-12"
                        >
                            <SvgoChevron
                                filled
                                class="!mb-0 ml-1 text-4xl text-black"
                            />
                        </span>
                        <span> Смотреть все </span>
                    </NuxtLink>
                </swiper-slide>
            </swiper-container>

            <div
                class="product-carousel-controls mb-20 pointer-events-none absolute inset-y-0 left-0 z-20 hidden lg:flex w-full items-center justify-between"
                :class="{
                    'max-lg:hidden': activeSlidesCount <= 2,
                    'lg:hidden': activeSlidesCount <= 4,
                }"
            >
                <button
                    :class="[
                        'pointer-events-auto size-12 cursor-pointer rounded-full bg-white flex justify-center items-center -translate-x-[calc(100%-4rem)] ',
                        prevButtonClass,
                    ]"
                    type="button"
                    aria-label="Предыдущие товары"
                >
                    <SvgoChevron
                        filled
                        class="!mb-0 mr-1 rotate-180 text-4xl text-black"
                    />
                </button>
                <button
                    :class="[
                        'pointer-events-auto size-12 cursor-pointer rounded-full bg-white flex justify-center items-center translate-x-[calc(100%-4rem)]',
                        nextButtonClass,
                    ]"
                    type="button"
                    aria-label="Следующие товары"
                >
                    <SvgoChevron
                        filled
                        class="!mb-0 ml-1 text-4xl text-black lg:text-4xl"
                    />
                </button>
            </div>
        </div>
    </section>
</template>

<style lang="css">
.product-carousel-controls .swiper-button-disabled,
.product-carousel-controls .swiper-button-lock {
    opacity: 0;
    pointer-events: none;
}
</style>
