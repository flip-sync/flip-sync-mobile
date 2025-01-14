import React, { useEffect, useState } from "react";

import { Appearance, Platform, StatusBar } from "react-native";

type ThemeProviderProps = {
    children: React.ReactNode;
};

export type ThemeType = {
    isDark: boolean;
    appearance: "light" | "dark";
    gray1:string;
    gray2:string;
    gray3:string;
    gray4:string;
    gray5:string;
    gray6:string;
    gray7:string;
    gray8:string;
    black:string;
    white:string;
    red:string;
    primary:string;
    primaryLight:string;

};

export type Color = keyof Omit<ThemeType, "isDark" | "appearance">;

const themeColors: Record<"light" | "dark", Omit<ThemeType, "isDark" | "appearance">> = {
    light: {
        gray1: "#1D1B20",
        gray2: "#322F35",
        gray3: "#48464C",
        gray4: "#79767D",
        gray5: "#938F96",
        gray6: "#CAC5CD",
        gray7: "#E6E0E9",
        gray8: "#F5F6F6",
        black: "#000000",
        white: "#ffffff",
        red:"#B3261E",
        primary:'#4EC0E9',
        primaryLight:'#EAF2FD',
    },
    dark: {
        gray1: "#1D1B20",
        gray2: "#322F35",
        gray3: "#48464C",
        gray4: "#79767D",
        gray5: "#938F96",
        gray6: "#CAC5CD",
        gray7: "#E6E0E9",
        gray8: "#F5F6F6",
        black: "#000000",
        white: "#ffffff",
        red:"#B3261E",
        primary:'#4EC0E9',
        primaryLight:'#EAF2FD',
    }
};

export const statusBarTheme = {
    color: {
        dark: "#000000",
        light: "#ffffff"
    },
    style: {
        dark: "light-content" as const,
        light: "dark-content" as const
    }
};

export const ThemeContext = React.createContext<ThemeType>({
    isDark: false,
    appearance: "light",
    ...themeColors.light
});

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const appearance = Appearance.getColorScheme() ?? "light";

    const [theme, setTheme] = useState<ThemeType>({
        appearance,
        isDark: appearance === "dark",
        ...themeColors[appearance]
    });

    useEffect(() => {
        setTheme({
            appearance,
            isDark: appearance === "dark",
            ...themeColors[appearance]
        });
    }, [appearance]);

    useEffect(() => {
        Platform.OS === "android" && StatusBar.setBackgroundColor("transparent");
        StatusBar.setBarStyle(statusBarTheme.style[appearance], true);
    }, [appearance]);

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};
