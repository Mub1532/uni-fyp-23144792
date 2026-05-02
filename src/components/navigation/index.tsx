import { useState } from "react";
import { RiMenuUnfold2Line } from "react-icons/ri";
import { textColor } from "@/utils/classes";
import { pages } from "@/utils/data/pages";
import { joinClasses } from "@/utils/misc/classes";
import ItemContainer from "../misc/ItemContainer";
import NavIcon from "./Icon";
import NavItem from "./Item";

type NavigationProps = {
  loggedIn: boolean;
  className?: string;
  useBG?: boolean;
};

export default function Navigation({
  loggedIn,
  className,
  useBG = true,
}: NavigationProps) {
  const [showText, setText] = useState(true);

  return (
    <div
      className={joinClasses(
        "h-fit md:h-full md:min-w-fit md:w-fit md:max-w-42 py-1 md:pt-2 md:text-center px-4",
        textColor,
        className,
        useBG
          ? "bg-blue-200/40 dark:bg-slate-700/40"
          : "bg-blue-200 dark:bg-slate-700",
      )}
    >
      <div
        className={joinClasses(
          "h-fit min-h-9 sm:min-h-15 md:h-full w-full flex-row flex md:flex-col justify-evenly items-center md:mt-16 gap-4",
          loggedIn === undefined ? "opacity-0" : "opacity-100",
          showText ? "md:min-w-27" : "",
        )}
      >
        {pages
          .filter((x) => !x.hidden)
          .filter((x) =>
            loggedIn !== undefined && loggedIn ? x.needAuth : false,
          )
          .map((page) => (
            <NavItem showText={showText} {...page} key={page.path} />
          ))}
        <ItemContainer
          as="button"
          className="h-12! hidden md:flex md:w-full font-black! p-4 py-2 text-center justify-center items-center mt-auto! mb-20! hover:dark:bg-slate-800!"
          onClick={() => setText(!showText)}
        >
          <NavIcon
            icon={RiMenuUnfold2Line}
            classExtra="font-black! text-2xl!"
          />
        </ItemContainer>
      </div>
    </div>
  );
}
