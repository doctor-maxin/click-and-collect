<script setup lang="ts">
import type { SvgoWb } from "#components";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "reka-ui";

defineProps<{
  item: {
    provider: string;
    link: string;
  };
}>();

const copyLink = (link: string) => {
  navigator.clipboard.writeText(link);
  isPopoverOpen.value = true;
  setTimeout(() => {
    isPopoverOpen.value = false;
  }, 2000);
};
const isPopoverOpen = ref(false);
</script>
<template>
  <div
    type="button"
    :href="item.link"
    role="link"
    class="flex rounded-lg w-full max-w-[18.25rem]"
    :class="[item.provider.toLowerCase()]"
  >
    <a
      :href="item.link"
      class="flex px-8 border-r border-white items-center justify-center cursor-pointer h-12"
      target="_blank"
    >
      <span class="flex items-center gap-1.5">
        <span class="flex text-base leading-5 font-medium">Купить на </span>
        <SvgoWb class="!w-[6.25rem] !h-[0.9375rem]" filled />
      </span>
    </a>
    <PopoverRoot v-model:open="isPopoverOpen">
      <PopoverTrigger as-child>
        <button
          type="button"
          class="h-12 cursor-pointer rounded-r px-2.5"
          @click="copyLink(item.link)"
        >
          <SvgoCopy class="!mb-0 text-white text-2xl" filled />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        :side-offset="16"
        align="center"
        class="bg-white rounded-lg shadow-[0_4px_10px_0_rgba(74,74,74,0.15)] text-[rgb(14,34,64)]/50 text-sm leading-[1.125rem] px-2 py-1"
      >
        Ссылка скопирована
      </PopoverContent>
    </PopoverRoot>
  </div>
</template>
