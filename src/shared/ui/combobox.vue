<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from "reka-ui";

defineProps<{
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}>();

const model = defineModel<string>();
</script>
<template>
  <ComboboxRoot v-model="model" class="relative h-12" v-slot="{ open }">
    <ComboboxAnchor
      :class="{
        'rounded-b-lg': !open,
        'rounded-b-0': open,
      }"
      class="inline-flex h-12 relative cursor-pointer placeholder:text-gray w-[20.5rem] items-center justify-between border rounded-t-lg"
      aria-label="Customise options"
    >
      <ComboboxInput
        class="absolute outline-0 p-3 left-0 top-0 w-full h-full"
        :placeholder="placeholder"
      />
      <span class="absolute left-2 -top-3 bg-white">{{ label }}</span>
      <ComboboxTrigger as-child>
        <SvgoChevron filled class="!mb-0 rotate-90 absolute right-3 text-2xl" />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxContent
      position-strategy="absolute"
      class="absolute top-full bg-white w-full px-4 border-b z-10 border-x rounded-b-lg"
    >
      <ComboboxViewport
        class="max-h-[20rem] overflow-y-auto flex w-full flex-col"
      >
        <ComboboxItem
          v-for="(option, index) in options"
          :key="index"
          class="text-base outline-0 pl-2 cursor-pointer leading-5 py-2"
          :value="option.value"
        >
          {{ option.label }}
        </ComboboxItem>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>
