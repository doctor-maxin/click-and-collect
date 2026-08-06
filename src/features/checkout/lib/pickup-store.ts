import type { PickupStore } from "#shared/types/checkout";
import type { MapPoint } from "~/widgets/render-blocks/ui/blocks/map/model/map-point.model";

function normalizeText(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeIdentifier(value: unknown) {
    if (typeof value !== "string" && typeof value !== "number") return "";

    return String(value).trim();
}

function normalizeNumber(value: unknown) {
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : null;
}

function getPhone(point: MapPoint) {
    const phone = point.phone;

    if (!phone || typeof phone !== "object") {
        return { number: null, extension: null };
    }

    const number = normalizeIdentifier(phone.number);
    const extension = normalizeIdentifier(phone.ext);

    return {
        number: number || null,
        extension: extension || null,
    };
}

export function toPickupStore(point: MapPoint): PickupStore | null {
    const longitude = normalizeNumber(point.coordinates?.lon);
    const latitude = normalizeNumber(point.coordinates?.lat);
    const id = normalizeIdentifier(point["company-id"]);
    const name = normalizeText(point.name);
    const address = normalizeText(point.address);
    const city = normalizeText(point.city);

    if (
        longitude === null ||
        latitude === null ||
        !id ||
        !name ||
        !address ||
        !city
    ) {
        return null;
    }

    const phone = getPhone(point);

    return {
        id,
        name,
        address,
        city,
        workingTime: normalizeText(point["working-time"]),
        phone: phone.number,
        phoneExtension: phone.extension,
        coordinates: [longitude, latitude],
    };
}

export function normalizePickupStores(points: MapPoint[] | null | undefined) {
    return (points ?? [])
        .map(toPickupStore)
        .filter((point): point is PickupStore => Boolean(point));
}

export function formatPickupPhone(store: PickupStore) {
    if (!store.phone) return null;

    return store.phoneExtension
        ? `+${store.phone} (доб. ${store.phoneExtension})`
        : `+${store.phone}`;
}
