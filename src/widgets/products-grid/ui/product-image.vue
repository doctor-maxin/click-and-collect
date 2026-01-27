<script setup lang="ts">
interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  sizes?: string;
  format?: "webp" | "avif" | "jpeg" | "jpg" | "png" | "svg" | "gif";
}

const props = withDefaults(defineProps<Props>(), {
  loading: "lazy",
});

const appConfig = useAppConfig();
const isS3 = computed(() => appConfig.provider === "s3");
</script>

<template>
  <NuxtImg
    v-if="isS3"
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="loading"
    :format="format"
    provider="customS3"
    placeholder
    :placeholder-width="20"
    :sizes="sizes"
  />
  <img
    v-else
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="loading"
    :sizes="sizes"
  />
</template>
