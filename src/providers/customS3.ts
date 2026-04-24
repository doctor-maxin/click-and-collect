import { defineProvider } from "@nuxt/image/runtime";

function stripIossSegment(pathname: string) {
    return pathname.replace(/^\/ioss\([^)]+\)(?=\/)/, "");
}

function buildResizeValue(width?: string | number, height?: string | number) {
    if (!width && !height) {
        return undefined;
    }

    return `${width ?? ""}x${height ?? ""}`;
}

function buildIossPath(
    pathname: string,
    modifiers: Record<string, string | number | undefined>,
) {
    const operations: string[] = [];
    const resize = buildResizeValue(modifiers.width, modifiers.height);

    if (resize) {
        operations.push(`resize=${resize}`);
    }

    if (modifiers.quality) {
        operations.push(`quality=${modifiers.quality}`);
    }

    if (!operations.length) {
        return pathname;
    }

    return `/ioss(${operations.join(",")})${pathname}`;
}

function normalizeSourcePath(src: string, cdnDomain?: string) {
    const url = new URL(src);

    if (cdnDomain && url.hostname === cdnDomain) {
        return stripIossSegment(url.pathname);
    }

    const pathParts = url.pathname.split("/").filter(Boolean);
    const relevantParts = [
        pathParts[2],
        pathParts[3],
        pathParts[4],
        pathParts[7],
    ].filter(Boolean);

    if (!relevantParts.length) {
        return url.pathname;
    }

    const fileName = relevantParts[relevantParts.length - 1]!;
    let cleanFileName = fileName.replace(/_\d+px(\.\w+)$/, "$1");
    cleanFileName = cleanFileName.replace(/\.webp$/i, ".jpg");
    relevantParts[relevantParts.length - 1] = cleanFileName;

    return `/${relevantParts.join("/")}`;
}

export default defineProvider<{ baseURL?: string }>({
    getImage(src: string, { modifiers = {} }) {
        try {
            if (!src.startsWith("http://") && !src.startsWith("https://")) {
                return { url: src };
            }

            const { public: publicConfig } = useRuntimeConfig();
            const cdnDomain = publicConfig?.cdnDomain as string | undefined;
            const cdnBaseUrl = cdnDomain ? `https://${cdnDomain}` : "";
            const normalizedPath = normalizeSourcePath(src, cdnDomain);
            const pathname = buildIossPath(normalizedPath, {
                width: modifiers.width?.toString(),
                height: modifiers.height?.toString(),
                quality: modifiers.quality?.toString(),
            });

            return {
                url: cdnBaseUrl ? `${cdnBaseUrl}${pathname}` : src,
            };
        } catch {
            return {
                url: src,
            };
        }
    },
});
