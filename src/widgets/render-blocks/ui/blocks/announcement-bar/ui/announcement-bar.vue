<script setup lang="ts">
import {
    ref,
    computed,
    nextTick,
    onMounted,
    onBeforeUnmount,
    watch,
} from "vue";
import type { IAnnouncementBarBlock } from "~/widgets/render-blocks";

defineOptions({ name: "Marquee" });
const {
    data = {
        textColor: "inherit",
        bgColor: "black",
        isRunning: false,
        text: "example",
        link: null,
    },
} = defineProps<{
    data: IAnnouncementBarBlock;
}>();

const containerRef = ref<HTMLElement | null>(null);
const trackRef = ref<HTMLElement | null>(null);
const probeRef = ref<HTMLElement | null>(null);

const copies = ref(2);
const durationSec = ref(10);
const isPaused = ref(false);

const wrapperStyle = computed(
    () =>
        ({
            "--bg-color": data.bgColor,
            "--text-color": data.textColor,
            cursor: data.link ? "pointer" : "default",
        }) as Record<string, string>,
);

const contentStyle = computed(
    () =>
        ({
            "--duration": `${Math.max(1, Number.isFinite(durationSec.value) ? durationSec.value : 10)}s`,
        }) as Record<string, string>,
);

function recompute() {
    nextTick(() => {
        const containerW = containerRef.value?.clientWidth ?? 0;
        const itemW = probeRef.value?.getBoundingClientRect().width ?? 0;
        const base = itemW + 36;

        // Минимум повторов, чтобы одна «дорожка» была шире контейнера
        const need = base > 0 ? Math.ceil(containerW / base) + 1 : 4;
        copies.value = Math.max(2, need);

        nextTick(() => {
            // Ширина одной дорожки = дистанция одного цикла анимации
            const trackW =
                trackRef.value?.getBoundingClientRect().width ??
                Math.max(1, copies.value * base - 36);
            const seconds = trackW / Math.max(1, 80);
            durationSec.value =
                seconds > 0 && Number.isFinite(seconds) ? seconds : 10;
        });
    });
}

let ro: ResizeObserver | null = null;
function bindResize() {
    if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(recompute);
        if (containerRef.value) ro.observe(containerRef.value);
        if (probeRef.value) ro.observe(probeRef.value);
    } else {
        window.addEventListener("resize", recompute);
    }
}

function unbindResize() {
    ro?.disconnect();
    ro = null;
    window.removeEventListener("resize", recompute);
}

onMounted(() => {
    bindResize();
    recompute();
});

onBeforeUnmount(() => {
    unbindResize();
});

watch(
    () => data.text,
    () => recompute(),
);
</script>

<template>
    <div
        class="w-full text-base lg:text-[1.25rem] leading-5 lg:leading-6 py-2 lg:py-3 overflow-hidden text-(--text-color) bg-[var(--bg-color)]"
        :style="wrapperStyle"
        role="presentation"
    >
        <!-- «Зонд» для точного измерения ширины одного элемента -->
        <span
            ref="probeRef"
            class="absolute invisible whitespace-nowrap pointer-events-none -z-0"
            >{{ data.text }}</span
        >

        <div class="relative w-full overflow-hidden" ref="containerRef">
            <div
                class="content"
                :class="{ paused: isPaused }"
                :style="contentStyle"
            >
                <div
                    class="flex gap-9 shrink-0"
                    ref="trackRef"
                    aria-hidden="false"
                >
                    <span
                        class="inline-block whitespace-nowrap"
                        v-for="n in copies"
                        :key="'a' + n"
                        >{{ data.text }}</span
                    >
                </div>
                <div class="flex gap-9 shrink-0" aria-hidden="true">
                    <span
                        class="inline-block whitespace-nowrap"
                        v-for="n in copies"
                        :key="'b' + n"
                        >{{ data.text }}</span
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.content {
    display: flex;
    align-items: center;
    width: max-content;
    gap: 36px;
    animation: marquee-scroll var(--duration) linear infinite;
    will-change: transform;
}
.content.paused {
    animation-play-state: paused;
}

/* Анимация: обе дорожки лежат подряд, сдвигаем весь контент на ширину одной (50%) */
@keyframes marquee-scroll {
    from {
        transform: translateX(0);
    }
    to {
        transform: translateX(-50%);
    }
}

/* Учитываем предпочтение уменьшения движения */
/*@media (prefers-reduced-motion: reduce) {
  .content {
    animation: none !important;
    transform: none !important;
  }
}*/
</style>
