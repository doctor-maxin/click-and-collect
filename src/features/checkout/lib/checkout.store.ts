import { defineStore } from "pinia";
import {
    EMPTY_CHECKOUT_RECIPIENT,
    normalizeCheckoutRecipient,
    type CheckoutLastOrder,
    type CheckoutLastOrderItem,
    type CheckoutRecipient,
    type CheckoutRecipientField,
    type PickupStore,
} from "#shared/types/checkout";

export const CHECKOUT_STORAGE_KEY = "storefront-checkout";

function normalizePickupStore(value: unknown): PickupStore | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const store = value as Partial<PickupStore>;
    const coordinates = store.coordinates;

    if (
        typeof store.id !== "string" ||
        typeof store.name !== "string" ||
        typeof store.address !== "string" ||
        typeof store.city !== "string" ||
        typeof store.workingTime !== "string" ||
        !Array.isArray(coordinates) ||
        coordinates.length !== 2 ||
        !Number.isFinite(coordinates[0]) ||
        !Number.isFinite(coordinates[1])
    ) {
        return null;
    }

    return {
        id: store.id,
        name: store.name,
        address: store.address,
        city: store.city,
        workingTime: store.workingTime,
        phone: typeof store.phone === "string" ? store.phone : null,
        phoneExtension:
            typeof store.phoneExtension === "string"
                ? store.phoneExtension
                : null,
        coordinates: [coordinates[0], coordinates[1]],
    };
}

function normalizeLastOrder(value: unknown): CheckoutLastOrder | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const order = value as Partial<CheckoutLastOrder>;
    const pickupStore = normalizePickupStore(order.pickupStore);

    if (
        typeof order.id !== "string" ||
        typeof order.displayId !== "string" ||
        (order.email !== null && typeof order.email !== "string") ||
        typeof order.currencyCode !== "string" ||
        typeof order.total !== "number" ||
        !Number.isFinite(order.total) ||
        typeof order.createdAt !== "string" ||
        !Array.isArray(order.items) ||
        !pickupStore
    ) {
        return null;
    }

    const items: CheckoutLastOrderItem[] = [];

    for (const item of order.items) {
        const normalizedItem = normalizeLastOrderItem(item);

        if (!normalizedItem) return null;
        items.push(normalizedItem);
    }

    return {
        id: order.id,
        displayId: order.displayId,
        email: order.email,
        currencyCode: order.currencyCode,
        total: order.total,
        items,
        pickupStore,
        createdAt: order.createdAt,
    };
}

function normalizeLastOrderItem(value: unknown): CheckoutLastOrderItem | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const item = value as Partial<CheckoutLastOrderItem>;

    if (
        typeof item.id !== "string" ||
        typeof item.title !== "string" ||
        (item.productHandle !== null &&
            typeof item.productHandle !== "string") ||
        (item.variantTitle !== null && typeof item.variantTitle !== "string") ||
        (item.thumbnail !== null && typeof item.thumbnail !== "string") ||
        typeof item.quantity !== "number" ||
        !Number.isFinite(item.quantity) ||
        typeof item.total !== "number" ||
        !Number.isFinite(item.total)
    ) {
        return null;
    }

    return {
        id: item.id,
        title: item.title,
        productHandle: item.productHandle,
        variantTitle: item.variantTitle,
        thumbnail: item.thumbnail,
        quantity: item.quantity,
        total: item.total,
    };
}

export const useCheckoutStore = defineStore("checkout", {
    state: () => ({
        recipient: { ...EMPTY_CHECKOUT_RECIPIENT } as CheckoutRecipient,
        pickupStore: null as PickupStore | null,
        lastOrder: null as CheckoutLastOrder | null,
    }),
    actions: {
        setRecipientField(field: CheckoutRecipientField, value: string) {
            this.recipient = {
                ...this.recipient,
                [field]: value,
            };
        },
        setRecipient(recipient: Partial<CheckoutRecipient>) {
            this.recipient = normalizeCheckoutRecipient({
                ...this.recipient,
                ...recipient,
            });
        },
        // Authentication integrations can call this after Yandex ID returns a profile.
        prefillRecipient(recipient: Partial<CheckoutRecipient>) {
            const nextRecipient = normalizeCheckoutRecipient(recipient);

            this.recipient = {
                firstName: nextRecipient.firstName || this.recipient.firstName,
                lastName: nextRecipient.lastName || this.recipient.lastName,
                email: nextRecipient.email || this.recipient.email,
                phone: nextRecipient.phone || this.recipient.phone,
            };
        },
        setPickupStore(store: PickupStore) {
            this.pickupStore = normalizePickupStore(store);
        },
        setLastOrder(order: CheckoutLastOrder) {
            this.lastOrder = normalizeLastOrder(order);
        },
        clearLastOrder() {
            this.lastOrder = null;
        },
    },
    persist: {
        key: CHECKOUT_STORAGE_KEY,
        storage: piniaPluginPersistedstate.localStorage(),
        pick: ["recipient", "pickupStore", "lastOrder"],
    },
});
