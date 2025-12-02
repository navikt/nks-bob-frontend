import { create } from "zustand"
import analytics from "../utils/analytics"

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
        analytics.versjonLagret(upstreamVersion)
        return { ...state, currentVersion: upstreamVersion }
      }

      if (state.currentVersion !== upstreamVersion) {
        console.error("Gammel versjon av Bob oppdatet.")
        window.alert("Du kjører en utdatert versjon av Bob. Siden lastes på nytt.")

        analytics.versjonOppdatert(state.currentVersion, upstreamVersion)
        window.location.reload()
      }

      return state
    })

  return {
    currentVersion: null,
    registerVersion,
  }
})
