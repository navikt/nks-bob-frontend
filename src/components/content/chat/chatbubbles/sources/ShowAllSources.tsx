import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, Button, CopyButton, Heading, HStack, Label, Link, VStack } from "@navikt/ds-react"
import { useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { create } from "zustand"
import { KunnskapsbasenIcon } from "../../../../../assets/icons/KunnskapsbasenIcon.tsx"
import { NavNoIcon } from "../../../../../assets/icons/NavNoIcon.tsx"
import { Context, Message } from "../../../../../types/Message.ts"
import analytics from "../../../../../utils/analytics.ts"
import "./ShowAllSources.css"

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
            <HStack className='sourceheading gap-2'>
              <KunnskapsbasenIcon />
              <BodyShort size='small'>Kunnskapsbasen</BodyShort>
            </HStack>
            <VStack className='my-1'>
              {nksContext.map((ctx) => (
                <NksSource context={ctx} />
              ))}
            </VStack>
          </VStack>
        )}
        {navContext.length > 0 && (
          <VStack className='sourcepanel-list'>
            <HStack className='sourceheading gap-2'>
              <NavNoIcon />
              <BodyShort size='small'>Nav.no</BodyShort>
            </HStack>
            <VStack className='my-1'>
              {navContext.map((ctx) => (
                <NavSource context={ctx} />
              ))}
            </VStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  )
}

const NksSource = ({ context }: { context: Context }) => {
  return (
    <VStack className='sourcepanel gap-3'>
      <HStack
        align='center'
        gap='1'
      >
        <Link
          href={`${context.url}#${context.anchor}`}
          target='_blank'
          onClick={analytics.kbVisAlleKilderLenkeKlikket}
        >
          <Label size='small'>{context.title}</Label>
        </Link>
        <CopyButton
          copyText={context.title}
          size='xsmall'
          onClick={analytics.kbVisAlleKilderLenkeKopiert}
        />
      </HStack>
      <UtdragDropDown context={context} />
    </VStack>
  )
}

const NavSource = ({ context }: { context: Context }) => {
  const title =
    context.source === "nks"
      ? context.title
      : context.anchor !== null
        ? `${context.title} / ${context.anchor}`
        : context.title

  return (
    <VStack className='sourcepanel gap-3'>
      <HStack
        align='center'
        gap='1'
      >
        <Link
          href={`${context.url}#${context.anchor}`}
          target='_blank'
          onClick={analytics.navVisAlleKilderLenkeKlikket}
        >
          <Label size='small'>{title}</Label>
        </Link>
        <CopyButton
          copyText={context.title}
          size='xsmall'
          onClick={analytics.navVisAlleKilderLenkeKopiert}
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
