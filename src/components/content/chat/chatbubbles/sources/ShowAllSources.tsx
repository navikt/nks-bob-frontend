import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  XMarkIcon,
} from "@navikt/aksel-icons"
import {
  BodyLong,
  BodyShort,
  Button,
  Heading,
  HStack,
  Label,
  Link,
  VStack,
} from "@navikt/ds-react"
import { createContext, memo, PropsWithChildren, useContext, useState } from "react"
import Markdown from "react-markdown"
import { KunnskapsbasenIcon } from "../../../../../assets/icons/KunnskapsbasenIcon.tsx"
import { NavNoIcon } from "../../../../../assets/icons/NavNoIcon.tsx"
import { Context } from "../../../../../types/Message.ts"
import "./ShowAllSources.css"

const SourcesContext = createContext({
  viewAllSources: false,
  toggleViewAllSources: () => { },
})

export const useSourcesContext = () => useContext(SourcesContext)

export const SourcesContextProvider = ({ children }: PropsWithChildren) => {
  const [viewAllSources, setViewAllSources] = useState(false)

  const toggleViewAllSources = () => {
    setViewAllSources((prev) => !prev)
  }

  return (
    <SourcesContext.Provider value={{
      viewAllSources,
      toggleViewAllSources,
    }}>
      {children}
    </SourcesContext.Provider>
  )
}

interface ShowAllSourcesProps {
  context: Context[]
}

export const ShowAllSources = memo(
  ({ context }: ShowAllSourcesProps) => {
    const nksContext = context.filter(({ source }) => source === "nks")
    const navContext = context.filter(({ source }) => source === "navno")

    const { viewAllSources, toggleViewAllSources } = useSourcesContext()

    return (
      viewAllSources &&
      <VStack className='all-sources-container'>
        <HStack justify='space-between' className='heading items-center'>
          <Heading size='xsmall'>Alle kilder</Heading>
          <Button
            variant='tertiary-neutral'
            size='small'
            icon={<XMarkIcon />}
            onClick={() => toggleViewAllSources()}
          />
        </HStack>
        <VStack className='sourcelist pt-6'>
          <BodyLong size='small' className='px-4' spacing>
            Her finner du alle kildene Bob hadde tilgang til for å besvare
            spørsmålet. Merk at for hver artikkel listet opp her så har ikke Bob
            tilgang til hele artikkelen, men kun et utdrag av den.{" "}
          </BodyLong>
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
        </VStack>
      </VStack>
    )
  },
  (prevProps, nextProps) => {
    const prevContext = prevProps.context
    const nextContext = nextProps.context

    if (prevContext.length === nextContext.length) {
      return true
    }

    return prevContext === nextContext
  },
)

const NksSource = ({ context }: { context: Context }) => {
  return (
    <VStack className='sourcepanel gap-3'>
      <Label size='small'>
        <Link href={`${context.url}#${context.anchor}`} target='_blank'>
          {context.title}
          <ExternalLinkIcon title='Åpne artikkelen i ny fane' />
        </Link>
      </Label>
      <UtdragDropDown context={context} />
    </VStack>
  )
}

const NavSource = ({ context }: { context: Context }) => {
  return (
    <VStack className='sourcepanel gap-3'>
      <Label size='small'>
        <Link href={`${context.url}#${context.anchor}`} target='_blank'>
          {context.title} / {context.anchor}
          <ExternalLinkIcon title='Åpne artikkelen i ny fane' />
        </Link>
      </Label>
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
        <BodyShort size='small' className='mb-0'>
          {isOpen ? "Skjul utdraget" : "Se utdraget"}
        </BodyShort>
        {isOpen ? (
          <ChevronUpIcon className='dropdownchevronup' />
        ) : (
          <ChevronDownIcon className='dropdownchevrondown' />
        )}
      </HStack>
      {isOpen && (
        <BodyLong size='small' className='mt-4' onClick={toggleOpen}>
          <Markdown
            className='markdown'
            components={{
              a: ({ ...props }) => (
                <a {...props} target='_blank' rel='noopener noreferrer' />
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
