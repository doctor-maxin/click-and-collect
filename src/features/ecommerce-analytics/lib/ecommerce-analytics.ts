import type {
    EcommerceAnalytics,
    EcommerceAnalyticsAdapter,
    EcommerceAnalyticsEvent,
} from "#shared/types/ecommerce-analytics";
import type { InjectionKey } from "vue";

const noopAnalytics: EcommerceAnalytics = {
    track() {},
};

export const ecommerceAnalyticsKey: InjectionKey<EcommerceAnalytics> =
    Symbol("ecommerce-analytics");

export function createEcommerceAnalytics(
    adapters: EcommerceAnalyticsAdapter[],
): EcommerceAnalytics {
    const productListContexts = new Map<
        string,
        { list?: string; position?: number }
    >();

    return {
        track(event: EcommerceAnalyticsEvent) {
            if (event.type === "select_item") {
                for (const product of event.products) {
                    productListContexts.set(product.id, {
                        list: product.list,
                        position: product.position,
                    });
                }
            }

            const enrichedEvent =
                event.type === "select_item" ||
                event.type === "view_item_list"
                    ? event
                    : {
                          ...event,
                          products: event.products.map((product) => ({
                              ...productListContexts.get(product.id),
                              ...product,
                          })),
                      };

            for (const adapter of adapters) {
                try {
                    adapter.track(enrichedEvent);
                } catch (error) {
                    if (import.meta.dev) {
                        console.warn(
                            "Ecommerce analytics adapter failed",
                            error,
                        );
                    }
                }
            }
        },
    };
}

export function useEcommerceAnalytics() {
    return inject(ecommerceAnalyticsKey, noopAnalytics);
}
