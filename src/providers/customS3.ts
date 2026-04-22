import { defineProvider } from "@nuxt/image/runtime";

const CDN_DOMAIN = process.env.NUXT_PUBLIC_CDN_DOMAIN;
const CDN_BASE_URL = `https://${CDN_DOMAIN}`;

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

function normalizeSourcePath(src: string) {
    const url = new URL(src);
    if (url.hostname === CDN_DOMAIN) {
        console.log(url.hostname, CDN_DOMAIN);
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

            const normalizedPath = normalizeSourcePath(src);
            const pathname = buildIossPath(normalizedPath, {
                width: modifiers.width?.toString(),
                height: modifiers.height?.toString(),
                quality: modifiers.quality?.toString(),
            });

            return {
                url: `${CDN_BASE_URL}${pathname}`,
            };
        } catch {
            return {
                url: src,
            };
        }
    },
});
