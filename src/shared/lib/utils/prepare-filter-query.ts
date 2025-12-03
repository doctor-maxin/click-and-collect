export const allowedFacets = ["color", "size", "metadata.subclass"];

export function prepareFilterQuery(
  input: string[],
  values: Record<string, string[]>,
) {
  for (const [key, value] of Object.entries(values)) {
    if (value.length === 0 || !allowedFacets.includes(key)) continue;

    let str = value.map((s) => `'${s}'`);
    input.push(`${key} IN [${str.join(",")}]`);
  }
  return input;
}
