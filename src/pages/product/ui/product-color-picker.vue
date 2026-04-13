<script setup lang="ts">
import { useProductStore } from "../lib/product-store";

const productStore = useProductStore();
const { product, color, variant } = storeToRefs(productStore);
const appConfig = useAppConfig();
const isS3 = computed(() => appConfig.provider === "s3");
const img = useImage();

const colorImage = (color: string) => {
    const variant = product.value?.variants?.find((v) =>
        v.options?.some(
            (o) => o.value === color && o.option?.title === "color",
        ),
    );
    const image = product.value?.images?.find(
        (i) =>
            //@ts-ignore
            i.metadata?.color?.toLowerCase() ===
            //@ts-ignore
            variant?.metadata?.color?.toLowerCase(),
    );
    if (!image) return "/not_found.png";

    return isS3.value
        ? img(
              image.url,
              {
                  width: 168,
              },
              {
                  //@ts-ignore
                  provider: "customS3",
              },
          )
        : image.url;
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
                class="cursor-pointer border-[3px] rounded-lg overflow-hidden"
                @click="productStore.selectColor(item)"
                :class="{
                    ' border-blue': color?.id === item?.id,
                    ' border-transparent': color?.id !== item?.id,
                }"
            >
                <img
                    class="aspect-23/28 object-cover max-w-23"
                    :src="colorImage(item.value)"
                    :alt="`Изображение товара ${item.value}`"
                />
            </article>
        </div>
    </div>
</template>
