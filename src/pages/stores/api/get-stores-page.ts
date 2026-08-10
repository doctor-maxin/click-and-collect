export const getContactPage = async () => {
    const data = await GqlGetContactPage();

    return data.contactPage;
};
