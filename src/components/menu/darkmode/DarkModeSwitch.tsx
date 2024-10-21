import { Switch } from "@navikt/ds-react"
import { useState } from "react"

const DarkModeToggle = () => {
  const [dark, setDark] = useState(false)

  const darkModeHandler = () => {
    setDark(!dark)
    document.body.classList.toggle("dark")
  }

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
