<script setup lang="ts">
defineProps<{
    options: {
        label: string;
        value: string;
    }[];
}>();
const model = defineModel();
</script>
<template>
    <div class="flex">
        <div v-for="option in options" class="px-1 py-2">
            <button
                type="button"
                @click="model = option.value"
                class="h-8 flex items-center px-3 rounded-lg cursor-pointer"
                :class="{
                    'bg-blue text-white': model === option.value,
                    'text-[hsl(222,12%,42%)] bg-[hsl(180,16%,93%)]':
                        model !== option.value,
                }"
            >
                {{ option.label }}
            </button>
        </div>
    </div>
</template>
