import type {
  StoreProductOptionValue,
  StoreProductVariant,
} from "@medusajs/types";

export const sortSizeOptions = (
  list: StoreProductOptionValue[],
  variants: StoreProductVariant[],
) => {
  return list.toSorted((a, b) => {
    const sizeVariantA = variants?.find((v) =>
      v.options?.find((o) => o.id === a.id),
    );
    const sizeVariantB = variants?.find((v) =>
      v.options?.find((o) => o.id === b.id),
    );
    if (!sizeVariantA || !sizeVariantB) return 0;

    return (
      ((sizeVariantA?.metadata?.sequence as number) ?? 0) -
      ((sizeVariantB?.metadata?.sequence as number) ?? 0)
    );
  });
};
