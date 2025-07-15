"use client";

import * as React from "react";
import {ThemeProvider as NextThemesProvider} from "next-themes";
import { type ComponentProps } from "react";

// Utiliser ComponentProps au lieu de l'import direct depuis next-themes/dist/types
type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({children, ...props}: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
