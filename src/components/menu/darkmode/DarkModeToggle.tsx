import { CheckmarkIcon, MonitorIcon, MoonIcon, SunIcon, ThemeIcon } from "@navikt/aksel-icons"
import { ActionMenu, Button, HStack, Theme, Tooltip } from "@navikt/ds-react"
import { useHotkeys } from "react-hotkeys-hook"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import analytics, { UmamiThemeType } from "../../../utils/analytics"
import { useEffect, useState } from "react"

type ThemeType = "light" | "dark" | "system"

export const umamiThemeType = (theme: ThemeType): UmamiThemeType => {
  if (theme === "light") {
    return "lys"
  }
  if (theme === "dark") {
    return "mørk"
  }
  return "system"
}

type ThemeState = {
  currentTheme: ThemeType
  setTheme: (theme: ThemeType) => void
  toggleTheme: () => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => {
      const setTheme = (theme: ThemeType) =>
        set((state) => {
          analytics.mørkModusByttet(umamiThemeType(theme))
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
  const { currentTheme, toggleTheme, setTheme } = useTheme()

  useHotkeys("alt+ctrl+d", () => toggleTheme(), {
    enableOnFormTags: true,
  })

  return (
    <ActionMenu>
      <Tooltip content='Endre fargetema ( Alt+Ctrl+D )'>
        <ActionMenu.Trigger>
          <Button
            variant='tertiary'
            data-color='neutral'
            icon={<ThemeIcon aria-hidden />}
          />
        </ActionMenu.Trigger>
      </Tooltip>
      <ActionMenu.Content>
        <ActionMenu.Label>Velg fargetema</ActionMenu.Label>
        <ActionMenu.Group aria-label='Velg fargetema'>
          <ActionMenu.Item
            icon={<SunIcon />}
            aria-current={currentTheme === "light"}
            onSelect={() => setTheme("light")}
          >
            <HStack
              gap='space-24'
              align='center'
            >
              Lyst
              {currentTheme === "light" && (
                <CheckmarkIcon
                  aria-hidden
                  fontSize='1.25rem'
                />
              )}
            </HStack>
          </ActionMenu.Item>
          <ActionMenu.Item
            icon={<MoonIcon />}
            aria-current={currentTheme === "dark"}
            onSelect={() => setTheme("dark")}
          >
            <HStack
              gap='space-24'
              align='center'
            >
              Mørkt
              {currentTheme === "dark" && (
                <CheckmarkIcon
                  aria-hidden
                  fontSize='1.25rem'
                />
              )}
            </HStack>
          </ActionMenu.Item>
          <ActionMenu.Item
            icon={<MonitorIcon />}
            aria-current={currentTheme === "system"}
            onSelect={() => setTheme("system")}
          >
            <HStack
              gap='space-24'
              align='center'
            >
              System
              {currentTheme === "system" && (
                <CheckmarkIcon
                  aria-hidden
                  fontSize='1.25rem'
                />
              )}
            </HStack>
          </ActionMenu.Item>
        </ActionMenu.Group>
      </ActionMenu.Content>
    </ActionMenu>
  )
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentTheme } = useTheme()

  const resolveTheme = (): "light" | "dark" => {
    if (currentTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      return systemTheme
    }
    return currentTheme
  }

  const [theme, setTheme] = useState<"light" | "dark">(resolveTheme)

  const setHtmlClass = (theme: "light" | "dark") => {
    const items = document.getElementsByTagName("html")
    items.item(0)?.classList.remove(theme === "dark" ? "light" : "dark")
    items.item(0)?.classList.add(theme)
  }

  const colorSchemeEventListener = (_e: MediaQueryListEvent) => {
    if (currentTheme === "system") {
      const resolvedTheme = resolveTheme()
      setTheme(resolvedTheme)
      setHtmlClass(resolvedTheme)
    }
  }

  useEffect(() => {
    setHtmlClass(resolveTheme())
  }, [])

  useEffect(() => {
    if (currentTheme !== theme) {
      const resolvedTheme = resolveTheme()
      setTheme(resolvedTheme)
      setHtmlClass(resolvedTheme)
    }

    const prefersColorScheme = window.matchMedia("(prefers-color-scheme: dark)")
    prefersColorScheme.addEventListener("change", colorSchemeEventListener)
    return () => prefersColorScheme.removeEventListener("change", colorSchemeEventListener)
  }, [currentTheme])

  return <Theme theme={theme}>{children}</Theme>
}
