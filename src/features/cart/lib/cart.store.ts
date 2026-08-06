import { defineStore } from "pinia";
import type { StoreCart, StoreRegion } from "@medusajs/types";
import type { CheckoutRecipient, PickupStore } from "#shared/types/checkout";
import { getPickupStoreMetadata } from "#shared/types/checkout";

export const CART_STORAGE_KEY = "storefront-cart";

const CART_QUERY = {
    fields: "*items,*region,*shipping_methods,*payment_collection,*items.product,*items.variant,+items.total",
};

const PICKUP_OPTION_PATTERN = /самовывоз|pickup|click[\s-]?and[\s-]?collect/i;
const SYSTEM_PAYMENT_PROVIDER_PATTERN = /^pp_system(?:_|$)/;

function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) return error.message;

    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
    ) {
        return error.message;
    }

    return "Не удалось обновить корзину. Повторите попытку.";
}

function normalizeQuantity(quantity: number) {
    if (!Number.isFinite(quantity)) return 1;

    return Math.max(1, Math.floor(quantity));
}

function normalizeCartId(value: unknown) {
    if (typeof value !== "string") return null;

    return value.trim() || null;
}

function normalizeMetadata(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    return { ...value };
}

function getPickupShippingOptionId(
    options: Array<{
        id: string;
        name: string;
        type?: {
            code?: string;
            label?: string;
            description?: string;
        };
    }>,
    configuredOptionId: unknown,
) {
    const configuredId =
        typeof configuredOptionId === "string"
            ? configuredOptionId.trim()
            : "";

    if (configuredId) {
        const configuredOption = options.find(
            (option) => option.id === configuredId,
        );

        if (configuredOption) return configuredOption.id;
    }

    const pickupOption = options.find((option) =>
        [
            option.name,
            option.type?.code,
            option.type?.label,
            option.type?.description,
        ].some((value) =>
            typeof value === "string" ? PICKUP_OPTION_PATTERN.test(value) : false,
        ),
    );

    if (pickupOption) return pickupOption.id;

    return options.length === 1 ? options[0]?.id ?? null : null;
}

function getPickupPaymentProviderId(
    providers: ReadonlyArray<{ id: string }>,
    configuredProviderId: unknown,
) {
    const configuredId =
        typeof configuredProviderId === "string"
            ? configuredProviderId.trim()
            : "";

    if (configuredId) {
        return providers.some((provider) => provider.id === configuredId)
            ? configuredId
            : null;
    }

    return (
        providers.find((provider) =>
            SYSTEM_PAYMENT_PROVIDER_PATTERN.test(provider.id),
        )?.id ?? null
    );
}

export const useCartStore = defineStore("cart", {
    state: () => ({
        cartId: null as string | null,
        cart: null as StoreCart | null,
        isOpen: false,
        isHydrated: false,
        isRestoring: false,
        isUpdating: false,
        isCheckingOut: false,
        errorMessage: null as string | null,
    }),
    getters: {
        items: (state) => state.cart?.items ?? [],
        itemCount: (state) =>
            (state.cart?.items ?? []).reduce(
                (count, item) => count + item.quantity,
                0,
            ),
    },
    actions: {
        setCart(cart: StoreCart) {
            this.cart = cart;
            this.cartId = cart.id;
        },
        clearCart() {
            this.cart = null;
            this.cartId = null;
        },
        hydrateCartId(value: unknown) {
            const cartId = normalizeCartId(value);
            if (this.cartId === cartId) return;

            this.cartId = cartId;
            this.cart = null;
            this.isHydrated = false;
        },
        async restoreCart() {
            if (this.isHydrated) return this.cart;

            if (!this.cartId) {
                this.isHydrated = true;
                return null;
            }

            this.isRestoring = true;

            try {
                const client = useMedusaClient();
                const { cart } = await client.store.cart.retrieve(
                    this.cartId,
                    CART_QUERY,
                );

                this.setCart(cart);
                return cart;
            } catch {
                // A stale cart must not block creating a new one.
                this.clearCart();
                return null;
            } finally {
                this.isRestoring = false;
                this.isHydrated = true;
            }
        },
        async openCart() {
            this.isOpen = true;
            await this.restoreCart();
        },
        closeCart() {
            this.isOpen = false;
        },
        async ensureCart() {
            if (this.cart) return this.cart;

            const restoredCart = await this.restoreCart();
            if (restoredCart) return restoredCart;

            const { data: region } = useNuxtData<StoreRegion>("region");
            const client = useMedusaClient();
            const { cart } = await client.store.cart.create(
                region.value?.id ? { region_id: region.value.id } : {},
                CART_QUERY,
            );

            this.setCart(cart);
            this.isHydrated = true;
            return cart;
        },
        async addVariant(variantId: string, quantity = 1) {
            const normalizedVariantId = variantId.trim();
            if (!normalizedVariantId) {
                throw new Error("Не выбран вариант товара.");
            }

            this.errorMessage = null;
            this.isUpdating = true;

            try {
                const cart = await this.ensureCart();
                const nextQuantity = normalizeQuantity(quantity);
                const existingItem = cart.items?.find(
                    (item) => item.variant_id === normalizedVariantId,
                );
                const client = useMedusaClient();
                const response = existingItem
                    ? await client.store.cart.updateLineItem(
                          cart.id,
                          existingItem.id,
                          {
                              quantity: existingItem.quantity + nextQuantity,
                          },
                          CART_QUERY,
                      )
                    : await client.store.cart.createLineItem(
                          cart.id,
                          {
                              variant_id: normalizedVariantId,
                              quantity: nextQuantity,
                          },
                          CART_QUERY,
                      );

                this.setCart(response.cart);
                return response.cart;
            } catch (error) {
                this.errorMessage = getErrorMessage(error);
                throw error;
            } finally {
                this.isUpdating = false;
            }
        },
        async updateLineItemQuantity(lineItemId: string, quantity: number) {
            if (!this.cart) {
                throw new Error("Корзина не найдена.");
            }

            const normalizedLineItemId = lineItemId.trim();
            if (!normalizedLineItemId) {
                throw new Error("Не найден товар в корзине.");
            }

            this.errorMessage = null;
            this.isUpdating = true;

            try {
                const client = useMedusaClient();
                const { cart } = await client.store.cart.updateLineItem(
                    this.cart.id,
                    normalizedLineItemId,
                    { quantity: normalizeQuantity(quantity) },
                    CART_QUERY,
                );

                this.setCart(cart);
                return cart;
            } catch (error) {
                this.errorMessage = getErrorMessage(error);
                throw error;
            } finally {
                this.isUpdating = false;
            }
        },
        async removeLineItem(lineItemId: string) {
            if (!this.cart) {
                throw new Error("Корзина не найдена.");
            }

            const normalizedLineItemId = lineItemId.trim();
            if (!normalizedLineItemId) {
                throw new Error("Не найден товар в корзине.");
            }

            this.errorMessage = null;
            this.isUpdating = true;

            try {
                const client = useMedusaClient();
                const response = await client.store.cart.deleteLineItem(
                    this.cart.id,
                    normalizedLineItemId,
                    CART_QUERY,
                );

                if (response.parent) {
                    this.setCart(response.parent);
                    return response.parent;
                }

                const { cart } = await client.store.cart.retrieve(
                    this.cart.id,
                    CART_QUERY,
                );
                this.setCart(cart);
                return cart;
            } catch (error) {
                this.errorMessage = getErrorMessage(error);
                throw error;
            } finally {
                this.isUpdating = false;
            }
        },
        async completePickupCheckout(
            recipient: CheckoutRecipient,
            pickupStore: PickupStore,
        ) {
            this.errorMessage = null;
            this.isCheckingOut = true;

            try {
                const cart = await this.ensureCart();
                const client = useMedusaClient();
                const pickupMetadata = getPickupStoreMetadata(pickupStore);
                const address = {
                    first_name: recipient.firstName,
                    last_name: recipient.lastName,
                    phone: recipient.phone,
                    address_1: pickupStore.address,
                    city: pickupStore.city,
                    country_code: "ru",
                    metadata: {
                        pickup_store: pickupMetadata,
                    },
                };

                const { cart: updatedCart } = await client.store.cart.update(
                    cart.id,
                    {
                        email: recipient.email,
                        shipping_address: address,
                        billing_address: address,
                        metadata: {
                            ...normalizeMetadata(cart.metadata),
                            pickup_store: pickupMetadata,
                        },
                    },
                    CART_QUERY,
                );
                this.setCart(updatedCart);

                const { shipping_options: shippingOptions } =
                    await client.store.fulfillment.listCartOptions({
                        cart_id: updatedCart.id,
                    });
                const configuredOptionId =
                    useRuntimeConfig().public.pickupShippingOptionId;
                const pickupShippingOptionId = getPickupShippingOptionId(
                    shippingOptions,
                    configuredOptionId,
                );

                if (!pickupShippingOptionId) {
                    throw new Error(
                        "Не настроен вариант доставки для самовывоза. Обратитесь в поддержку магазина.",
                    );
                }

                const { cart: cartWithPickup } =
                    await client.store.cart.addShippingMethod(
                        updatedCart.id,
                        {
                            option_id: pickupShippingOptionId,
                            data: {
                                pickup_store: pickupMetadata,
                            },
                        },
                        CART_QUERY,
                );
                this.setCart(cartWithPickup);

                let cartToComplete = cartWithPickup;

                // The payment session must be initialized after shipping is added so its
                // amount matches the final cart total. Zero-total carts don't need one.
                if (cartWithPickup.total > 0) {
                    if (!cartWithPickup.region_id) {
                        throw new Error(
                            "Не удалось определить регион корзины для инициализации оплаты.",
                        );
                    }

                    const { payment_providers: paymentProviders } =
                        await client.store.payment.listPaymentProviders({
                            region_id: cartWithPickup.region_id,
                            limit: 100,
                        });
                    const pickupPaymentProviderId = getPickupPaymentProviderId(
                        paymentProviders,
                        useRuntimeConfig().public.pickupPaymentProviderId,
                    );

                    if (!pickupPaymentProviderId) {
                        throw new Error(
                            "Не настроен способ оплаты для самовывоза. Включите ручной провайдер оплаты в регионе Medusa.",
                        );
                    }

                    await client.store.payment.initiatePaymentSession(
                        cartWithPickup,
                        {
                            provider_id: pickupPaymentProviderId,
                        },
                    );

                    const { cart: cartWithPayment } =
                        await client.store.cart.retrieve(
                            cartWithPickup.id,
                            CART_QUERY,
                        );
                    cartToComplete = cartWithPayment;
                    this.setCart(cartWithPayment);
                }

                const result = await client.store.cart.complete(cartToComplete.id);

                if (result.type === "cart") {
                    this.setCart(result.cart);
                    throw new Error(result.error.message);
                }

                return result.order;
            } catch (error) {
                this.errorMessage = getErrorMessage(error);
                throw error;
            } finally {
                this.isCheckingOut = false;
            }
        },
    },
    persist: {
        key: CART_STORAGE_KEY,
        storage: piniaPluginPersistedstate.localStorage(),
        pick: ["cartId"],
    },
});
