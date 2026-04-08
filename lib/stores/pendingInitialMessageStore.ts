"use client"

import { create } from "zustand"

/**
 * Transient store to pass the initial message from the create page to the conversation page.
 * In the old React Router setup this used location.state; Next.js doesn't support that pattern.
 */
type PendingInitialMessageState = {
  message: string | null
  set: (message: string) => void
  consume: () => string | null
}

export const pendingInitialMessageStore = create<PendingInitialMessageState>((set, get) => ({
  message: null,
  set: (message: string) => set({ message }),
  consume: () => {
    const msg = get().message
    set({ message: null })
    return msg
  },
}))
