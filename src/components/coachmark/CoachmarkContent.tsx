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
import { BodyShort, HStack, VStack } from "@navikt/ds-react"
import DarkModeToggle from "../menu/darkmode/DarkModeToggle.tsx"

export const AnswerButtonsExplanation = () => {
  return (
    <div className='flex flex-col gap-2'>
      <HStack align='center' gap='2'>
        <FilesIcon />
        <BodyShort>Kopiere svaret</BodyShort>
      </HStack>
      <HStack align='center' gap='2'>
        <ChatExclamationmarkIcon />
        <BodyShort>Melde inn feil- eller falskt svar</BodyShort>
      </HStack>
      <HStack align='center' gap='2'>
        <StarIcon />
        <BodyShort>Markere svaret som svært godt</BodyShort>
      </HStack>
      <HStack align='center' gap='2'>
        <LanguageIcon />
        <BodyShort>Oversette svaret til engelsk</BodyShort>
      </HStack>
      <HStack align='center' gap='2'>
        <BulletListIcon />
        <BodyShort>Lage svaret med punktliste</BodyShort>
      </HStack>
      <HStack align='center' gap='2' className='mb-3'>
        <HandHeartIcon />
        <BodyShort>Lage svaret mer empatisk</BodyShort>
      </HStack>
    </div>
  )
}

export const MainButtonsExplanation = () => {
  return (
    <VStack gap='6' className='mb-2'>
      <HStack align='start' gap='2' wrap={false}>
        <div className='mt-1'>
          <NotePencilIcon color='#2277D5' />
        </div>
        <BodyShort>
          Fjerner alt fra denne samtalen og oppretter en ny. Egner seg godt når
          man ønsker å spørre om et nytt tema.
        </BodyShort>
      </HStack>
      <HStack align='start' gap='2' wrap={false}>
        <div className='mt-1'>
          <InformationSquareIcon color='#2277D5' />
        </div>
        <BodyShort>
          Informasjon og veiledning om hvordan du best kan bruke tjenesten.
        </BodyShort>
      </HStack>
      <HStack gap='2' wrap={false}>
        <div className='mt-1'>
          <DarkModeToggle />
        </div>
        <BodyShort>Sliten i øynene? Bryteren gjør om til mørkmodus.</BodyShort>
      </HStack>
    </VStack>
  )
}
