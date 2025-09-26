<script setup lang="ts">
defineProps<{
  items: Array<{ path: string; label: string }>;
}>();
</script>
<template>
  <ol class="ui-breadcrumbs">
    <li v-for="item in items" :key="item.path">
      <NuxtLink :to="item.path">{{ item.label }}</NuxtLink>
    </li>
  </ol>
</template>
<style>
.ui-breadcrumbs {
  display: flex;
  gap: 0.25rem;

  li {
    color: var(--color-gray);
    display: flex;
    gap: 0.25rem;
  }
  li::after {
    content: "/";
  }
  li:last-child::after {
    display: none;
  }
}
</style>
