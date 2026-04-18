export type ClassName = string | null | undefined | false;

export function joinClasses(...classes: (ClassName | ClassName[])[]) {
  return classes
    .flat(1)
    .filter((c) => c && typeof c === "string")
    .join(" ");
}
