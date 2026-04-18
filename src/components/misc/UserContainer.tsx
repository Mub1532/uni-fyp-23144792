import { hoverClass } from "@/utils/classes";
import { joinClasses } from "@/utils/misc/classes";
import { useRouter } from "next/router";
import { useState } from "react";
import ItemContainer from "./ItemContainer";

type userContainerProps = {
    username: string;
};

export default function UserContainer({ username }: userContainerProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    async function logoutUser() {
        await fetch("/api/auth/logout");

        router.push("/auth/login");
    }

    return (
        <ItemContainer
            as="div"
            className={joinClasses(
                "p-0 px-0! relative flex rounded-md items-center gap-2 text-xs font-bold",
                open ? "rounded-b-none!" : "rounded-b-md",
            )}
            hoverClassName={false}
        >
            {/** biome-ignore lint/a11y/noStaticElementInteractions: needed for overlay */}
            {/** biome-ignore lint/a11y/useKeyWithClickEvents: needed for overlay */}
            <div
                className={joinClasses(
                    "w-full h-full flex items-center gap-1.5 cursor-pointer px-1.5 rounded-md",
                    hoverClass,
                    open ? "rounded-b-none!" : "rounded-b-md",
                )}
                onClick={() => setOpen(!open)}
            >
                <div className="rounded-sm bg-blue-500 aspect-square w-5 md:w-7 flex items-center justify-center text-sm">
                    {username[0]?.toUpperCase().trimEnd()}
                </div>
                <div className="text-xs md:text-sm">{username}</div>
            </div>
            <ItemContainer
                hoverClassName={false}
                onClick={logoutUser}
                as="button"
                className={`${open ? "opacity-100 cursor-pointer" : "opacity-0"} absolute top-full left-0 -mt-0.5 rounded-b-md border-t-2 border-slate-700 w-full flex rounded-none items-center gap-2 text-sm font-bold`}
            >
                Logout
            </ItemContainer>
        </ItemContainer>
    );
}
