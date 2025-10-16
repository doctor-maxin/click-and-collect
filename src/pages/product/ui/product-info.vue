<script setup lang="ts">
import type { StoreProduct } from "@medusajs/types";
import { useProductStore } from "../lib/product-store";
import ProductColorPicker from "./product-color-picker.vue";
import ProductSizePicker from "./product-size-picker.vue";

const productStore = useProductStore();
const { product, variant, price } = storeToRefs(productStore);
const router = useRouter();
const sku = computed(() =>
    product?.value?.variants?.[0]?.sku?.split("-").splice(0, 3).join("-"),
);

watch(
    variant,
    (v) => {
        if (!v) return;
        router.push({
            query: {
                variant: v.id,
            },
        });
    },
    {
        deep: true,
    },
);
</script>
<template>
    <div class="w-full">
        <h1
            class="text-base lg:text-[1.25rem] font-medium leading-5 lg:leading-6 uppercase mb-3 lg:mb-4"
        >
            {{ product?.title }}
        </h1>
        <span
            class="text-base block mb-3 lg:mb-6 leading-5 text-[hsl(216,64%,15%)]/50"
            >Арт. {{ sku }}</span
        >

        <span
            v-if="typeof price === 'number'"
            class="my-6 text-2xl font-medium"
            >{{
                price.toLocaleString("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                    maximumFractionDigits: 0,
                })
            }}</span
        >
        <span class="text-base block my-3 lg:my-9 leading-5"
            >Состав:
            <span class="uppercase">
                {{ product?.metadata?.composition }}</span
            ></span
        >
        <ProductColorPicker />
        <ProductSizePicker />
        <span class="text-[1.25rem] leading-6 my-0"
            >Товар доступен только в розничном магазине</span
        >
    </div>
</template>
