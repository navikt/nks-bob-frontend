import {
  BulletListIcon,
  ChatExclamationmarkIcon,
  FilesIcon,
  HandHeartIcon,
  LanguageIcon,
  StarIcon,
} from "@navikt/aksel-icons"
import { BodyShort, HStack } from "@navikt/ds-react"

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
