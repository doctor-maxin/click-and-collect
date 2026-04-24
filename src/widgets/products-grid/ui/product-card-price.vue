<script setup lang="ts">
import type { StoreCalculatedPrice } from "@medusajs/types";

defineProps<{
  calculated_price: StoreCalculatedPrice;
}>();
</script>

<template>
  <div class="flex gap-3 lg:text-2xl text-base items-center">
    <template
      v-if="
        calculated_price.original_amount !== calculated_price.calculated_amount
      "
    >
      <span class="text-red font-medium">{{
        calculated_price.calculated_amount?.toLocaleString("ru-RU", {
          style: "currency",
          currency: "RUB",
          currencyDisplay: "symbol",
          minimumFractionDigits: 0,
        })
      }}</span>
      <span class="line-through text-gray">{{
        calculated_price.original_amount?.toLocaleString("ru-RU", {
          style: "currency",
          currency: "RUB",
          currencyDisplay: "symbol",
          minimumFractionDigits: 0,
        })
      }}</span>
    </template>
    <span v-else>{{
      calculated_price.calculated_amount?.toLocaleString("ru-RU", {
        style: "currency",
        currency: "RUB",
        currencyDisplay: "symbol",
        minimumFractionDigits: 0,
      })
    }}</span>
  </div>
</template>
