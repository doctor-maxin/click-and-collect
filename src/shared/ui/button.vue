<script setup lang="ts">
const { type = "button", variant = "primary" } = defineProps<{
    type?: HTMLButtonElement["type"];
    variant?: "primary" | "secondary" | "outline";
    disabled?: boolean;
}>();
</script>
<template>
    <button
        :disabled="disabled"
        :data-variant="variant"
        :type="type"
        class="ui-button"
    >
        <slot />
    </button>
</template>

<style>
.ui-button {
    padding: 1rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: medium;
    text-align: center;
    line-height: 1.25rem;
    border-radius: 0.5rem;
    border: 1px solid;
    cursor: pointer;
    box-sizing: border-box;

    &[data-variant="primary"] {
        border-color: var(--color-blue);
        background-color: var(--color-blue);
        font-weight: normal;
        color: var(--color-white);
    }

    &[data-variant="secondary"] {
        border-color: var(--color-white);
        background-color: var(--color-white);
        color: var(--color-black);
    }

    &[data-variant="outline"] {
        border-color: var(--color-blue);
        background-color: var(--color-white);
        color: var(--color-black);
    }

    &[disabled] {
        border-color: var(--color-gray);
        background-color: var(--color-gray);
        color: var(--color-white);
        cursor: not-allowed;
    }
}
</style>
