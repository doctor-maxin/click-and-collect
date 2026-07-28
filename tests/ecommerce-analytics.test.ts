import assert from "node:assert/strict";
import test from "node:test";
import type { StoreProduct } from "@medusajs/types";
import { createEcommerceProduct } from "../shared/lib/ecommerce-product.ts";
import { createEcommerceAnalytics } from "../src/features/ecommerce-analytics/lib/ecommerce-analytics.ts";
import { createYandexMetricaEcommerceAdapter } from "../src/features/ecommerce-analytics/lib/yandex-metrica-adapter.ts";

test("normalizes a Medusa product for ecommerce providers", () => {
    const product = {
        id: "prod_1",
        external_id: "external_1",
        title: "Футболка",
        categories: [{ name: "Одежда" }, { name: "Футболки" }],
        variants: [
            {
                sku: "SKU-1",
                title: "Красная / M",
                calculated_price: {
                    calculated_amount: 900,
                    original_amount: 1000,
                },
            },
        ],
    } as StoreProduct;

    assert.deepEqual(
        createEcommerceProduct(product, {
            brand: "FES",
            list: "Каталог",
            position: 2,
        }),
        {
            id: "external_1",
            name: "Футболка",
            brand: "FES",
            category: "Одежда / Футболки",
            discount: 100,
            list: "Каталог",
            position: 2,
            price: 900,
            quantity: undefined,
            variant: "SKU-1",
        },
    );
});

test("maps provider-neutral events to Yandex Ecommerce payloads", () => {
    const payloads: unknown[] = [];
    const adapter = createYandexMetricaEcommerceAdapter((payload) => {
        payloads.push(payload);
    });
    const products = [{ id: "SKU-1", name: "Футболка", price: 900 }];

    adapter.track({
        type: "view_item_list",
        currency: "RUB",
        products,
    });
    adapter.track({ type: "select_item", currency: "RUB", products });
    adapter.track({ type: "view_item", currency: "RUB", products });
    adapter.track({ type: "add_to_cart", currency: "RUB", products });
    adapter.track({ type: "remove_from_cart", currency: "RUB", products });
    adapter.track({
        type: "purchase",
        currency: "RUB",
        products,
        transaction: { id: "order_1", revenue: 900 },
    });

    assert.deepEqual(payloads, [
        {
            ecommerce: {
                currencyCode: "RUB",
                impressions: products,
            },
        },
        {
            ecommerce: {
                currencyCode: "RUB",
                click: { products },
            },
        },
        {
            ecommerce: {
                currencyCode: "RUB",
                detail: { products },
            },
        },
        {
            ecommerce: {
                currencyCode: "RUB",
                add: { products },
            },
        },
        {
            ecommerce: {
                currencyCode: "RUB",
                remove: { products },
            },
        },
        {
            ecommerce: {
                currencyCode: "RUB",
                purchase: {
                    actionField: {
                        id: "order_1",
                        coupon: undefined,
                        revenue: 900,
                        goal_id: undefined,
                    },
                    products,
                },
            },
        },
    ]);
});

test("keeps product list context between click and detail events", () => {
    const events: unknown[] = [];
    const analytics = createEcommerceAnalytics([
        {
            track(event) {
                events.push(event);
            },
        },
    ]);

    analytics.track({
        type: "select_item",
        currency: "RUB",
        products: [
            {
                id: "product_1",
                name: "Футболка",
                list: "Поиск",
                position: 3,
            },
        ],
    });
    analytics.track({
        type: "view_item",
        currency: "RUB",
        products: [{ id: "product_1", name: "Футболка" }],
    });

    assert.deepEqual(events[1], {
        type: "view_item",
        currency: "RUB",
        products: [
            {
                id: "product_1",
                name: "Футболка",
                list: "Поиск",
                position: 3,
            },
        ],
    });
});
