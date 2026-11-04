import { Conversation } from "../types/Message"
import { CONVERSATIONS_KEY, fetcher } from "./api"

export function createConversationListRefresher(
  mutate: (key: string, data: Conversation[], options: { revalidate: false }) => Promise<unknown>,
) {
  const requests = new WeakMap<AbortSignal, { dirty: boolean; promise: Promise<void> }>()
  return (signal: AbortSignal): Promise<void> => {
    const pending = requests.get(signal)
    if (pending) {
      pending.dirty = true
      return pending.promise
    }
    const state = { dirty: false, promise: Promise.resolve() }
    state.promise = (async () => {
      do {
        state.dirty = false
        const conversations = await fetcher<Conversation[]>(CONVERSATIONS_KEY, { signal })
        if (signal.aborted) return
        await mutate(CONVERSATIONS_KEY, conversations, { revalidate: false })
      } while (state.dirty && !signal.aborted)
    })().finally(() => requests.delete(signal))
    requests.set(signal, state)
    return state.promise
  }
}
