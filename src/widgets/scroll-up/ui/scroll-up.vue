<script setup lang="ts">
const isTop = ref(true);

const updateScrollPosition = () => {
    isTop.value = window.scrollY <= 40;
};

onMounted(updateScrollPosition);
useEventListener(
    import.meta.client ? window : undefined,
    "scroll",
    updateScrollPosition,
    {
        passive: true,
    },
);

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>
<template>
    <Transition name="fade" mode="out-in" appear>
        <button
            v-if="!isTop"
            type="button"
            aria-label="Наверх"
            class="fixed size-12 cursor-pointer aspect-square rounded-full z-[21] bg-black text-white bottom-3 right-4 flex justify-center items-center"
            @click="scrollToTop"
        >
            <SvgoArrowRight
                aria-hidden="true"
                class="-rotate-90 text-[1.5rem] mb-0!"
                filled
            />
        </button>
    </Transition>
</template>
