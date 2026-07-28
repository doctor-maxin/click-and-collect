import {
    createEcommerceAnalytics,
    createYandexMetricaEcommerceAdapter,
    ecommerceAnalyticsKey,
} from "~/features/ecommerce-analytics";

export default defineNuxtPlugin((nuxtApp) => {
    window.dataLayer = window.dataLayer ?? [];

    const analytics = createEcommerceAnalytics([
        createYandexMetricaEcommerceAdapter((payload) => {
            window.dataLayer.push(payload);
        }),
    ]);

    nuxtApp.vueApp.provide(ecommerceAnalyticsKey, analytics);
});

declare global {
    interface Window {
        dataLayer: unknown[];
    }
}
