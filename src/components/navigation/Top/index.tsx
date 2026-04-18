import UserContainer from "@/components/misc/UserContainer";
import ThemeToggle from "../../misc/themeToggle";

type TopBarProps = {
    pageName?: string;
};

export default function TopBar({ pageName }: TopBarProps) {
    return (
        <div className="flex gap-2 title-page text-2xl bg-slate-20 h-12 md:h-16 p-2 md:p-3 w-full items-center border-b-2 border-blue-200 dark:border-slate-600">
            <div className="font-bold align-bottom text-lg md:text-xl w-full">{pageName}</div>
            <div className="mr-0 w-full h-full flex flex-row-reverse gap-2 items-center">
                <ThemeToggle />
                <UserContainer username="Mub1532" />
            </div>
        </div>
    );
}
