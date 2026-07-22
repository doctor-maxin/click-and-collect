export const getStoresPage = async () => {
    const data = await GqlGetStoresPage();

    return data.storesPage;
};
