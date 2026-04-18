import { textColor } from "@/utils/classes";
import { pages } from "@/utils/data/pages";
import { joinClasses } from "@/utils/misc/classes";
import { useState } from "react";
import { RiMenuUnfold2Line } from "react-icons/ri";
import ItemContainer from "../misc/ItemContainer";
import NavIcon from "./Icon";
import NavItem from "./Item";

type NavigationProps = {
  loggedIn: boolean;
};

export default function Navigation({ loggedIn }: NavigationProps) {
  const [showText, setText] = useState(true);

  return (
    <div
      className={joinClasses(
        "bg-blue-200 dark:bg-slate-700 h-fit md:h-full md:min-w-fit md:w-fit md:max-w-42 py-1 md:pt-2 md:text-center px-4",
        textColor,
        "transition-all duration-300 ease-in-out",
      )}
    >
      <div className="h-fit md:h-full w-full flex-row flex md:flex-col justify-evenly items-center md:mt-16 gap-4">
        {pages
          .filter((x) => !x.hidden)
          .filter((x) => (loggedIn ? x.needAuth : false))
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
