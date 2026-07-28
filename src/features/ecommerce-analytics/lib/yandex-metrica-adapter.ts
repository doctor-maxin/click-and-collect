import type {
    EcommerceAnalyticsAdapter,
    EcommerceAnalyticsEvent,
    EcommerceProduct,
} from "#shared/types/ecommerce-analytics";

type YandexEcommerceProduct = Omit<EcommerceProduct, "list"> & {
    list?: string;
};

interface YandexEcommercePayload {
    ecommerce: {
        currencyCode: string;
        impressions?: YandexEcommerceProduct[];
        click?: { products: YandexEcommerceProduct[] };
        detail?: { products: YandexEcommerceProduct[] };
        add?: { products: YandexEcommerceProduct[] };
        remove?: { products: YandexEcommerceProduct[] };
        purchase?: {
            actionField: {
                id: string;
                coupon?: string;
                revenue?: number;
                goal_id?: number;
            };
            products: YandexEcommerceProduct[];
        };
    };
}

function toYandexPayload(
    event: EcommerceAnalyticsEvent,
): YandexEcommercePayload {
    const ecommerce: YandexEcommercePayload["ecommerce"] = {
        currencyCode: event.currency,
    };

    switch (event.type) {
        case "view_item_list":
            ecommerce.impressions = event.products;
            break;
        case "select_item":
            ecommerce.click = { products: event.products };
            break;
        case "view_item":
            ecommerce.detail = { products: event.products };
            break;
        case "add_to_cart":
            ecommerce.add = { products: event.products };
            break;
        case "remove_from_cart":
            ecommerce.remove = { products: event.products };
            break;
        case "purchase":
            ecommerce.purchase = {
                actionField: {
                    id: event.transaction.id,
                    coupon: event.transaction.coupon,
                    revenue: event.transaction.revenue,
                    goal_id: event.transaction.goalId,
                },
                products: event.products,
            };
            break;
    }

    return { ecommerce };
}

export function createYandexMetricaEcommerceAdapter(
    push: (payload: YandexEcommercePayload) => void,
): EcommerceAnalyticsAdapter {
    return {
        track(event) {
            push(toYandexPayload(event));
        },
    };
}
