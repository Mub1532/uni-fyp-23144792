import ItemContainer from "@/components/misc/ItemContainer";
import { useTheme } from "@/hooks/useTheme";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <ItemContainer
            as="button"
            onClick={toggleTheme}
            className="text-sm md:text-lg"
        >
            {theme ? <MdLightMode /> : <MdDarkMode />}
        </ItemContainer>
    );
}
