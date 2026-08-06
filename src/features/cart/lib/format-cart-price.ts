export function formatCartPrice(
    amount: number | null | undefined,
    currencyCode = "RUB",
) {
    if (typeof amount !== "number") return "-";

    return amount.toLocaleString("ru-RU", {
        style: "currency",
        currency: currencyCode.toUpperCase(),
        currencyDisplay: "symbol",
        maximumFractionDigits: 0,
    });
}
