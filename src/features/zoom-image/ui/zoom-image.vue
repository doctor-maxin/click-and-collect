<script setup lang="ts">
import { ref } from "vue";

defineProps<{ src: string }>();

const isZoomed = ref(false);
const position = ref({ x: 0, y: 0 });

const handleMouseMove = (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  position.value = { x, y };
};
</script>

<template>
  <div
    class="relative overflow-hidden w-full group"
    @mouseenter="isZoomed = true"
    @mouseleave="isZoomed = false"
    @mousemove="handleMouseMove"
  >
    <!-- Основное изображение -->
    <img :src="src" class="w-full object-cover" alt="Product Image" />

    <!-- Зум-прямоугольник -->
    <div
      v-if="isZoomed"
      class="absolute border-2 border-white shadow-lg pointer-events-none"
      :style="{
        width: '100px',
        height: '100px',
        top: `${position.y - 50}px`,
        left: `${position.x - 50}px`,
      }"
    ></div>

    <!-- Увеличенная версия -->
    <div
      v-if="isZoomed"
      class="absolute top-0 left-full ml-4 w-[300px] h-[300px] overflow-hidden border"
    >
      <img
        :src="src"
        class="absolute"
        :style="{
          top: `${-position.y * 2 + 150}px`,
          left: `${-position.x * 2 + 150}px`,
          width: '800px',
          height: '800px',
          transition: 'transform 0.1s ease',
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.group:hover img.zoomed {
  transform: scale(2);
}
</style>
