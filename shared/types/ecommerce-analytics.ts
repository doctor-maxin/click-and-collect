export interface EcommerceProduct {
    id: string;
    name: string;
    brand?: string;
    category?: string;
    coupon?: string;
    discount?: number;
    list?: string;
    position?: number;
    price?: number;
    quantity?: number;
    variant?: string;
}

interface EcommerceProductsEvent {
    currency: string;
    products: EcommerceProduct[];
}

export type EcommerceAnalyticsEvent =
    | ({ type: "view_item_list" } & EcommerceProductsEvent)
    | ({ type: "select_item" } & EcommerceProductsEvent)
    | ({ type: "view_item" } & EcommerceProductsEvent)
    | ({ type: "add_to_cart" } & EcommerceProductsEvent)
    | ({ type: "remove_from_cart" } & EcommerceProductsEvent)
    | ({
          type: "purchase";
          transaction: {
              id: string;
              coupon?: string;
              revenue?: number;
              goalId?: number;
          };
      } & EcommerceProductsEvent);

export interface EcommerceAnalyticsAdapter {
    track(event: EcommerceAnalyticsEvent): void;
}

export interface EcommerceAnalytics {
    track(event: EcommerceAnalyticsEvent): void;
}
