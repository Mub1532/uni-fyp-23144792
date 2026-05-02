import Link from "next/link";
import type { IconType } from "react-icons";
import { joinClasses } from "@/utils/misc/classes";
import ItemContainer from "../misc/ItemContainer";

interface QuickButtonProps {
  href?: string;
  label: string;
  icon?: IconType;
  onClick?: () => void;
  extraIconClass?: string;
  className?: string;
  showText?: "onlyMd" | "no" | "yes";
}

export function QuickButton({
  href,
  label,
  icon: Icon,
  onClick,
  extraIconClass,
  className,
  showText = "yes",
}: QuickButtonProps) {
  const textClass = joinClasses(
    "flex items-center gap-2",
    showText === "no" || showText === "onlyMd" ? "opacity-0 w-0" : "",
    showText === "onlyMd" ? "md:opacity-100 md:w-fit" : "",
  );

  const outerClass = joinClasses("h-fit! w-full md:w-fit p-2!", className);

  const mainClass = joinClasses(
    "flex items-center justify-center overflow-hidden",
    showText === "yes" ? "gap-2" : "",
    showText === "onlyMd" ? "md:gap-2" : "",
  );

  const content = (
    <>
      {Icon && (
        <Icon
          className={joinClasses(
            "text-2xl dark:text-slate-100! shrink-0! text-center",
            extraIconClass ?? "",
          )}
        />
      )}
      <div className={textClass}>{label}</div>
    </>
  );

  return href ? (
    <Link href={href}>
      <ItemContainer as="button" className={outerClass}>
        <div className={mainClass}>{content}</div>
      </ItemContainer>
    </Link>
  ) : (
    <ItemContainer as="button" className={outerClass} onClick={onClick}>
      <div className={mainClass}>{content}</div>
    </ItemContainer>
  );
}
