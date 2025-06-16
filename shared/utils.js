export function fixLocalizationButton(...labelParams) {
  return labelParams?.map((label) => [label, " "].join("")) ?? [];
}