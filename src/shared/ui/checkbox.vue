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
    <span class="ui-checkbox-indicator" />
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
  width: 2rem;
  min-width: 2rem;
  height: 2rem;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMzIgMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIzMi4wMDAwMDAiIGhlaWdodD0iMzIuMDAwMDAwIiBmaWxsPSJub25lIj4KCTxyZWN0IGlkPSJDaGVjayBib3ggb3V0bGluZSBibGFuayIgd2lkdGg9IjMyLjAwMDAwMCIgaGVpZ2h0PSIzMi4wMDAwMDAiIHg9IjAuMDAwMDAwIiB5PSIwLjAwMDAwMCIgZmlsbD0icmdiKDI1NSwyNTUsMjU1KSIgZmlsbC1vcGFjaXR5PSIwIiAvPgoJPHBhdGggaWQ9IlZlY3RvciIgZD0iTTAgMEwzMiAwTDMyIDMyTDAgMzJMMCAwWiIgZmlsbC1ydWxlPSJub256ZXJvIiAvPgoJPHBhdGggaWQ9IlZlY3RvciIgZD0iTTI0IDI1LjMzMzNMOCAyNS4zMzMzQzcuMjY2NjcgMjUuMzMzMyA2LjY2NjY3IDI0LjczMzMgNi42NjY2NyAyNEw2LjY2NjY3IDhDNi42NjY2NyA3LjI2NjY3IDcuMjY2NjcgNi42NjY2NyA4IDYuNjY2NjdMMjQgNi42NjY2N0MyNC43MzMzIDYuNjY2NjcgMjUuMzMzMyA3LjI2NjY3IDI1LjMzMzMgOEwyNS4zMzMzIDI0QzI1LjMzMzMgMjQuNzMzMyAyNC43MzMzIDI1LjMzMzMgMjQgMjUuMzMzM1pNMjUuMzMzMyA0TDYuNjY2NjcgNEM1LjIgNCA0IDUuMiA0IDYuNjY2NjdMNCAyNS4zMzMzQzQgMjYuOCA1LjIgMjggNi42NjY2NyAyOEwyNS4zMzMzIDI4QzI2LjggMjggMjggMjYuOCAyOCAyNS4zMzMzTDI4IDYuNjY2NjdDMjggNS4yIDI2LjggNCAyNS4zMzMzIDRaIiBmaWxsPSJyZ2IoMjU1LDI1NSwyNTUpIiBmaWxsLXJ1bGU9Im5vbnplcm8iIC8+Cjwvc3ZnPg==");
}

.ui-checkbox:has(input:checked) .ui-checkbox-indicator {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMzIgMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIzMi4wMDAwMDAiIGhlaWdodD0iMzIuMDAwMDAwIiBmaWxsPSJub25lIj4KCTxyZWN0IGlkPSLRhNGA0LXQudC8IDcyNCIgd2lkdGg9IjMyLjAwMDAwMCIgaGVpZ2h0PSIzMi4wMDAwMDAiIHg9IjAuMDAwMDAwIiB5PSIwLjAwMDAwMCIgLz4KCTxwYXRoIGlkPSJWZWN0b3IiIGQ9Ik0yNS4zMzMzIDRMNi42NjY2NyA0QzUuMiA0IDQgNS4yIDQgNi42NjY2N0w0IDI1LjMzMzNDNCAyNi44IDUuMiAyOCA2LjY2NjY3IDI4TDI1LjMzMzMgMjhDMjYuOCAyOCAyOCAyNi44IDI4IDI1LjMzMzNMMjggNi42NjY2N0MyOCA1LjIgMjYuOCA0IDI1LjMzMzMgNFpNMTQuMjggMjEuNzJDMTMuNzYgMjIuMjQgMTIuOTIgMjIuMjQgMTIuNCAyMS43Mkw3LjYxMzMzIDE2LjkzMzNDNy4wOTMzMyAxNi40MTMzIDcuMDkzMzMgMTUuNTczMyA3LjYxMzMzIDE1LjA1MzNDOC4xMzMzMyAxNC41MzMzIDguOTczMzMgMTQuNTMzMyA5LjQ5MzMzIDE1LjA1MzNMMTMuMzMzMyAxOC44OTMzTDIyLjUwNjcgOS43MkMyMy4wMjY3IDkuMiAyMy44NjY3IDkuMiAyNC4zODY3IDkuNzJDMjQuOTA2NyAxMC4yNCAyNC45MDY3IDExLjA4IDI0LjM4NjcgMTEuNkwxNC4yOCAyMS43MloiIGZpbGw9InJnYigyNTUsMjU1LDI1NSkiIGZpbGwtcnVsZT0ibm9uemVybyIgLz4KPC9zdmc+Cg==");
}

.ui-checkbox-content {
  line-height: 1.25rem;
  box-sizing: border-box;
}
</style>
