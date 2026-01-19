<script setup lang="ts">
defineProps<{ active?: boolean }>();
</script>
<template>
  <button
    type="button"
    class="h-8 flex items-center px-3 rounded-lg cursor-pointer text-sm border border-blue text-black"
    :class="{ 'bg-blue text-white': active }"
  >
    <slot />
  </button>
</template>
