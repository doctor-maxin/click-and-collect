<script setup lang="ts">
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectRoot,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectViewport,
} from "reka-ui";

defineProps<{
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}>();

const model = defineModel<string>();
</script>
<template>
  <SelectRoot v-model="model">
    <SelectTrigger
      class="inline-flex h-12 relative cursor-pointer placeholder:text-gray p-3 w-[20.5rem] items-center justify-between data-[state=closed]:rounded-b-lg rounded-b-0 border rounded-t-lg"
      aria-label="Customise options"
    >
      <span class="absolute left-2 -top-3 bg-white">{{ label }}</span>
      <SelectValue
        class="text-base pl-3 data-[placeholder]:text-gray"
        :placeholder="placeholder"
      />
      <SelectIcon as-child
        ><SvgoChevron filled class="!mb-0 rotate-90 absolute right-3 text-2xl"
      /></SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        start="start"
        position="popper"
        position-strategy="absolute"
        class="bg-white w-[var(--reka-popper-anchor-width)] px-4 border-b z-10 border-x rounded-b-lg"
      >
        <SelectViewport
          class="max-h-[20rem] overflow-y-auto flex w-full flex-col"
        >
          <SelectItem
            v-for="(option, index) in options"
            :key="index"
            class="text-base outline-0 pl-2 cursor-pointer leading-5 py-2"
            :value="option.value"
          >
            <SelectItemText>
              {{ option.label }}
            </SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
