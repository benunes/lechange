"use client";
import {useTheme} from "next-themes";
import {Button} from "@/components/ui/button";
import {Moon, Sun} from "lucide-react";

export function ThemeToggle() {
    const {theme, setTheme} = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Changer le thème"
            className="hover:bg-amber-500/10 hover:text-amber-600 transition-all duration-300"
        >
            {theme === "dark" ? (
                <Sun className="h-5 w-5"/>
            ) : (
                <Moon className="h-5 w-5"/>
            )}
        </Button>
    );
}
