<script setup lang="ts">
const route = useRoute();

const breadcrumbs = computed(() => {
  const list = [
    {
      path: route.path,
      label: route.query.q?.toString() ?? "Поиск",
    },
    {
      path: `/`,
      label: "Главная",
    },
  ];

  return list.reverse();
});
</script>
<template>
  <div class="hidden lg:block my-9">
    <UiBreadcrumbs :items="breadcrumbs" />
  </div>
</template>
