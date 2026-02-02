import {
  BellDotIcon,
  ChatExclamationmarkIcon,
  ExclamationmarkTriangleIcon,
  MagnifyingGlassIcon
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
  const [activeComponent, setActiveComponent] = useState<
    "search" | "feedback" | "alert" | "news" | null
  >(null)

  return (
    <SidebarWrapper
      isOpen={activeComponent !== null}
      onClose={() => setActiveComponent(null)}
      storageKey="admin-menu-width"
      defaultWidth={320}
      minWidth={250}
      maxWidth={600}
    >
      {(width) => (
        <>
          {/* Picker buttons positioned relative to sidebar */}
          <div 
            className='pointer-events-none fixed right-0 h-full flex items-center'
            style={{ 
              right: activeComponent ? `${width + 2}px` : '0px'
            }}
          >
            <div
              className={`pointer-events-auto flex flex-col gap-3 rounded-l-lg bg-ax-bg-default p-3 ${activeComponent ? "opacity-100" : "opacity-10"} border-y border-l border-ax-border-neutral-subtle transition-opacity duration-700 hover:opacity-100`}
            >
              <Button
                data-color="neutral"
                size='small'
                variant="primary"
                icon={<MagnifyingGlassIcon />}
                className={`${activeComponent === "search" ? "bg-[#49515E]" : "bg-[#B65781]"} hover:bg-[#555D6A]`}
                onClick={() =>
                  setActiveComponent(activeComponent === "search" ? null : "search")
                } />
              <Button
                data-color="neutral"
                size='small'
                variant="primary"
                icon={<ChatExclamationmarkIcon />}
                className={`${activeComponent === "feedback" ? "bg-[#49515E]" : "bg-[#B65781]"} hover:bg-[#555D6A]`}
                onClick={() =>
                  setActiveComponent(
                    activeComponent === "feedback" ? null : "feedback",
                  )
                } />
              <Button
                data-color="neutral"
                size='small'
                variant="primary"
                icon={<ExclamationmarkTriangleIcon />}
                className={`${activeComponent === "alert" ? "bg-[#49515E]" : "bg-[#B65781]"} hover:bg-[#555D6A]`}
                onClick={() =>
                  setActiveComponent(activeComponent === "alert" ? null : "alert")
                } />
              <Button
                data-color="neutral"
                size='small'
                variant="primary"
                icon={<BellDotIcon />}
                className={`${activeComponent === "news" ? "bg-[#49515E]" : "bg-[#B65781]"} hover:bg-[#555D6A]`}
                onClick={() =>
                  setActiveComponent(activeComponent === "news" ? null : "news")
                } />
            </div>
          </div>
          
          {/* Sidebar content */}
          <div className="h-full">
            {activeComponent === "search" && <SearchConversation />}
            {activeComponent === "feedback" && <FeedbackFromUsers />}
            {activeComponent === "alert" && <CreateAlert />}
            {activeComponent === "news" && <CreateNews />}
          </div>
        </>
      )}
    </SidebarWrapper>
  );
}

export default AdminMenuWrapper
