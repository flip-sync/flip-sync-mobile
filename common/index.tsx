import { ThemeContext } from "@/styles/theme";
import { useContext } from "react";

export * from "./api";

export const useFlipTheme = () => {
    return useContext(ThemeContext);
};
