import { ThemeIcon } from "@navikt/aksel-icons"
import { Button, Theme, Tooltip } from "@navikt/ds-react"
import { useHotkeys } from "react-hotkeys-hook"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import analytics from "../../../utils/analytics"

type ThemeState = {
  currentTheme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
  toggleTheme: () => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => {
      const setTheme = (theme: "light" | "dark") =>
        set((state) => {
          analytics.mørkModusByttet(theme === "dark" ? "mørk" : "lys")
          return {
            ...state,
            currentTheme: theme,
          }
        })

      const toggleTheme = () =>
        set((state) => {
          if (state.currentTheme === "light") {
            analytics.mørkModusByttet("mørk")
            return {
              ...state,
              currentTheme: "dark",
            }
          }

          analytics.mørkModusByttet("lys")
          return {
            ...state,
            currentTheme: "light",
          }
        })

      return {
        currentTheme: "light",
        setTheme,
        toggleTheme,
      }
    },

    {
      name: "theme",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ currentTheme }) => ({ currentTheme }),
    },
  ),
)

export const ThemeButton = () => {
  const { currentTheme, toggleTheme } = useTheme()

  const tooltip = currentTheme === "dark" ? "Endre til lys modus ( Alt+Ctrl+D )" : "Endre til mørk modus ( Alt+Ctrl+D )"

  useHotkeys("alt+ctrl+d", () => toggleTheme(), {
    enableOnFormTags: true,
  })

  return (
    <Tooltip content={tooltip}>
      <Button
        variant='tertiary'
        data-color='neutral'
        icon={<ThemeIcon aria-hidden />}
        onClick={() => toggleTheme()}
      />
    </Tooltip>
  )
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentTheme } = useTheme()
  return <Theme theme={currentTheme}>{children}</Theme>
}
