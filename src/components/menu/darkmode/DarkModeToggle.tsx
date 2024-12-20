import { useEffect, useState } from "react"
import amplitude from "../../../utils/amplitude"
import "./DarkModeToggle.css"

const DarkModeToggle = () => {
  const [dark, setDark] = useState(() => {
    const savedMode = localStorage.getItem("darkMode")
    return savedMode ? JSON.parse(savedMode) : false
  })

  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark")
      amplitude.mørkModusByttet("mørk")
    } else {
      document.body.classList.remove("dark")
      amplitude.mørkModusByttet("lys")
    }
  }, [dark])

  const darkModeHandler = () => {
    setDark((prevDark: boolean) => {
      const newDark = !prevDark
      localStorage.setItem("darkMode", JSON.stringify(newDark))
      return newDark
    })
  }

  return (
    <div className='darkmode-toggle'>
      <input
        type='checkbox'
        id='darkmode-checkbox'
        checked={dark}
        onChange={darkModeHandler}
      />
      <label htmlFor='darkmode-checkbox' className='slider round' />
    </div>
  )
}

export default DarkModeToggle
