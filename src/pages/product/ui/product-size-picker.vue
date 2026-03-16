<script setup lang="ts">
import { useProductStore } from "../lib/product-store";
import { sortSizeOptions } from "~/shared/lib/utils/sort-size-options";

const productStore = useProductStore();
const { size, color, product } = storeToRefs(productStore);

const sizeOption = computed(() => {
  return product.value?.options?.find((o) => o.title.toLowerCase() === "size");
});
const colorOption = computed(() => {
  return product.value?.options?.find((o) => o.title.toLowerCase() === "color");
});

const options = computed(() => {
  const list =
    product.value?.variants
      ?.filter(
        (variant) =>
          variant.options?.find((o) => o.option_id === colorOption.value?.id)
            ?.value === color.value?.value,
      )
      ?.map((variant) => {
        return variant.options?.find(
          (o) => o.option_id === sizeOption.value?.id,
        )!;
      }) ?? [];

  return sortSizeOptions(list, product.value?.variants ?? []);
});
</script>
<template>
  <section class="flex flex-col gap-4 my-4 lg:my-9">
    <span>Размеры</span>
    <div
      class="flex text-base leading-5 gap-y-4 gap-5 w-full max-w-full flex-wrap"
    >
      <label
        v-for="item of options"
        :key="item.id"
        class="cursor-pointer border rounded-[6px] relative px-[5px]"
        :class="{
          '  border-blue ': size?.id === item?.id,
          ' border-transparent': size?.id !== item?.id,
        }"
        @click="productStore.selectSize(item)"
      >
        {{ item.value }}
      </label>
    </div>
  </section>
</template>
