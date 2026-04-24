import type { StoreProductCategory } from "@medusajs/types";

export const collectCategoryDescendantIds = (
    categories: StoreProductCategory[],
): Set<string> => {
    const ids = new Set<string>();

    for (const category of categories) {
        ids.add(category.id);

        for (const childId of collectCategoryDescendantIds(
            category.category_children ?? [],
        )) {
            ids.add(childId);
        }
    }

    return ids;
};

export const getCategoryTreeIdsByHandle = (
    categories: StoreProductCategory[],
    rootHandle: string,
    includeRoot = true,
): string[] => {
    const rootCategory = categories.find((category) => category.handle === rootHandle);
    if (!rootCategory) return [];

    const ids = collectCategoryDescendantIds(rootCategory.category_children ?? []);
    if (includeRoot) ids.add(rootCategory.id);

    return Array.from(ids);
};
