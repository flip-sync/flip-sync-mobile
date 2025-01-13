import { ThemeContext } from "@/styles/theme";
import { useContext } from "react";

export const useFlipTheme = () => {
    return useContext(ThemeContext);
};