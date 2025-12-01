import { create } from "zustand"

type VersionState = {
  currentVersion: string | null
  registerVersion: (upstreamVersion: string | null) => void
}

export const versionStore = create<VersionState>()((set) => {
  const registerVersion = (upstreamVersion: string | null) =>
    set((state) => {
      if (upstreamVersion === null) {
        return state
      }

      if (state.currentVersion === null) {
        return { ...state, currentVersion: upstreamVersion }
      }

      if (state.currentVersion !== upstreamVersion) {
        // TODO reload
        console.error("Old Bob version detected")
      }

      return state
    })

  return {
    currentVersion: null,
    registerVersion,
  }
})
