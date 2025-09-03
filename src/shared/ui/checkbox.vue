<script setup lang="ts">
defineProps<{
    name: string;
}>();
</script>
<template>
    <label class="ui-checkbox"
        ><input :name="name" type="checkbox" />
        <span class="ui-checkbox-indicator" />
        <span class="ui-checkbox-content"> <slot /></span
    ></label>
</template>
<style>
.ui-checkbox {
    display: flex;
    gap: 0.75rem;
    cursor: pointer;

    input {
        display: none;
    }
}

.ui-checkbox-indicator {
    width: 2rem;
    height: 2rem;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    background-image: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMzIgMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIzMi4wMDAwMDAiIGhlaWdodD0iMzIuMDAwMDAwIiBmaWxsPSJub25lIj4KCTxyZWN0IGlkPSJDaGVjayBib3ggb3V0bGluZSBibGFuayIgd2lkdGg9IjMyLjAwMDAwMCIgaGVpZ2h0PSIzMi4wMDAwMDAiIHg9IjAuMDAwMDAwIiB5PSIwLjAwMDAwMCIgZmlsbD0icmdiKDI1NSwyNTUsMjU1KSIgZmlsbC1vcGFjaXR5PSIwIiAvPgoJPHBhdGggaWQ9IlZlY3RvciIgZD0iTTAgMEwzMiAwTDMyIDMyTDAgMzJMMCAwWiIgZmlsbC1ydWxlPSJub256ZXJvIiAvPgoJPHBhdGggaWQ9IlZlY3RvciIgZD0iTTI0IDI1LjMzMzNMOCAyNS4zMzMzQzcuMjY2NjcgMjUuMzMzMyA2LjY2NjY3IDI0LjczMzMgNi42NjY2NyAyNEw2LjY2NjY3IDhDNi42NjY2NyA3LjI2NjY3IDcuMjY2NjcgNi42NjY2NyA4IDYuNjY2NjdMMjQgNi42NjY2N0MyNC43MzMzIDYuNjY2NjcgMjUuMzMzMyA3LjI2NjY3IDI1LjMzMzMgOEwyNS4zMzMzIDI0QzI1LjMzMzMgMjQuNzMzMyAyNC43MzMzIDI1LjMzMzMgMjQgMjUuMzMzM1pNMjUuMzMzMyA0TDYuNjY2NjcgNEM1LjIgNCA0IDUuMiA0IDYuNjY2NjdMNCAyNS4zMzMzQzQgMjYuOCA1LjIgMjggNi42NjY2NyAyOEwyNS4zMzMzIDI4QzI2LjggMjggMjggMjYuOCAyOCAyNS4zMzMzTDI4IDYuNjY2NjdDMjggNS4yIDI2LjggNCAyNS4zMzMzIDRaIiBmaWxsPSJyZ2IoMjU1LDI1NSwyNTUpIiBmaWxsLXJ1bGU9Im5vbnplcm8iIC8+Cjwvc3ZnPg==");
}

.ui-checkbox-content {
    padding-top: 6.5px;
    line-height: 1.25rem;
    box-sizing: border-box;
}
</style>
