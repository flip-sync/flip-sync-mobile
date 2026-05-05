import { ThemeContext } from "@/styles/theme";
import { useContext } from "react";

export * from "./api";
export * from "./legal";

export const useFlipTheme = () => {
    return useContext(ThemeContext);
};
