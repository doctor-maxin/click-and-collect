<script setup lang="ts">
import { useProductStore } from "../lib/product-store";

const productStore = useProductStore();
const { product, color, variant } = storeToRefs(productStore);

const colorImage = (color: string) => {
    const image = product.value?.images?.find(
        (i) => i.metadata?.color?.toLowerCase() === color?.toLowerCase(),
    );
    console.log(image);
    return image?.url ?? "/not_found.png";
};
</script>
<template>
    <div class="flex my-4 lg:my-9 flex-col gap-5 lg:gap-4">
        <span
            >Цвет:
            <span class="capitalize">{{
                variant?.metadata?.colorTranslation ?? color?.value
            }}</span></span
        >
        <div class="flex overflow-x-auto gap-3 w-full">
            <article
                v-for="item of product?.options?.find(
                    (o) => o.title === 'color',
                )?.values"
                :key="item.id"
                class="cursor-pointer border-2"
                @click="productStore.selectColor(item)"
                :class="{
                    ' border-blue': color?.id === item?.id,
                    ' border-gray': color?.id !== item?.id,
                }"
            >
                <img
                    class="aspect-[23/28] object-cover max-w-[5.75rem]"
                    :src="colorImage(item.value)"
                    :alt="`Изображение товара ${item.value}`"
                />
            </article>
        </div>
    </div>
</template>
