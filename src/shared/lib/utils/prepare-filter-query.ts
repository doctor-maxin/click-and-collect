export const allowedFacets = ["color", "size", "metadata.subclass"];

export function prepareFilterQuery(
  input: string[],
  values: Record<string, string[]>,
) {
  for (let [key, value] of Object.entries(values)) {
    if (key === "subclass") key = "metadata.subclass";
    if (value.length === 0 || !allowedFacets.includes(key)) continue;

    let str = value.map((s) => `'${s}'`);
    input.push(`${key} IN [${str.join(",")}]`);
  }
  return input;
}
