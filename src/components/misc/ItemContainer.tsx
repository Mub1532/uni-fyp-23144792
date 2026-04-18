import { hoverClass } from "@/utils/classes";
import { joinClasses } from "@/utils/misc/classes";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type ItemContainerProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  cleanClassName?: boolean;
  hoverClassName?: boolean;
} & ComponentPropsWithoutRef<T>;

function ItemContainer<T extends ElementType = "div">({
  as,
  children,
  className,
  cleanClassName = false,
  hoverClassName = true,
  ...props
}: ItemContainerProps<T> & { className?: string }) {
  const Component = as || "div";
  const classNameDefault =
    "h-full px-2 rounded-md transition-all bg-blue-300 dark:bg-slate-600 text-blue-900 dark:text-slate-300";

  return (
    <Component
      className={joinClasses(
        className,
        hoverClassName ? hoverClass : "",
        cleanClassName ? "" : classNameDefault,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default ItemContainer;
