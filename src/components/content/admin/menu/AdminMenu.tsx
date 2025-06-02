import {
  BellDotIcon,
  ChatExclamationmarkIcon,
  ExclamationmarkTriangleIcon,
  MagnifyingGlassIcon,
} from "@navikt/aksel-icons"
import { Button, HStack } from "@navikt/ds-react"
import { useEffect, useRef, useState } from "react"
import { useUserConfig } from "../../../../api/api.ts"
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
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveComponent(null)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [menuRef, setActiveComponent])

  return (
    <>
      <HStack
        className='pointer-events-none fixed right-0 h-full items-center'
        ref={menuRef}
      >
        <div
          className={`pointer-events-auto flex flex-col gap-3 rounded-l-lg bg-bg-default p-3 ${activeComponent ? "opacity-100" : "opacity-10"} z-0 border-y border-l border-border-subtle transition-opacity duration-700 hover:opacity-100`}
        >
          <Button
            size='small'
            variant='primary-neutral'
            icon={<MagnifyingGlassIcon />}
            className={`${activeComponent === "search" ? "bg-[#49515E]" : "bg-[#B65781]"} hover:bg-[#555D6A]`}
            onClick={() =>
              setActiveComponent(activeComponent === "search" ? null : "search")
            }
          />
          <Button
            size='small'
            variant='primary-neutral'
            icon={<ChatExclamationmarkIcon />}
            className={`${activeComponent === "feedback" ? "bg-[#49515E]" : "bg-[#B65781]"} hover:bg-[#555D6A]`}
            onClick={() =>
              setActiveComponent(
                activeComponent === "feedback" ? null : "feedback",
              )
            }
          />
          <Button
            size='small'
            variant='primary-neutral'
            icon={<ExclamationmarkTriangleIcon />}
            className={`${activeComponent === "alert" ? "bg-[#49515E]" : "bg-[#B65781]"} hover:bg-[#555D6A]`}
            onClick={() =>
              setActiveComponent(activeComponent === "alert" ? null : "alert")
            }
          />
          <Button
            size='small'
            variant='primary-neutral'
            icon={<BellDotIcon />}
            className={`${activeComponent === "news" ? "bg-[#49515E]" : "bg-[#B65781]"} hover:bg-[#555D6A]`}
            onClick={() =>
              setActiveComponent(activeComponent === "news" ? null : "news")
            }
          />
        </div>
        <div
          className={`z-101 z-1 pointer-events-auto mt-1 h-full max-w-80 overflow-y-auto border-l border-border-subtle bg-bg-default`}
        >
          {activeComponent === "search" && <SearchConversation />}
          {activeComponent === "feedback" && <FeedbackFromUsers />}
          {activeComponent === "alert" && <CreateAlert />}
          {activeComponent === "news" && <CreateNews />}
        </div>
      </HStack>
    </>
  )
}

export default AdminMenuWrapper
