import {
  BulletListIcon,
  ChatExclamationmarkIcon,
  FilesIcon,
  HandHeartIcon,
  InformationSquareIcon,
  LanguageIcon,
  NotePencilIcon,
  StarIcon,
} from "@navikt/aksel-icons"
import { BodyShort, Button, HStack, VStack } from "@navikt/ds-react"
import { ThemeButton } from "../menu/darkmode/DarkModeToggle"

export const AnswerButtonsExplanation = () => {
  return (
    <div className='flex flex-col gap-2'>
      <HStack
        align='center'
        gap='space-8'
      >
        <FilesIcon />
        <BodyShort>Kopiere svaret</BodyShort>
      </HStack>
      <HStack
        align='center'
        gap='space-8'
      >
        <ChatExclamationmarkIcon />
        <BodyShort>Melde inn feil- eller falskt svar</BodyShort>
      </HStack>
      <HStack
        align='center'
        gap='space-8'
      >
        <StarIcon />
        <BodyShort>Markere svaret som svært godt</BodyShort>
      </HStack>
      <HStack
        align='center'
        gap='space-8'
      >
        <LanguageIcon />
        <BodyShort>Oversette svaret til engelsk</BodyShort>
      </HStack>
      <HStack
        align='center'
        gap='space-8'
      >
        <BulletListIcon />
        <BodyShort>Lage svaret med punktliste</BodyShort>
      </HStack>
      <HStack
        align='center'
        gap='space-8'
        className='mb-3'
      >
        <HandHeartIcon />
        <BodyShort>Lage svaret mer empatisk</BodyShort>
      </HStack>
    </div>
  )
}

export const MainButtonsExplanation = () => {
  return (
    <VStack
      gap='space-24'
      className='mb-2'
    >
      <HStack
        align='start'
        gap='space-8'
        wrap={false}
      >
        <Button
          data-color='neutral'
          variant='tertiary'
          size='medium'
          icon={<NotePencilIcon aria-hidden />}
          aria-label='Start ny samtale'
        />
        <BodyShort>
          Fjerner alt fra denne samtalen og oppretter en ny. Egner seg godt når man ønsker å spørre om et nytt tema.
        </BodyShort>
      </HStack>
      <HStack
        align='start'
        gap='space-8'
        wrap={false}
      >
        <Button
          data-color='neutral'
          variant='tertiary'
          size='medium'
          icon={<InformationSquareIcon aria-hidden />}
          aria-label='Start ny samtale'
        />
        <BodyShort>Informasjon og veiledning om hvordan du best kan bruke tjenesten.</BodyShort>
      </HStack>
      <HStack
        gap='space-8'
        wrap={false}
      >
        <ThemeButton />
        <BodyShort>Sliten i øynene? Knappen gjør om til mørkmodus.</BodyShort>
      </HStack>
    </VStack>
  )
}
