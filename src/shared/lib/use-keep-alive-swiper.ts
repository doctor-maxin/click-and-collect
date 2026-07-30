import type { Ref } from "vue";
import type { SwiperContainer } from "swiper/element";
import type { SwiperOptions } from "swiper/types";

export function useKeepAliveSwiper(
    containerRef: Ref<SwiperContainer | null>,
    options: SwiperOptions,
) {
    const swiper = useSwiper(containerRef, options);
    let initFrame: number | null = null;

    function cancelScheduledInit() {
        if (initFrame === null) return;

        cancelAnimationFrame(initFrame);
        initFrame = null;
    }

    onActivated(() => {
        cancelScheduledInit();

        initFrame = requestAnimationFrame(() => {
            initFrame = null;

            const container = containerRef.value;
            if (!container?.isConnected) return;

            if (!container.swiper || container.swiper.destroyed) {
                Object.assign(container, options);
                container.initialize();
            } else {
                container.swiper.update();
            }

            swiper.instance.value = container.swiper;
        });
    });

    onDeactivated(cancelScheduledInit);
    onBeforeUnmount(cancelScheduledInit);

    return swiper;
}
