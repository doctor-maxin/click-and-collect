import { defineStore } from "pinia";
import type { IProductState } from "../model/product-store.model";
import type { StoreProductVariant } from "@medusajs/types";

export const useProductStore = defineStore("_product", {
    state: (): IProductState => ({
        product: null,
        color: null,
        size: null,
        price: null,
        oldPrice: null,
        discount: null,
    }),
    getters: {
        variant: (state) => {
            return state.product?.variants?.find(
                (variant) =>
                    variant.options?.some(
                        (o) =>
                            o.option_id === state.color?.option_id &&
                            o.value === state.color?.value,
                    ) &&
                    variant.options?.some(
                        (o) =>
                            o.option_id === state.size?.option_id &&
                            o.value === state.size?.value,
                    ),
            );
        },
    },
    actions: {
        setPrice(price: number) {
            this.price = price;
        },
        setOldPrice(oldPrice: number) {
            this.oldPrice = oldPrice;
        },
        setDiscount(discount: number) {
            this.discount = discount;
        },
        setProduct(product: IProductState["product"]) {
            this.product = product;
        },
        setVariant(variant: StoreProductVariant) {
            const color =
                variant.options?.find((o) => o.option?.title === "color") ??
                null;
            const size =
                variant.options?.find((o) => o.option?.title === "size") ??
                null;
            this.color = color;
            this.size = size;
        },
        selectColor(color: IProductState["color"]) {
            this.color = color;
        },
        selectSize(size: IProductState["size"]) {
            this.size = size;
        },
    },
});
