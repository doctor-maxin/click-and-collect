<script setup lang="ts">
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>
<template>
    <button
        type="button"
        class="fixed size-12 aspect-square rounded-full z-[21] bg-black text-white lg:hidden bottom-3 right-4 flex justify-center items-center"
        @click="scrollToTop"
    >
        <SvgoArrowRight class="-rotate-90 text-[1.5rem] !mb-0" filled />
    </button>
    <div
        class="hidden px-4 lg:flex justify-end fixed left-1/2 -translate-x-1/2 bottom-5 z-[21] container"
    >
        <button
            type="button"
            class="bg-white cursor-pointer shadow-[0_4px_10px_0_rgba(74,74,74,0.15)] size-12 aspect-square rounded-full text-black flex justify-center items-center"
            @click="scrollToTop"
        >
            <SvgoChevron class="-rotate-90 text-[1.5rem] !mb-0" filled />
        </button>
    </div>
</template>
