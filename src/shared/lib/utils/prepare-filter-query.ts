export const allowedFacets = [
  "color",
  "size",
  "category_ids",
  "metadata.subclass",
  "metadata.class",
  "is_discounted",
];

export function prepareFilterQuery(
  input: string[],
  values: Record<string, string[]>,
) {
  for (let [key, value] of Object.entries(values)) {
    if (key === "subclass") key = "metadata.subclass";
    if (key === "class") key = "metadata.class";
    if (value.length === 0 || !allowedFacets.includes(key)) continue;

    if (key === "is_discounted") {
      if (value.includes("true")) {
        input.push("is_discounted = true");
      }
      continue;
    }

    let str = value.map((s) => `'${s}'`);
    input.push(`${key} IN [${str.join(",")}]`);
  }
  return input;
}
