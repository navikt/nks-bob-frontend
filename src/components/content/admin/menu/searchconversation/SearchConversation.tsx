import { Chat2Icon } from "@navikt/aksel-icons"
import {
  BodyShort,
  Button,
  Heading,
  HStack,
  Label,
  TextField,
  VStack,
} from "@navikt/ds-react"

const SearchConversation = () => {
  return (
    <VStack>
      <div className='mb-2 w-full border-b border-b-border-subtle p-4'>
        <Heading size='xsmall'>Søk etter samtale</Heading>
      </div>
      <div className='max-w-full'>
        <VStack className='mb-6 p-4'>
          <BodyShort size='small' className='mb-6'>
            Bruk enten samtale-id eller meldings-id for å finne samtalen det
            gjelder.
          </BodyShort>
          <TextField
            size='small'
            label='Søk etter samtale-id'
            className='mb-6'
          ></TextField>
          <TextField
            size='small'
            label='Søk etter meldings-id'
            className='mb-6'
          ></TextField>
          <Button variant='primary-neutral' size='small' className='w-fit px-4'>
            Søk
          </Button>
        </VStack>
        <VStack>
          <HStack className='w-full bg-[#F5F6F7] p-4' gap='2' align='center'>
            <Chat2Icon fontSize={20} />
            <Label size='small'>Samtale</Label>
          </HStack>
          <div className='h-full w-full overflow-auto p-4'>
            <BodyShort size='small'>Samtalen vises her ved søk</BodyShort>
          </div>
        </VStack>
      </div>
    </VStack>
  )
}

export default SearchConversation
