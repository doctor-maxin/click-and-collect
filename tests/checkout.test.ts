import assert from "node:assert/strict";
import test from "node:test";
import {
    createCheckoutLastOrder,
    getCheckoutRecipientErrors,
    getPickupStoreMetadata,
    formatRussianPhone,
    normalizeCheckoutRecipient,
    type PickupStore,
} from "../shared/types/checkout.ts";

const pickupStore: PickupStore = {
    id: "42",
    name: "СИН, ТЦ Тест",
    address: "Москва, Тестовая улица, 1",
    city: "Москва",
    workingTime: "10:00-22:00",
    phone: "74950000000",
    phoneExtension: null,
    coordinates: [37.6, 55.7],
};

test("normalizes a checkout recipient before it is sent to Medusa", () => {
    const recipient = normalizeCheckoutRecipient({
        firstName: "  Ирина ",
        lastName: " Иванова ",
        email: " IRINA@EXAMPLE.RU ",
        phone: " +7 900 000-00-00 ",
    });

    assert.deepEqual(recipient, {
        firstName: "Ирина",
        lastName: "Иванова",
        email: "irina@example.ru",
        phone: "+7 (900) 000-00-00",
    });
    assert.deepEqual(getCheckoutRecipientErrors(recipient), {});
});

test("requires all recipient fields before checkout", () => {
    const errors = getCheckoutRecipientErrors(
        normalizeCheckoutRecipient({}),
    );

    assert.deepEqual(errors, {
        firstName: "Укажите имя получателя.",
        lastName: "Укажите фамилию получателя.",
        phone: "Укажите номер телефона.",
        email: "Укажите email для подтверждения заказа.",
    });
});

test("formats Russian phone input from typing or paste", () => {
    assert.equal(formatRussianPhone("89000000000"), "+7 (900) 000-00-00");
    assert.equal(formatRussianPhone("9000000000"), "+7 (900) 000-00-00");
    assert.equal(formatRussianPhone("+7 (900) 000-00-00123"), "+7 (900) 000-00-00");
    assert.equal(formatRussianPhone(""), "");
});

test("keeps pickup location data in the cart metadata payload", () => {
    assert.deepEqual(getPickupStoreMetadata(pickupStore), {
        id: "42",
        name: "СИН, ТЦ Тест",
        address: "Москва, Тестовая улица, 1",
        city: "Москва",
        working_time: "10:00-22:00",
        phone: "74950000000",
        coordinates: {
            longitude: 37.6,
            latitude: 55.7,
        },
    });
});

test("caches the completed order response for the thank-you page", () => {
    const order = createCheckoutLastOrder(
        {
            id: "order_01JQX9",
            display_id: 2,
            email: "irina@example.ru",
            currency_code: "rub",
            total: 12500,
            created_at: "2026-08-06T12:00:00.000Z",
            items: [
                {
                    id: "item_01JQX9",
                    title: "Футболка",
                    product_title: "Футболка МЕЧ",
                    product_handle: "futbolka-mech",
                    variant_title: "M",
                    thumbnail: "https://example.test/shirt.jpg",
                    quantity: 2,
                    total: 12500,
                },
            ],
        },
        pickupStore,
    );

    assert.deepEqual(order, {
        id: "order_01JQX9",
        displayId: "2",
        email: "irina@example.ru",
        currencyCode: "rub",
        total: 12500,
        items: [
            {
                id: "item_01JQX9",
                title: "Футболка МЕЧ",
                productHandle: "futbolka-mech",
                variantTitle: "M",
                thumbnail: "https://example.test/shirt.jpg",
                quantity: 2,
                total: 12500,
            },
        ],
        pickupStore,
        createdAt: "2026-08-06T12:00:00.000Z",
    });
});

test("uses the cart snapshot when Medusa completes an order without items", () => {
    const order = createCheckoutLastOrder(
        {
            id: "order_01JQX10",
            email: "irina@example.ru",
            currency_code: "rub",
            total: 2500,
            created_at: "2026-08-06T12:00:00.000Z",
            items: [],
        },
        pickupStore,
        [
            {
                id: "item_01JQX10",
                title: "Свитшот",
                product_title: "Свитшот SIN",
                quantity: 1,
                thumbnail: null,
                total: 2500,
            },
        ],
    );

    assert.deepEqual(order.items, [
        {
            id: "item_01JQX10",
            title: "Свитшот SIN",
            productHandle: null,
            variantTitle: null,
            thumbnail: null,
            quantity: 1,
            total: 2500,
        },
    ]);
});
