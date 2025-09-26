<script setup lang="ts">
import { useProductStore } from "../lib/product-store";

const productStore = useProductStore();
const { variant, product } = storeToRefs(productStore);

const variantSize = ref(variant.value);

watch(variantSize, (newSize) => {
  productStore.setVariant(newSize);
});
</script>
<template>
  <section class="flex flex-col gap-4 my-4 lg:my-9">
    <span>Размеры</span>
    <div class="flex text-base leading-5 gap-8 w-full">
      <label
        v-for="variant of product?.variants"
        :key="variant.id"
        class="cursor-pointer"
      >
        <input
          v-model="variantSize"
          :value="variant"
          type="radio"
          class="hidden"
        />
        {{ variant.options?.find((o) => o.option?.title === "size")?.value }}
      </label>
    </div>
  </section>
</template>
