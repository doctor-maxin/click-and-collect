import { defineStore } from "pinia";
import type { StoreCustomerAddress } from "@medusajs/types";
import {
    EMPTY_CHECKOUT_RECIPIENT,
    normalizeCheckoutRecipient,
    type CheckoutLastOrder,
    type CheckoutLastOrderItem,
    type CheckoutRecipient,
    type CheckoutRecipientField,
    type PickupStore,
} from "#shared/types/checkout";
import { getPickupStoreMetadata } from "#shared/types/checkout";

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

function getPreferredPickupStore(addresses: StoreCustomerAddress[]) {
    const pickupAddresses = addresses
        .map((address) => ({
            address,
            store: getPickupStoreFromMetadata(address.metadata),
        }))
        .filter(
            (
                value,
            ): value is { address: StoreCustomerAddress; store: PickupStore } =>
                Boolean(value.store),
        );

    return (
        pickupAddresses.find(({ address }) => address.is_default_shipping)
            ?.store ?? pickupAddresses[0]?.store ?? null
    );
}

function getPreferredPickupAddress(addresses: StoreCustomerAddress[]) {
    const pickupAddresses = addresses.filter((address) =>
        Boolean(getPickupStoreFromMetadata(address.metadata)),
    );

    return (
        pickupAddresses.find((address) => address.is_default_shipping) ??
        pickupAddresses[0] ??
        null
    );
}

function getPickupStoreFromMetadata(metadata: unknown): PickupStore | null {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
        return null;
    }

    const pickupStore = (metadata as Record<string, unknown>).pickup_store;
    if (
        !pickupStore ||
        typeof pickupStore !== "object" ||
        Array.isArray(pickupStore)
    ) {
        return null;
    }

    const value = pickupStore as Record<string, unknown>;
    const coordinates = value.coordinates;
    if (
        typeof value.id !== "string" ||
        typeof value.name !== "string" ||
        typeof value.address !== "string" ||
        typeof value.city !== "string" ||
        typeof value.working_time !== "string" ||
        !coordinates ||
        typeof coordinates !== "object" ||
        Array.isArray(coordinates)
    ) {
        return null;
    }

    const coordinateValue = coordinates as Record<string, unknown>;
    const longitude = Number(coordinateValue.longitude);
    const latitude = Number(coordinateValue.latitude);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        return null;
    }

    return {
        id: value.id,
        name: value.name,
        address: value.address,
        city: value.city,
        workingTime: value.working_time,
        phone: typeof value.phone === "string" ? value.phone : null,
        phoneExtension:
            typeof value.phone_extension === "string"
                ? value.phone_extension
                : null,
        coordinates: [longitude, latitude],
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
        setRecipientFromCustomer(recipient: Partial<CheckoutRecipient>) {
            this.recipient = normalizeCheckoutRecipient(recipient);
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
        async restorePreferredPickupStore() {
            const { addresses } =
                await useMedusaClient().store.customer.listAddress({
                    limit: 100,
                });
            const pickupStore = getPreferredPickupStore(addresses);

            if (pickupStore) this.setPickupStore(pickupStore);
        },
        async saveCustomerCheckoutProfile(
            recipient: CheckoutRecipient,
            pickupStore: PickupStore,
        ) {
            const client = useMedusaClient();
            const { customer: updatedCustomer } =
                await client.store.customer.update({
                    first_name: recipient.firstName,
                    last_name: recipient.lastName,
                    phone: recipient.phone,
                });
            const customer = await this.savePreferredPickupStore(
                pickupStore,
                recipient,
            );

            return customer ?? updatedCustomer;
        },
        async savePreferredPickupStore(
            pickupStore: PickupStore,
            recipient?: Partial<CheckoutRecipient>,
        ) {
            const client = useMedusaClient();
            const { addresses } = await client.store.customer.listAddress({
                limit: 100,
            });
            const preferredAddress = getPreferredPickupAddress(addresses);
            const address = {
                ...(recipient?.firstName
                    ? { first_name: recipient.firstName }
                    : {}),
                ...(recipient?.lastName
                    ? { last_name: recipient.lastName }
                    : {}),
                ...(recipient?.phone ? { phone: recipient.phone } : {}),
                address_name: `Самовывоз: ${pickupStore.name}`,
                address_1: pickupStore.address,
                city: pickupStore.city,
                country_code: "ru",
                is_default_shipping: true,
                metadata: {
                    ...(preferredAddress?.metadata ?? {}),
                    pickup_store: getPickupStoreMetadata(pickupStore),
                },
            };

            const { customer } = preferredAddress
                ? await client.store.customer.updateAddress(
                      preferredAddress.id,
                      address,
                  )
                : await client.store.customer.createAddress(address);

            return customer;
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
