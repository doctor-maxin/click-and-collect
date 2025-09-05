import type { API } from "@strapi/client";

export type NavigationItem = API.Document & {
  id: number;
  title: string;
  type: "WRAPPER" | "EXTERNAL";
  path: string;
  externalPath: null;
  uiRouterKey: string;
  menuAttached: boolean;
  order: number;
  collapsed: boolean;
  additionalFields: {
    color?: string;
    icon?: string;
    isSocialMenu?: boolean;
  };
  audience: string[];
  autoSync: boolean;
  parent: null | NavigationItem;
  items: null | NavigationItem[];
};

export type NavigationMenu = NavigationItem[];
