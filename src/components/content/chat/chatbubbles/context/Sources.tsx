import { BodyShort, Button, Heading, HStack, Label, Link, Popover, ReadMore, VStack } from "@navikt/ds-react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Context } from "../../../../../types/Message"
import { ExternalLinkIcon, InformationSquareIcon } from "@navikt/aksel-icons"
import { memo, useRef, useState } from "react"

/* NOTE: Not in use. */
export const Sources = memo(
  ({ context }: { context: Context[] }) => {
    const nksContext = context.filter(({ source }) => source === "nks")
    const navContext = context.filter(({ source }) => source === "navno")

    return (
      <ReadMore
        header='Kilder'
        className='mt-4'
      >
        <VStack className='py-2'>
          <BodyShort>
            Denne oversikten viser kildene Bob har brukt, men siden han bare leser deler av dem, kan det være vanskelig
            å finne den eksakte informasjonen som støtter svaret.
          </BodyShort>
          <VStack gap='space-4'>
            <VStack gap='space-2'>
              <Heading
                level='2'
                size='xsmall'
              >
                Kunnskapsbasen
              </Heading>
              {nksContext.map((ctx) => (
                <NksSource context={ctx} />
              ))}
            </VStack>
            <VStack gap='space-2'>
              <Heading
                level='2'
                size='xsmall'
              >
                Nav.no
              </Heading>
              {navContext.map((ctx) => (
                <NavSource context={ctx} />
              ))}
            </VStack>
          </VStack>
        </VStack>
      </ReadMore>
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
    <HStack>
      <Label size='small'>
        <Link
          href={`${context.url}#${context.anchor}`}
          target='_blank'
        >
          {context.title}
          <ExternalLinkIcon title='Åpne artikkelen i ny fane' />
        </Link>
      </Label>
      <ArticleSummary context={context} />
    </HStack>
  )
}

const NavSource = ({ context }: { context: Context }) => {
  return (
    <HStack>
      <Label size='small'>
        <Link
          href={`${context.url}#${context.anchor}`}
          target='_blank'
        >
          {context.title} - {context.anchor}
          <ExternalLinkIcon title='Åpne artikkelen i ny fane' />
        </Link>
      </Label>
      <ArticleSummary context={context} />
    </HStack>
  )
}

const ArticleSummary = ({ context }: { context: Context }) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        size='xsmall'
        variant='tertiary'
        title='Vis utdrag fra artikkel'
      >
        <InformationSquareIcon />
      </Button>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={buttonRef.current}
        className='max-h-96 max-w-prose overflow-auto'
      >
        <Popover.Content>
          <Heading
            level='3'
            size='small'
          >
            {context.title}
          </Heading>
          <BodyShort>{context.ingress}</BodyShort>
          <Markdown remarkPlugins={[remarkGfm]}>{context.content}</Markdown>
        </Popover.Content>
      </Popover>
    </>
  )
}
