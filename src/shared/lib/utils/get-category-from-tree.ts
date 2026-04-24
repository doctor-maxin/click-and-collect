import type { StoreProductCategory } from "@medusajs/types";

export function getCategoryFromTree(
    handle: string,
    categories: StoreProductCategory[],
): (StoreProductCategory & { mpath: string }) | null {
    for (const category of categories) {
        if (category.handle === handle) {
            return category as StoreProductCategory & { mpath: string };
        }
        if (category.category_children?.length) {
            const found = getCategoryFromTree(
                handle,
                category.category_children,
            );
            if (found) return found;
        }
    }

    return null;
}
