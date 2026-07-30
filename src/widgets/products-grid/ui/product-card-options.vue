<script setup lang="ts">
import type {
    StoreProduct,
    StoreProductOptionValue,
    StoreProductVariant,
} from "@medusajs/types";
import { sortSizeOptions } from "~/shared/lib/utils/sort-size-options";

const { product } = defineProps<{
    product: StoreProduct;
}>();
const emit = defineEmits<{
    select: [variant: StoreProductVariant];
}>();
const filterStore = useFiltersStore();
const { isOnlineEnabled, isOfflineEnabled } = storeToRefs(filterStore);

const router = useRouter();
const sizeValues = computed(() => {
    const sizeOption = product?.options?.find(
        (o) => o.title.toLowerCase() === "size",
    );

    if (!sizeOption) return [];

    if (!product?.variants) return [];

    const variants = isOnlineEnabled.value
        ? product.variants.filter((v) => {
              const marketplaces = v.metadata?.marketplaces as any[];
              const isStock =
                  "in_stock" in v
                      ? (v.in_stock as boolean)
                      : v?.inventory_quantity;

              return isStock && marketplaces.length;
          })
        : isOfflineEnabled.value
          ? product.variants.filter((v) => {
                const marketplaces = v.metadata?.marketplaces as any[];
                const isStock =
                    "in_stock" in v
                        ? (v.in_stock as boolean)
                        : v?.inventory_quantity;

                return !isStock || !marketplaces.length;
            })
          : product.variants;

    const list =
        variants?.map((variant) => {
            return variant.options?.find((o) => o.option_id === sizeOption.id)!;
        }) ?? [];

    return sortSizeOptions(list, product?.variants);
});
const haveScrollbar = ref(false);
const showToLeft = ref(false);
const showToRight = ref(false);

const optionsContainer = useTemplateRef("optionsContainer");
const optionsScrollbar = useTemplateRef("optionsScrollbar");
const trashHold = shallowRef(0);
let measureFrame: number | null = null;
let stateFrame: number | null = null;
let resizeObserver: ResizeObserver | null = null;

function onScroll() {
    if (!optionsScrollbar.value) return;

    if (
        optionsScrollbar.value.scrollLeft +
            optionsScrollbar.value.clientWidth >=
        optionsScrollbar.value.scrollWidth - trashHold.value
    ) {
        showToRight.value = false;
        showToLeft.value = true;
    }

    if (optionsScrollbar.value.scrollLeft <= trashHold.value) {
        showToLeft.value = false;
        showToRight.value = true;
    }
}
function scheduleScrollbarMeasure() {
    if (measureFrame !== null) cancelAnimationFrame(measureFrame);

    measureFrame = requestAnimationFrame(() => {
        measureFrame = null;

        const scrollbar = optionsScrollbar.value;
        if (!scrollbar) return;

        const hasOverflow = scrollbar.scrollWidth > scrollbar.clientWidth;
        const isAtStart = scrollbar.scrollLeft <= trashHold.value;

        stateFrame = requestAnimationFrame(() => {
            stateFrame = null;
            haveScrollbar.value = hasOverflow;
            showToLeft.value = hasOverflow && !isAtStart;
            showToRight.value = hasOverflow && isAtStart;
        });
    });
}

onMounted(() => {
    const scrollbar = optionsScrollbar.value;
    if (!scrollbar) return;

    scrollbar.addEventListener("scroll", onScroll, { passive: true });
    resizeObserver = new ResizeObserver(scheduleScrollbarMeasure);
    resizeObserver.observe(scrollbar);
    scheduleScrollbarMeasure();
});

onUnmounted(() => {
    optionsScrollbar.value?.removeEventListener("scroll", onScroll);
    resizeObserver?.disconnect();

    if (measureFrame !== null) cancelAnimationFrame(measureFrame);
    if (stateFrame !== null) cancelAnimationFrame(stateFrame);
});

function scrollLeft() {
    if (!optionsScrollbar.value) return;

    optionsScrollbar.value.scrollTo({
        left: 0,
        behavior: "smooth",
    });
}
function scrollRight() {
    if (!optionsScrollbar.value) return;

    optionsScrollbar.value.scrollTo({
        left:
            optionsScrollbar.value.scrollWidth -
            optionsScrollbar.value.clientWidth,
        behavior: "smooth",
    });
}

function routeTo(option: StoreProductOptionValue) {
    const variant = product.variants?.find((v) =>
        v?.options?.some(
            (o) => o.option_id === option.option_id && o.value === option.value,
        ),
    );

    if (!variant) return;

    emit("select", variant);
    router.push(`/products/${product.handle}?variant=${variant.id}`);
}
</script>
<template>
    <div
        class="absolute product-card-options z-30 max-w-full px-4 bottom-5 mb-0.5 w-full flex justify-center"
    >
        <div
            ref="optionsContainer"
            class="flex gap-0 max-w-full px-5 py-2 bg-white/75 rounded"
        >
            <Transition name="slide-left" mode="out-in" appear>
                <button
                    v-if="showToLeft && haveScrollbar"
                    type="button"
                    aria-label="Предыдущие размеры"
                    class="left-5 absolute bottom-1.5"
                    @click="scrollLeft"
                >
                    <SvgoChevron
                        aria-hidden="true"
                        class="text-2xl cursor-pointer rotate-180 !mb-0"
                        filled
                    />
                </button>
            </Transition>
            <div
                ref="optionsScrollbar"
                class="flex max-w-full hide-scrollbar scroll-mx-5 scroll-px-5 snap-x snap-mandatory overflow-x-auto items-center gap-5"
            >
                <span
                    v-for="(v, i) of sizeValues"
                    :key="i"
                    class="text-black whitespace-nowrap text-base leading-5 cursor-pointer"
                    :class="{
                        'snap-start': i === 0,
                        'snap-end': i !== 0,
                    }"
                    @click="routeTo(v)"
                >
                    {{ v?.value ?? "-" }}
                </span>
            </div>
            <Transition name="slide-right" mode="out-in">
                <button
                    v-if="showToRight && haveScrollbar"
                    type="button"
                    aria-label="Следующие размеры"
                    class="absolute right-5 bottom-1.5"
                    @click="scrollRight"
                >
                    <SvgoChevron
                        aria-hidden="true"
                        class="text-2xl cursor-pointer !mb-0"
                        filled
                    />
                </button>
            </Transition>
        </div>
    </div>
</template>
<style></style>
