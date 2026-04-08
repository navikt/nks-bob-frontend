"use client"

import { create } from "zustand"

/**
 * Tracks the previous conversation ID so the user can "regret" creating a new conversation
 * and return to the previous one.
 */
type PreviousConversationState = {
  fromConversationId: string | null
  set: (id: string) => void
  clear: () => void
}

export const previousConversationStore = create<PreviousConversationState>((set) => ({
  fromConversationId: null,
  set: (id: string) => set({ fromConversationId: id }),
  clear: () => set({ fromConversationId: null }),
}))
