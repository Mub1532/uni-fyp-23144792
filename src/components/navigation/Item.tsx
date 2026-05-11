/** biome-ignore-all lint/a11y/useKeyWithClickEvents: needed for nav links */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: needed for nav links */

import Link from "next/link";
import { useRouter } from "next/router";
import type { PageDataProps } from "@/utils/data/pages";
import { joinClasses } from "@/utils/misc/classes";
import ItemContainer from "../misc/ItemContainer";
import NavIcon from "./Icon";

interface NavItemProps extends PageDataProps {
  showText: boolean;
}

export default function NavItem({ icon, name, path, showText }: NavItemProps) {
  const router = useRouter();

  const currentPath = router.pathname;
  const isActive = currentPath === path || currentPath.startsWith(`${path}/`);

  return (
    <ItemContainer
      as="button"
      className={joinClasses(
        "h-fit! w-fit md:w-full p-0!",
        isActive
          ? "hover:bg-blue-400! hover:dark:bg-slate-600!"
          : "bg-transparent! hover:bg-blue-300! hover:dark:bg-slate-600!",
      )}
    >
      <Link
        href={path}
        passHref
        aria-label={name}
        className={joinClasses(
          "flex flex-col md:flex-row items-center sm:gap-2 font-semibold p-2",
          !showText ? "justify-center" : "",
        )}
      >
        {icon && (
          <div className="text-sm">
            <NavIcon icon={icon} router={router} path={path} />
          </div>
        )}
        <div
          className={joinClasses(
            "truncate whitespace-normal text-center text-sm!",
            !showText && "hidden",
            "text-blue-600! dark:text-blue-300!",
            "opacity-0 w-0 h-0 sm:opacity-100 sm:w-fit sm:h-fit",
          )}
        >
          {name}
        </div>
      </Link>
    </ItemContainer>
  );
}
