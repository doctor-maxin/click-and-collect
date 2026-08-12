export type CheckoutRecipient = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
};

export type CheckoutRecipientField = keyof CheckoutRecipient;

export type CheckoutRecipientErrors = Partial<
    Record<CheckoutRecipientField, string>
>;

export type PickupStore = {
    id: string;
    name: string;
    address: string;
    city: string;
    workingTime: string;
    phone: string | null;
    phoneExtension: string | null;
    coordinates: [number, number];
};

export type CheckoutCompletedOrderItem = {
    id: string;
    title: string;
    product_title?: string | null;
    product_handle?: string | null;
    variant_title?: string | null;
    thumbnail: string | null;
    quantity: number;
    total: number;
};

export type CheckoutCompletedOrder = {
    id: string;
    display_id?: number;
    custom_display_id?: string;
    email: string | null;
    currency_code: string;
    total: number;
    created_at: string | Date;
    items: CheckoutCompletedOrderItem[] | null;
};

export type CheckoutLastOrderItem = {
    id: string;
    title: string;
    productHandle: string | null;
    variantTitle: string | null;
    thumbnail: string | null;
    quantity: number;
    total: number;
};

export type CheckoutLastOrder = {
    id: string;
    displayId: string;
    email: string | null;
    currencyCode: string;
    total: number;
    items: CheckoutLastOrderItem[];
    pickupStore: PickupStore;
    createdAt: string;
};

export const EMPTY_CHECKOUT_RECIPIENT: CheckoutRecipient = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
};

function normalizeValue(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

export function formatRussianPhone(value: unknown) {
    const digits = normalizeValue(value).replace(/\D/g, "");
    if (!digits) return "";

    const nationalNumber = (digits.startsWith("7") || digits.startsWith("8")
        ? digits.slice(1)
        : digits
    ).slice(0, 10);

    if (!nationalNumber) return "+7";

    let formatted = `+7 (${nationalNumber.slice(0, 3)}`;

    if (nationalNumber.length >= 3) {
        formatted += ")";
    }

    if (nationalNumber.length > 3) {
        formatted += ` ${nationalNumber.slice(3, 6)}`;
    }

    if (nationalNumber.length > 6) {
        formatted += `-${nationalNumber.slice(6, 8)}`;
    }

    if (nationalNumber.length > 8) {
        formatted += `-${nationalNumber.slice(8, 10)}`;
    }

    return formatted;
}

export function normalizeCheckoutRecipient(
    recipient: Partial<CheckoutRecipient> | null | undefined,
): CheckoutRecipient {
    return {
        firstName: normalizeValue(recipient?.firstName),
        lastName: normalizeValue(recipient?.lastName),
        email: normalizeValue(recipient?.email).toLowerCase(),
        phone: formatRussianPhone(recipient?.phone),
    };
}

export function getCheckoutRecipientErrors(
    recipient: CheckoutRecipient,
): CheckoutRecipientErrors {
    const errors: CheckoutRecipientErrors = {};

    if (!recipient.firstName) {
        errors.firstName = "Укажите имя получателя.";
    }

    if (!recipient.lastName) {
        errors.lastName = "Укажите фамилию получателя.";
    }

    if (!recipient.phone) {
        errors.phone = "Укажите номер телефона.";
    } else if (recipient.phone.replace(/\D/g, "").length !== 11) {
        errors.phone = "Проверьте номер телефона.";
    }

    if (!recipient.email) {
        errors.email = "Укажите email для подтверждения заказа.";
    } else if (!/^\S+@\S+\.\S+$/.test(recipient.email)) {
        errors.email = "Проверьте email.";
    }

    return errors;
}

export function getPickupStoreMetadata(store: PickupStore) {
    return {
        id: store.id,
        name: store.name,
        address: store.address,
        city: store.city,
        working_time: store.workingTime,
        phone: store.phone,
        phone_extension: store.phoneExtension,
        coordinates: {
            longitude: store.coordinates[0],
            latitude: store.coordinates[1],
        },
    };
}

export function createCheckoutLastOrder(
    order: CheckoutCompletedOrder,
    pickupStore: PickupStore,
    fallbackItems: CheckoutCompletedOrderItem[] = [],
): CheckoutLastOrder {
    const items = order.items?.length ? order.items : fallbackItems;

    return {
        id: order.id,
        displayId:
            order.custom_display_id?.trim() ||
            String(order.display_id ?? order.id),
        email: order.email,
        currencyCode: order.currency_code,
        total: order.total,
        items: items.map((item) => ({
            id: item.id,
            title: item.product_title?.trim() || item.title,
            productHandle: item.product_handle?.trim() || null,
            variantTitle: item.variant_title?.trim() || null,
            thumbnail: item.thumbnail,
            quantity: item.quantity,
            total: item.total,
        })),
        pickupStore,
        createdAt:
            order.created_at instanceof Date
                ? order.created_at.toISOString()
                : order.created_at,
    };
}
