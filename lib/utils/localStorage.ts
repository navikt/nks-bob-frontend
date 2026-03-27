import { useEffect, useState } from "react"

export function setItem(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.log(error)
  }
}

function getItem(key: string) {
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : undefined
  } catch (error) {
    console.log(error)
  }
}

export function useLocalStorage(key: string) {
  const [storedValue, setStoredValue] = useState(() => {
    return getItem(key)
  })

  useEffect(() => {
    setStoredValue(getItem(key))
  }, [key])

  return storedValue
}

export function useUpdateLocalStorage(key: string) {
  const [storageValue, setStorageValue] = useState(() => getItem(key))

  const updateStorageValue = (newValue: unknown) => {
    setStorageValue(newValue)
    setItem(key, newValue)
  }

  return [storageValue, updateStorageValue, () => getItem(key)] as const
}

export function useStateLocalStorage<S>(key: string, initialState: S): [S, React.Dispatch<S>] {
  const [storageValue, setStorageValue] = useState(() => {
    const existingItem: S | undefined = getItem(key)
    if (existingItem) {
      return existingItem
    }

    return initialState
  })

  const updateStorageValue = (newValue: S) => {
    setStorageValue(newValue)
    setItem(key, newValue)
  }

  return [storageValue, updateStorageValue]
}
