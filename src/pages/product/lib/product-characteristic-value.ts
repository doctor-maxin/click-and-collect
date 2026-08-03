const EMPTY_CHARACTERISTIC_VALUES = new Set(["n/a", "N/a", "не применим"]);

type CharacteristicPrimitive = string | number | boolean;

function isCharacteristicPrimitive(
    value: unknown,
): value is CharacteristicPrimitive {
    return (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    );
}

function normalizeCharacteristicPart(value: CharacteristicPrimitive) {
    const normalized = String(value).trim();
    if (!normalized) return null;
    if (EMPTY_CHARACTERISTIC_VALUES.has(normalized.toLowerCase())) return null;

    return normalized;
}

export function normalizeProductCharacteristicValue(value: unknown) {
    const values = Array.isArray(value) ? value : [value];
    const normalizedValues = values
        .filter(isCharacteristicPrimitive)
        .map(normalizeCharacteristicPart)
        .filter((item): item is string => Boolean(item));

    return normalizedValues.length ? normalizedValues.join(", ") : null;
}
