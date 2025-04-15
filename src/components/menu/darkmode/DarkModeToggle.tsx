import { useEffect, useState } from "react"
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
      analytics.mørkModusByttet("mørk")
    } else {
      document.body.classList.remove("dark")
      analytics.mørkModusByttet("lys")
    }
  }, [dark])

  const darkModeHandler = () => {
    setDark((prevDark: boolean) => {
      const newDark = !prevDark
      localStorage.setItem("darkMode", JSON.stringify(newDark))
      return newDark
    })
  }

  const tooltip = dark
    ? "Bytt til lys modus"
    : "Bytt til mørk modus"

  return (
    <div className='darkmode-toggle'>
      <input
        type='checkbox'
        id='darkmode-checkbox'
        title={tooltip}
        checked={dark}
        onChange={darkModeHandler}
      />
      <label htmlFor='darkmode-checkbox' className='slider round' title={tooltip} />
    </div>
  )
}

export default DarkModeToggle
