import React, { useState, useEffect, useContext, Dispatch, SetStateAction } from "react"

export type Theme = "dark" | "light"
export type ThemeContextT = {
  theme?: Theme
  toggleTheme?(): void
}

declare global {
  interface Window {
    __setPreferredTheme(theme: Theme): void
    __theme: Theme
    __onThemeChange: Dispatch<SetStateAction<"dark" | "light">>
  }
}

const ThemeContext = React.createContext<ThemeContextT>({})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(global.window?.__theme || "light")
  const toggleTheme = () => {
    global.window.__setPreferredTheme(theme === "light" ? "dark" : "light")
  }

  useEffect(() => {
    global.window.__onThemeChange = setTheme
  }, [])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
