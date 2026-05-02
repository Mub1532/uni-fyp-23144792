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
}

export function QuickButton({
  href,
  label,
  icon: Icon,
  onClick,
  extraIconClass,
  className,
}: QuickButtonProps) {
  const content = (
    <>
      {Icon && (
        <Icon
          className={joinClasses(
            "text-2xl dark:text-slate-100!",
            extraIconClass ?? "",
          )}
        />
      )}
      <div>{label}</div>
    </>
  );

  return href ? (
    <Link href={href}>
      <ItemContainer
        as="button"
        className={joinClasses("h-fit! w-full md:w-fit p-2!", className)}
      >
        <div className="flex items-center gap-2">{content}</div>
      </ItemContainer>
    </Link>
  ) : (
    <ItemContainer
      as="button"
      className={joinClasses("h-fit! w-full md:w-fit p-2!", className)}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">{content}</div>
    </ItemContainer>
  );
}
