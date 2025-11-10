<script setup lang="ts">
import {
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectViewport,
} from "reka-ui";

const OrderValues = markRaw([
  {
    label: "По возрастанию цены",
    value: "variants.calculated_price.calculated_amount:asc",
  },
  {
    label: "По убыванию цены",
    value: "variants.calculated_price.calculated_amount:desc",
  },
  {
    label: "от А до Я",
    value: "title:asc",
  },
  {
    label: "от Я до А",
    value: "title:desc",
  },
  {
    label: "Новинки",
    disabled: true,
    value: "updated_at:desc",
  },
  {
    label: "Со скидкой",
    disabled: true,
    value: "isDiscounted:desc",
  },
]);

const filtersStore = useFiltersStore();

const sort = ref(null);
</script>
<template>
  <SelectRoot
    as="div"
    class="relative"
    v-model="sort"
    @update:modelValue="filtersStore.setSort($event)"
  >
    <SelectTrigger
      class="flex min-w-[15.625rem] justify-end outline-0 cursor-pointer items-center gap-2"
    >
      <SelectValue
        class="text-[1.25rem] font-medium leading-6"
        placeholder="Сортировка"
      />
      <SelectIcon as-child>
        <SvgoChevron filled class="text-2xl rotate-90"
      /></SelectIcon>
    </SelectTrigger>

    <SelectContent
      class="absolute -translate-x-full w-max z-30 rounded-lg shadow-[0_4px_10px_0_rgba(74,74,74,0.12)] bg-white"
      position-strategy="absolute"
      align="end"
      side="bottom"
      position="popper"
    >
      <SelectViewport class="max-h-[20rem] w-max overflow-y-auto flex flex-col">
        <SelectItem
          v-for="option of OrderValues"
          :value="option.value"
          :key="option.label"
          :disabled="option.disabled"
          class="px-4 w-full py-2 cursor-pointer hover:outline-0 outline-0"
          :class="{
            'cursor-not-allowed text-light-gray': option.disabled,
          }"
        >
          <SelectItemText>{{ option.label }} </SelectItemText>
        </SelectItem>
      </SelectViewport>
    </SelectContent>
  </SelectRoot>
</template>
