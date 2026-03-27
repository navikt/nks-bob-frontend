"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCreateConversation } from "../../lib/api/api.ts"
import { NewConversation, NewMessage } from "../../types/Message.ts"
import { messageStore } from "../../lib/stores/messageStore.ts"
import { pendingInitialMessageStore } from "../../lib/stores/pendingInitialMessageStore.ts"
import analytics from "../../lib/utils/analytics.ts"
import Header from "../header/Header.tsx"
import InputField, { useInputFieldStore } from "../inputfield/InputField.tsx"
import { umamiThemeType, useTheme } from "../menu/darkmode/DarkModeToggle.tsx"
import { useSourcesStore } from "./chat/chatbubbles/sources/ShowAllSources.tsx"
import { BobPlaceholder } from "./placeholders/Placeholders.tsx"
import CreateConversationWrapper from "./wrappers/CreateConversationWrapper.tsx"

const CreateConversationContent = () => {
  const router = useRouter()
  const { createConversation } = useCreateConversation()
  const { setFollowUp } = useInputFieldStore()
  const { setActiveMessage } = useSourcesStore()
  const { resetMessages } = messageStore()
  const { currentTheme } = useTheme()

  useEffect(() => {
    // reset message state on first render.
    setFollowUp([])
    resetMessages()
    // reset sources sidebar
    setActiveMessage(null)
  }, [])

  function handleUserMessage(message: NewMessage) {
    const newConversation: NewConversation = {
      title: message.content,
      initialMessage: null,
    }

    createConversation(newConversation)
      .then((conversation) => {
        analytics.nySamtaleOpprettet(conversation.id, umamiThemeType(currentTheme))
        pendingInitialMessageStore.getState().set(message.content)
        router.push(`/samtaler/${conversation.id}`)
      })

      .catch((error) => {
        console.log(error)
      })
  }

  return (
    <CreateConversationWrapper>
      <Header conversation={undefined} />
      <div className='flex flex-col justify-center'>
        <BobPlaceholder />
        <InputField
          onSend={handleUserMessage}
          disabled={false}
        />
      </div>
    </CreateConversationWrapper>
  )
}

export default CreateConversationContent
