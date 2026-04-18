import { joinClasses } from "@/utils/misc/classes";
import type { NextRouter } from "next/router";
import type { IconType } from "react-icons";

interface NavIconProps {
  icon: IconType;
  router?: NextRouter;
  path?: string;
  classExtra?: string;
}

function NavIcon({ icon, router, path, classExtra }: NavIconProps) {
  if (router?.pathname !== path)
    return icon({
      className: joinClasses("text-xl sm:text-lg text-blue-500", classExtra),
    });
  return icon({
    className: joinClasses(
      "text-xl sm:text-lg text-blue-600 dark:text-blue-500",
      classExtra,
    ),
  });
}

export default NavIcon;
