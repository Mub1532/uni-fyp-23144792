import { useEffect } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { toast } from "react-toastify";
import ItemContainer from "@/components/misc/ItemContainer";
import { useTheme } from "@/hooks/useTheme";

type ThemeToggleProps = {
  useBG?: boolean;
};

export default function ThemeToggle({ useBG }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (theme === false && useBG === true) {
      toggleTheme();
    }
  }, [theme, useBG, toggleTheme]);

  function toggle() {
    if (useBG) {
      toast.info("Color scheme must be dark when using a background image.");
    } else {
      toggleTheme();
    }
  }

  return (
    <ItemContainer as="button" onClick={toggle} className="text-sm md:text-lg">
      {theme ? <MdLightMode /> : <MdDarkMode />}
    </ItemContainer>
  );
}
