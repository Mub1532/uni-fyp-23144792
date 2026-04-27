import { IoMdNotifications, IoMdNotificationsOutline } from "react-icons/io";
import ItemContainer from "@/components/misc/ItemContainer";

const NotifIconType: "dnd" | "full" | "none" = "full";

export default function NotifContainer() {
  const Icon =
    NotifIconType === "dnd" ? IoMdNotificationsOutline : IoMdNotifications;

  return (
    <div className="h-full relative hover:opacity-80 transition-all ease-in duration-100">
      <span className="absolute -top-1 -right-1 flex size-3">
        <span className="absolute inline-flex h-full w-full animate-ping duration-100 rounded-full bg-blue-600 dark:bg-blue-200 opacity-75"></span>
        <span className="relative inline-flex size-3 rounded-full bg-blue-700 dark:bg-blue-300"></span>
      </span>
      <ItemContainer as="button" className="text-sm md:text-lg">
        <Icon />
      </ItemContainer>
    </div>
  );
}
