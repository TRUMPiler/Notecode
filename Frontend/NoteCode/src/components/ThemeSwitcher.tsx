// src/components/ThemeSwitcher.tsx
import React from "react";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar";
import { Switch } from "@/components/ui/switch"; // Adjust import as necessary
import { SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "@/Pages/SubParts/ThemeProvider";

const ThemeSwitcher: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Theme</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <SunIcon className={theme === "light" ? "text-yellow-500" : "text-gray-500"} />
                            <Switch
                                checked={theme === "dark"}
                                onCheckedChange={toggleTheme}
                                aria-label="Toggle Theme"
                            />
                            <MoonIcon className={theme === "dark" ? "text-blue-500" : "text-gray-500"} />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

export default ThemeSwitcher;
