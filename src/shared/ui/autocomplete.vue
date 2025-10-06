<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxArrow,
  ComboboxCancel,
  ComboboxContent,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxViewport,
} from "reka-ui";
import { useField, type FormContext } from "vee-validate";
import type { IFilterValue } from "#shared/types/autocomplete.js";

const { name, form } = defineProps<{
  name: string;
  form?: FormContext;
  placeholder?: string;
  options: IFilterValue[];
}>();

const { handleBlur, handleChange, value } = useField(name, undefined, {
  form,
});

const isOpen = ref(false);
</script>
<template>
  <ComboboxRoot
    :model-value="value"
    @update:model-value="handleChange"
    class="relative"
    v-model:open="isOpen"
    v-slot="{ open }"
  >
    <ComboboxAnchor class="">
      <ComboboxTrigger
        class="py-2 cursor-pointer border rounded-lg flex w-full justify-between items-center px-4"
        :class="{
          'rounded-b-none': open,
        }"
      >
        <span class="text-base leading-5">{{ placeholder }}</span>
        <SvgoChevron
          filled
          class="text-[1.5rem] !mb-0"
          :class="{
            '-rotate-90': open,
            'rotate-90': !open,
          }"
        />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxContent
      class="absolute py-2 px-4 z-10 w-full bg-white rounded-b-lg border-x border-b top-full"
    >
      <ComboboxViewport class="flex flex-col w-full gap-5">
        <label class="relative text-[hsla(0,0%,57%,1)]">
          <SvgoSearch filled class="absolute left-0 bottom-1 text-2xl" />
          <ComboboxInput
            class="border-b placeholder:text-base placeholder:leading-5 block focus:outline-none outline-none border-[hsla(0,0%,57%,1)] py-1.5 pl-8 pr-1.5"
            placeholder="Поиск"
          />
        </label>

        <ComboboxGroup
          class="flex max-h-[20rem] overflow-y-auto flex-col gap-4 w-full"
        >
          <ComboboxItem
            v-for="option of options"
            :value="option"
            :key="option.value"
            :textValue="option.label"
            class="flex gap-3 items-center cursor-pointer"
          >
            <span class="text-base leading-5">
              {{ option.label }}
            </span>
            <ComboboxItemIndicator />
          </ComboboxItem>
        </ComboboxGroup>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>
