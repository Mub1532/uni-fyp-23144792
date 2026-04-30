import LoginButton from "@/components/misc/LoginButton";
import UserContainer from "@/components/misc/UserContainer";
import NotifContainer from "@/components/notifs/container";
import type { userInfo } from "@/types/user";
import ThemeToggle from "../../misc/themeToggle";

type TopBarProps = {
  pageName?: string;
  user?: userInfo;
  useGooglePic?: boolean;
  googlePic?: string | undefined;
};

export default function TopBar({
  pageName,
  user,
  useGooglePic = false,
  googlePic = undefined,
}: TopBarProps) {
  return (
    <div className="flex gap-2 title-page text-2xl bg-slate-20 h-12 md:h-16 p-2 md:p-3 w-full items-center border-b-2 border-blue-200 dark:border-slate-600">
      <div className="font-bold align-bottom text-lg md:text-xl w-full">
        {pageName}
      </div>
      <div className="mr-0 w-full h-full flex flex-row-reverse gap-2 items-center">
        {user?.id ? (
          <UserContainer
            username={user.username}
            googlePic={googlePic}
            useGooglePic={useGooglePic}
          />
        ) : (
          <LoginButton extraClass="ml-2" />
        )}

        <ThemeToggle />
        {user?.id ? <NotifContainer /> : null}
      </div>
    </div>
  );
}
