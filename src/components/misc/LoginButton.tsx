import { useRouter } from "next/router";
import { FaUserCog } from "react-icons/fa";
import { USER_CODES } from "@/types/user";
import { joinClasses } from "@/utils/misc/classes";
import { QuickButton } from "../home/QuickButton";

type LoginButtonProps = {
  type?: "login" | "logout";
  extraClass?: string;
  extraIconClass?: string;
};

export default function LoginButton({
  type = "login",
  extraClass,
  extraIconClass,
}: LoginButtonProps) {
  const router = useRouter();

  return (
    <QuickButton
      onClick={async () => {
        if (type === "login") {
          router.push("/auth/login");
        } else if (type === "logout") {
          await fetch("/api/auth/logout");
          window.location.href = `/auth/login?code=${USER_CODES.LOGGED_OUT}`;
        }
      }}
      className={joinClasses(
        "font-medium px-4 flex items-center gap-2",
        extraClass,
      )}
      label={type === "logout" ? "Logout" : "Login"}
      icon={FaUserCog}
      extraIconClass={extraIconClass}
    />
  );
}
