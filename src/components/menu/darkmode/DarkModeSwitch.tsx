import { Switch } from "@navikt/ds-react"
import { useState } from "react"
import { useMediaQuery } from "react-responsive"

const DarkModeToggle = () => {
  const [dark, setDark] = useState(false)

  const darkModeHandler = () => {
    setDark(!dark)
    document.body.classList.toggle("dark")
  }

  const systemPrefersDark = useMediaQuery(
    {
      query: "(prefers-color-scheme: dark)",
    },
    undefined,
    (isSystemDark) => setDark(isSystemDark),
  )

  return (
    <Switch
      hideLabel
      size='small'
      checked={dark}
      onChange={darkModeHandler}
      aria-label='Nattmodus'
    >
      Varsle med SMS
    </Switch>
  )
}

export default DarkModeToggle
