<script setup lang="ts">
import { useField, type FormContext } from "vee-validate";

const { name, form } = defineProps<{
  name: string;
  form: FormContext;
}>();

const { handleBlur, handleChange, value } = useField(name, undefined, {
  form: form,
  type: "checkbox",
  checkedValue: true,
  uncheckedValue: false,
});
</script>
<template>
  <label class="ui-checkbox"
    ><input
      :name="name"
      type="checkbox"
      :checked="value"
      :value="value"
      @input="handleChange"
      @blur="handleBlur" />
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      class="ui-checkbox-indicator"
      :class="{ unchecked: !value }"
    >
      <path
        d="M21.3333 0L2.66667 0C1.2 0 0 1.2 0 2.66667L0 21.3333C0 22.8 1.2 24 2.66667 24L21.3333 24C22.8 24 24 22.8 24 21.3333L24 2.66667C24 1.2 22.8 0 21.3333 0ZM10.28 17.72C9.76 18.24 8.92 18.24 8.4 17.72L3.61333 12.9333C3.09333 12.4133 3.09333 11.5733 3.61333 11.0533C4.13333 10.5333 4.97333 10.5333 5.49333 11.0533L9.33333 14.8933L18.5067 5.72C19.0267 5.2 19.8667 5.2 20.3867 5.72C20.9067 6.24 20.9067 7.08 20.3867 7.6L10.28 17.72Z"
        fill="rgb(0,163,228)"
        fill-rule="nonzero"
      />
    </svg>
    <span class="ui-checkbox-content"> <slot /></span
  ></label>
</template>
<style>
.ui-checkbox {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  cursor: pointer;

  input {
    display: none;
  }
}

.ui-checkbox-indicator {
  min-width: 1.5rem;
}

.ui-checkbox-content {
  line-height: 1.25rem;
  box-sizing: border-box;
}

.unchecked path {
  fill: transparent;
}

.unchecked {
  border: 1px solid var(--color-blue);
  border-radius: 4px;
}
</style>
