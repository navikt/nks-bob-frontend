import { Tooltip } from "@navikt/ds-react"
import { useEffect, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import analytics from "../../../utils/analytics"
import "./DarkModeToggle.css"

const DarkModeToggle = () => {
  const [dark, setDark] = useState(() => {
    const savedMode = localStorage.getItem("darkMode")
    return savedMode ? JSON.parse(savedMode) : false
  })

  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }, [dark])

  const darkModeHandler = () => {
    setDark((prevDark: boolean) => {
      const newDark = !prevDark
      analytics.mørkModusByttet(newDark ? "mørk" : "lys")
      localStorage.setItem("darkMode", JSON.stringify(newDark))
      return newDark
    })
  }

  const tooltip = dark ? "Endre til lys modus ( Alt+Ctrl+D )" : "Endre til mørk modus ( Alt+Ctrl+D )"

  useHotkeys("alt+ctrl+d", () => darkModeHandler(), {
    enableOnFormTags: true,
  })

  return (
    <Tooltip content={tooltip}>
      <div className='darkmode-toggle'>
        <input
          type='checkbox'
          id='darkmode-checkbox'
          checked={dark}
          onChange={darkModeHandler}
          aria-label='Mørk modus'
        />
        <label
          htmlFor='darkmode-checkbox'
          aria-label='Mørk modus'
          className='slider round'
        />
      </div>
    </Tooltip>
  )
}

export default DarkModeToggle
