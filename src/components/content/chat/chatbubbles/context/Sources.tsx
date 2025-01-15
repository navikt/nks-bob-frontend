import { ExternalLinkIcon } from "@navikt/aksel-icons"
import {
  BodyShort,
  Heading,
  Label,
  Link,
  ReadMore,
  VStack,
} from "@navikt/ds-react"
import { Context } from "../../../../../types/Message"

export const Sources = ({ context }: { context: Context[] }) => {
  const nksContext = context.filter(({ source }) => source === "nks")
  const navContext = context.filter(({ source }) => source === "navno")

  return (
    <ReadMore header='Kilder' className='mt-4'>
      <VStack className='py-2'>
        <BodyShort>
          Denne oversikten viser kildene Bob har brukt, men siden han bare leser
          deler av dem, kan det være vanskelig å finne den eksakte informasjonen
          som støtter svaret.
        </BodyShort>
        <VStack gap='4'>
          <VStack gap='3'>
            <Heading level='2' size='xsmall'>
              Kunnskapsbasen
            </Heading>
            {nksContext.map((ctx) => (
              <NksSource context={ctx} />
            ))}
          </VStack>
          <VStack gap='3'>
            <Heading level='2' size='xsmall'>
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
}

const NksSource = ({ context }: { context: Context }) => {
  return (
    <Label size='small'>
      <Link href={`${context.url}#${context.anchor}`} target='_blank'>
        {context.title}
        <ExternalLinkIcon title='Åpne artikkelen i ny fane' />
      </Link>
    </Label>
  )
}

const NavSource = ({ context }: { context: Context }) => {
  return (
    <Label size='small'>
      <Link href={`${context.url}#${context.anchor}`} target='_blank'>
        {context.title} - {context.anchor}
        <ExternalLinkIcon title='Åpne artikkelen i ny fane' />
      </Link>
    </Label>
  )
}
