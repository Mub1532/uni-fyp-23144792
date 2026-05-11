export type ClassName = string | null | undefined | false;

export function joinClasses(...classes: (ClassName | ClassName[])[]) {
  return classes
    .flat(1)
    .filter((c) => c && typeof c === "string")
    .join(" ");
}

export const defaultScrollbar =
  "scrollbar-thin scrollbar-thumb-blue-500/60 scrollbar-track-transparent scrollbar-gutter-stable scrollbar-thumb-rounded-full [&::-webkit-scrollbar-button]:hidden! animate-none!";

export const scrollHint =
  "[&>*]:animate-[scroll-hint_1.5s_ease-in-out_0.5s_1] [&>*]:lg:animate-none";
