type MediaLike = {
    url?: string | null;
    mime?: string | null;
};

const cleanText = (value?: string | null) =>
    value?.replace(/\s+/g, " ").trim() || "";

export const extractPlainText = (value: unknown): string => {
    if (!value) return "";

    if (typeof value === "string") {
        return cleanText(value);
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => extractPlainText(item))
            .filter(Boolean)
            .join(" ")
            .trim();
    }

    if (typeof value !== "object") {
        return "";
    }

    return Object.values(value as Record<string, unknown>)
        .map((item) => extractPlainText(item))
        .filter(Boolean)
        .join(" ")
        .trim();
};

export const extractFirstImageUrl = (value: unknown): string | undefined => {
    if (!value) return undefined;

    if (Array.isArray(value)) {
        for (const item of value) {
            const image = extractFirstImageUrl(item);
            if (image) return image;
        }

        return undefined;
    }

    if (typeof value !== "object") {
        return undefined;
    }

    const maybeMedia = value as MediaLike;

    if (
        typeof maybeMedia.url === "string" &&
        typeof maybeMedia.mime === "string" &&
        maybeMedia.mime.startsWith("image")
    ) {
        return maybeMedia.url;
    }

    for (const nestedValue of Object.values(value as Record<string, unknown>)) {
        const image = extractFirstImageUrl(nestedValue);
        if (image) return image;
    }

    return undefined;
};
