import Header from "../header/Header.tsx"
import InputField from "../inputfield/InputField.tsx"
import {
  ShowAllSources,
  SourcesContextProvider,
} from "./chat/chatbubbles/sources/ShowAllSources.tsx"
import ChatContainer from "./chat/ChatContainer.tsx"
import { guideMessages } from "./guide/mockmessage/MockMessage.ts"
import DialogWrapper from "./wrappers/DialogWrapper.tsx"

export default function ConversationGuideContent() {
  const handleUserMessage = () => {}

  return (
    <div className='conversation-content'>
      <SourcesContextProvider>
        <DialogWrapper>
          <Header conversation={undefined} />
          <div className='chatcontainer'>
            <ChatContainer
              onSend={handleUserMessage}
              messages={guideMessages}
              isLoading={false}
            />
          </div>
          <InputField onSend={handleUserMessage} disabled={true} />
        </DialogWrapper>
        <ShowAllSources />
      </SourcesContextProvider>
    </div>
  )
}
