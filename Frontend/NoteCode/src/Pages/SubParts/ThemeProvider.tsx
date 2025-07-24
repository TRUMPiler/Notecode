
import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
    theme: "light" | "dark";
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<"light" | "dark">(
        window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    );

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove(theme === "dark" ? "light" : "dark");
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};
