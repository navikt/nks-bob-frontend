import type { Metadata, Viewport } from "next"
import Script from "next/script"
import Providers from "@/components/providers/Providers"
import "@/app/global.css"

const isProd = process.env.MILJO === "prod"

const websiteId = isProd ? "7d7d1d3b-45ce-4e1f-a23a-aabc7c2db1f5" : "7a73382f-ec5b-4c80-b3f2-154388c32234"

const domains = isProd ? "bob.ansatt.nav.no" : "bob.ansatt.dev.nav.no"

export const metadata: Metadata = {
  title: "Bob",
  description: "NKS-Bob - Språkbehandlingsassistent for veiledere i NKS",
  icons: {
    icon: "/icons/RoboBobHead.svg",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          defer
          src="https://cdn.nav.no/team-researchops/sporing/sporing.js"
          data-host-url="https://umami.nav.no"
          data-website-id={websiteId}
          data-domains={domains}
          data-exclude-search="false"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
