<script setup lang="ts">
import type { StoreProduct, StoreProductOptionValue } from "@medusajs/types";
import { sortSizeOptions } from "~/shared/lib/utils/sort-size-options";

const { product } = defineProps<{
    product: StoreProduct;
}>();
const router = useRouter();
const sizeValues = computed(() => {
    const sizeOption = product?.options?.find(
        (o) => o.title.toLowerCase() === "size",
    );

    if (!sizeOption) return [];

    const list =
        product?.variants?.map((variant) => {
            return variant.options?.find((o) => o.option_id === sizeOption.id)!;
        }) ?? [];

    if (!list || !product?.variants) return [];
    return sortSizeOptions(list, product?.variants);
});
const haveScrollbar = ref(false);
const showToLeft = ref(false);
const showToRight = ref(false);

const optionsContainer = useTemplateRef("optionsContainer");
const optionsScrollbar = useTemplateRef("optionsScrollbar");
const trashHold = shallowRef(0);

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
onMounted(() => {
    if (!optionsScrollbar.value) return;

    optionsScrollbar.value.addEventListener("scroll", onScroll);

    if (
        optionsScrollbar.value.scrollWidth <= optionsScrollbar.value.clientWidth
    )
        return;
    haveScrollbar.value = true;

    if (optionsScrollbar.value.scrollLeft === 0) {
        showToLeft.value = false;
        showToRight.value = true;
    }
});
onUnmounted(() => {
    if (!optionsScrollbar.value) return;
    optionsScrollbar.value.removeEventListener("scroll", onScroll);
});

function scrollLeft() {
    if (!optionsScrollbar.value) return;

    optionsScrollbar.value.firstElementChild?.scrollIntoView({
        behavior: "smooth",
    });
}
function scrollRight() {
    if (!optionsScrollbar.value) return;

    optionsScrollbar.value.lastElementChild?.scrollIntoView({
        behavior: "smooth",
    });
}

function routeTo(option: StoreProductOptionValue) {
    const variant = product.variants?.find((v) =>
        v?.options?.some(
            (o) => o.option_id === option.option_id && o.value === option.value,
        ),
    );

    router.push(`/products/${product.handle}?variant=${variant?.id}`);
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
                    class="left-5 absolute bottom-1.5"
                    @click="scrollLeft"
                >
                    <SvgoChevron
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
                    class="absolute right-5 bottom-1.5"
                    @click="scrollRight"
                >
                    <SvgoChevron class="text-2xl cursor-pointer !mb-0" filled />
                </button>
            </Transition>
        </div>
    </div>
</template>
<style></style>
