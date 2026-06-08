import type { LocationQueryValue, LocationQueryValueRaw } from "vue-router";

export const INDEXABLE_ROBOTS =
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
export const NOINDEX_FOLLOW_ROBOTS = "noindex, follow";

const normalizeQueryValue = (
    value: LocationQueryValue | LocationQueryValueRaw | null | undefined,
) => {
    if (Array.isArray(value)) {
        return value.find((item) => item !== null && item !== undefined && item !== "");
    }

    return value;
};

export const hasMeaningfulQueryValue = (
    value: LocationQueryValue | LocationQueryValueRaw | null | undefined,
) => {
    return normalizeQueryValue(value) !== null && normalizeQueryValue(value) !== undefined;
};
