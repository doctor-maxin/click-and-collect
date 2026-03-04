import { NavigationItemType } from "#gql/default";

export const useNavigationItemUrl = () => {
  const getItemUrl = (
    type: NavigationItemType | undefined,
    path: string | undefined | null,
    typename: string | undefined,
  ) => {
    if (type === NavigationItemType.EXTERNAL) {
      return path ?? "";
    }

    const normalizedPath = path?.startsWith("/") ? path.slice(1) : (path ?? "");

    if (type === NavigationItemType.INTERNAL && typename === "Page") {
      return `/pages/${normalizedPath}`;
    }

    return `/${normalizedPath}`;
  };

  return {
    getItemUrl,
  };
};
