<script setup lang="ts">
import { CategoryPage } from "~/pages/category";

defineOptions({
  name: "CatalogRoutePage",
});

definePageMeta({
  key: (route) => route.path,
});
</script>
<template>
  <CategoryPage />
</template>
