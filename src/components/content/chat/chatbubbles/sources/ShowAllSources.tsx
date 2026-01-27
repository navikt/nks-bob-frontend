import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, Button, CopyButton, Detail, Heading, HStack, VStack } from "@navikt/ds-react"
import { useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { create } from "zustand"

import { ShowAllSourcesIcon } from "../../../../../assets/icons/ShowAllSourcesIcon.tsx"
import { Context, Message } from "../../../../../types/Message.ts"
import analytics from "../../../../../utils/analytics.ts"
import { SourceIcon, TextFragmentLink } from "../BobAnswerCitations.tsx"
import "./ShowAllSources.css"
import { buildLinkTitle } from "../../../../../utils/link.ts"

type SourcesState = {
  activeMessage: Message | null
  setActiveMessage: (_message: Message | null) => void
}

export const useSourcesStore = create<SourcesState>()((set) => ({
  activeMessage: null,
  setActiveMessage: (activeMessage) =>
    set((state) => {
      if (activeMessage !== null) {
        analytics.visAlleKilderÅpnet()
      }

      return { ...state, activeMessage }
    }),
}))

export const ShowAllSources = () => {
  const { activeMessage, setActiveMessage } = useSourcesStore()

  const context = activeMessage?.context
  const nksContext = context?.filter(({ source }) => source === "nks") ?? []
  const navContext = context?.filter(({ source }) => source === "navno") ?? []

  const tools = activeMessage?.tools ?? []

  return (
    <VStack className={`all-sources-container ${activeMessage ? "active" : "inactive"}`}>
      <HStack
        justify='space-between'
        className='heading items-center'
      >
        <Heading size='xsmall'>Alle kilder</Heading>
        <Button
          variant='tertiary-neutral'
          size='small'
          icon={<XMarkIcon />}
          onClick={() => setActiveMessage(null)}
        />
      </HStack>
      <VStack className='sourcelist pt-6'>
        <BodyLong
          size='small'
          className='px-4'
          spacing
        >
          Her finner du alle kildene Bob har brukt for å generere svaret. Merk at for hver oppført artikkel har Bob kun
          lest et utdrag, ikke hele artikkelen. Du kan se utdraget under lenken til artikkelen.
        </BodyLong>
        {nksContext.length > 0 && (
          <VStack>
            <div className='bg-[rgba(245,246,247,1)] px-4 py-2'>
              <SourceIcon source='nks' />
            </div>
            <VStack className='my-1'>
              {nksContext.map((ctx) => (
                <NksSource
                  context={ctx}
                  tools={tools}
                />
              ))}
            </VStack>
          </VStack>
        )}
        {navContext.length > 0 && (
          <VStack className='sourcepanel-list'>
            <div className='bg-[rgba(245,246,247,1)] px-4 py-2'>
              <SourceIcon source='navno' />
            </div>
            <VStack className='my-1'>
              {navContext.map((ctx) => (
                <NavSource
                  context={ctx}
                  tools={tools}
                />
              ))}
            </VStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  )
}

const NksSource = ({ context, tools }: { context: Context; tools: string[] }) => {
  return (
    <VStack className='sourcepanel gap-3'>
      <HStack
        align='center'
        gap='1'
      >
        <TextFragmentLink
          text={buildLinkTitle(context)}
          matchingContextCitationData={context}
          className='inline'
          onClick={() =>
            analytics.kbVisAlleKilderLenkeKlikket(
              { kilde: context.source, tittel: context.title, artikkelKolonne: context.articleColumn },
              tools,
            )
          }
        />
        <CopyButton
          copyText={context.title}
          size='xsmall'
          onClick={() =>
            analytics.kbVisAlleKilderLenkeKopiert(
              { kilde: context.source, tittel: context.title, artikkelKolonne: context.articleColumn },
              tools,
            )
          }
        />
      </HStack>
      <UtdragDropDown context={context} />
    </VStack>
  )
}

const NavSource = ({ context, tools }: { context: Context; tools: string[] }) => {
  return (
    <VStack className='sourcepanel gap-3'>
      <HStack
        align='center'
        gap='1'
      >
        <TextFragmentLink
          text={context.content}
          title={buildLinkTitle(context)}
          anchor={context.anchor ?? undefined}
          matchingContextCitationData={context}
          className='inline'
          onClick={() =>
            analytics.navVisAlleKilderLenkeKlikket({ kilde: context.source, tittel: context.title }, tools)
          }
        />
        <CopyButton
          copyText={context.title}
          size='xsmall'
          onClick={() =>
            analytics.navVisAlleKilderLenkeKopiert({ kilde: context.source, tittel: context.title }, tools)
          }
        />
      </HStack>
      <UtdragDropDown context={context} />
    </VStack>
  )
}

const UtdragDropDown = ({ context }: { context: Context }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  return (
    <VStack className='utdrag-container cursor-pointer'>
      <HStack
        onClick={toggleOpen}
        className='utdrag-dropdown gap-x-0.5'
        align='stretch'
      >
        <BodyShort
          size='small'
          className='mb-0'
        >
          {isOpen ? "Skjul utdraget" : "Se utdraget"}
        </BodyShort>
        {isOpen ? <ChevronUpIcon className='dropdownchevronup' /> : <ChevronDownIcon className='dropdownchevrondown' />}
      </HStack>
      {isOpen && (
        <BodyLong
          size='small'
          className='mt-4'
          onClick={toggleOpen}
        >
          <Markdown
            className='markdown'
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ ...props }) => (
                <a
                  {...props}
                  target='_blank'
                  rel='noopener noreferrer'
                />
              ),
            }}
          >
            {context.content}
          </Markdown>
        </BodyLong>
      )}
    </VStack>
  )
}

interface ShowAllSourcesToggleProps {
  message: Message
  toggleTitle: string
}

export const ShowAllSourcesToggle = ({ message, toggleTitle }: ShowAllSourcesToggleProps) => {
  const { activeMessage, setActiveMessage } = useSourcesStore()
  const isActive = activeMessage !== null && activeMessage.id === message.id
  const toggleActive = () => setActiveMessage(isActive ? null : message)

  return (
    <button
      type='button'
      aria-pressed={isActive}
      onClick={toggleActive}
      className='navds-chips__toggle navds-chips__toggle--neutral h-[26px] rounded-full px-2 py-[1px] aria-pressed:text-[rgba(223_225_229/1)] dark:aria-pressed:text-[rgba(0_0_0/1)] aria-pressed:dark:hover:bg-[rgba(148,155,168,1)]'
    >
      <div className='flex items-center gap-1'>
        <ShowAllSourcesIcon />
        <Detail
          aria-pressed={isActive}
          className='aria-pressed:dark:text-[rgba(0,0,0,1)]'
        >
          {toggleTitle}
        </Detail>
      </div>
    </button>
  )
}

export const NoSourcesNeeded = () => {
  return (
    <div className='rounded-full border border-[rgb(7_26_54/0.21)] bg-[rgb(18_43_68/0.08)] px-2 py-[2px] dark:border-[rgba(224_237_254/0.15)] dark:bg-[rgba(28_35_47/1)]'>
      <Detail>Bob brukte ingen kilder for å lage svaret</Detail>
    </div>
  )
}
