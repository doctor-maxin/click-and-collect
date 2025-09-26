<script setup lang="ts">
import { useField, type FormContext } from "vee-validate";

const {
  type = "text",
  variant = "primary",
  form,
  name,
} = defineProps<{
  name: string;
  type?: HTMLInputElement["type"];
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  form: FormContext;
}>();

const { handleBlur, handleChange, value } = useField(name, undefined, {
  form,
});
</script>
<template>
  <input
    :disabled="disabled"
    :data-variant="variant"
    :type="type"
    :name="name"
    class="ui-input"
    @input="handleChange"
    @blur="handleBlur"
    v-model="value"
  />
</template>

<style>
.ui-input {
  padding: 0 1.5rem;
  height: 3rem;
  display: flex;
  align-items: center;
  font-size: 1rem;
  line-height: 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid;
  box-sizing: border-box;

  &:focus,
  &:focus-visible {
    outline: none;
  }

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
    border-color: var(--color-white);
    background-color: transparent;
    color: var(--color-white);
  }

  &[disabled] {
    border-color: var(--color-gray);
    background-color: var(--color-gray);
    color: var(--color-white);
    cursor: not-allowed;
  }
}
</style>
