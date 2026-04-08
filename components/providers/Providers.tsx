"use client"

import { SWRConfig } from "swr"
import { ThemeProvider } from "@/components/menu/darkmode/DarkModeToggle"
import { triggerReAuth } from "@/lib/api/api"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SWRConfig
        value={{
          onError: (err) => {
            if (err.status === 401) {
              triggerReAuth()
            }
          },
        }}
      >
        {children}
      </SWRConfig>
    </ThemeProvider>
  )
}
