const isProd = window.location.hostname === "bob.ansatt.nav.no"

const websiteId = isProd
  ? "7d7d1d3b-45ce-4e1f-a23a-aabc7c2db1f5"
  : "7a73382f-ec5b-4c80-b3f2-154388c32234"

const domains = isProd ? "bob.ansatt.nav.no" : "bob.ansatt.dev.nav.no"

export const AnalyticsProvider = () => (
  <script
    defer
    src='https://cdn.nav.no/team-researchops/sporing/sporing.js'
    data-host-url='https://umami.nav.no'
    data-website-id={websiteId}
    data-domains={domains}
  />
)
