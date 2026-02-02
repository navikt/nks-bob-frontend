import {
  BellDotIcon,
  ChatExclamationmarkIcon,
  ExclamationmarkTriangleIcon,
  MagnifyingGlassIcon,
} from "@navikt/aksel-icons"
import { Button } from "@navikt/ds-react"
import { useState } from "react"
import { useUserConfig } from "../../../../api/api.ts"
import { SidebarWrapper } from "../../wrappers/SidebarWrapper.tsx"
import { CreateAlert } from "./CreateAlert.tsx"
import { CreateNews } from "./CreateNews.tsx"
import { FeedbackFromUsers } from "./FeedbackFromUsers.tsx"
import SearchConversation from "./searchconversation/SearchConversation.tsx"

const AdminMenuWrapper = () => {
  const { userConfig } = useUserConfig()
  const userType = userConfig?.userType

  if (userType === "admin") {
    return <AdminMenu />
  }

  return null
}

const AdminMenu = () => {
  const [activeComponent, setActiveComponent] = useState<"search" | "feedback" | "alert" | "news" | null>(null)

  return (
    <SidebarWrapper
      isOpen={activeComponent !== null}
      onClose={() => setActiveComponent(null)}
      storageKey='admin-menu-width'
      defaultWidth={320}
      minWidth={250}
      maxWidth={600}
    >
      {(width) => (
        <>
          {/* Picker buttons positioned relative to sidebar */}
          <div
            className='pointer-events-none fixed right-0 flex h-full items-center'
            style={{
              right: activeComponent ? `${width + 2}px` : "0px",
            }}
          >
            <div
              className={`bg-ax-bg-default pointer-events-auto flex flex-col gap-3 rounded-l-lg p-3 ${activeComponent ? "opacity-100" : "opacity-10"} border-ax-border-neutral-subtle border-y border-l transition-opacity duration-700 hover:opacity-100`}
            >
              <Button
                data-color='brand-magenta'
                size='small'
                variant='primary'
                icon={<MagnifyingGlassIcon />}
                aria-pressed={activeComponent === "search"}
                className='aria-pressed:bg-ax-bg-neutral-strong-pressed'
                onClick={() => setActiveComponent(activeComponent === "search" ? null : "search")}
              />
              <Button
                data-color='brand-magenta'
                size='small'
                variant='primary'
                icon={<ChatExclamationmarkIcon />}
                aria-pressed={activeComponent === "feedback"}
                className='aria-pressed:bg-ax-bg-neutral-strong-pressed'
                onClick={() => setActiveComponent(activeComponent === "feedback" ? null : "feedback")}
              />
              <Button
                data-color='brand-magenta'
                size='small'
                variant='primary'
                icon={<ExclamationmarkTriangleIcon />}
                aria-pressed={activeComponent === "alert"}
                className='aria-pressed:bg-ax-bg-neutral-strong-pressed'
                onClick={() => setActiveComponent(activeComponent === "alert" ? null : "alert")}
              />
              <Button
                data-color='brand-magenta'
                size='small'
                variant='primary'
                icon={<BellDotIcon />}
                aria-pressed={activeComponent === "news"}
                className='aria-pressed:bg-ax-bg-neutral-strong-pressed'
                onClick={() => setActiveComponent(activeComponent === "news" ? null : "news")}
              />
            </div>
          </div>

          {/* Sidebar content */}
          <div className='h-full'>
            {activeComponent === "search" && <SearchConversation />}
            {activeComponent === "feedback" && <FeedbackFromUsers />}
            {activeComponent === "alert" && <CreateAlert />}
            {activeComponent === "news" && <CreateNews />}
          </div>
        </>
      )}
    </SidebarWrapper>
  )
}

export default AdminMenuWrapper
