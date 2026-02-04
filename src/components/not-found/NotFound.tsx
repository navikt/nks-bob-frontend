import { BodyShort, Button, Heading, HStack, Stack, VStack } from "@navikt/ds-react"
import Header from "../header/Header"
import { NotePencilIcon } from "@navikt/aksel-icons"
import { Link } from "react-router"
import embarressedBob from "../../assets/illustrations/EmbarrassedBob.svg"

export const PageNotFound = () => {
  return (
    <>
      <Header conversation={undefined} />
      <HStack height='100vh'>
        <Stack
          gap='space-64'
          width='100%'
          justify='center'
          align='center'
          direction={{ xs: "column", lg: "row" }}
        >
          <img
            src={embarressedBob}
            alt='Embarresed Bob'
            width='200px'
          />
          <VStack
            gap='space-16'
            maxWidth={{ xs: "70%", lg: "30%" }}
          >
            <Heading size='medium'>Siden ble ikke funnet</Heading>
            <BodyShort>Det ser ut til at lenken ikke fungerer. Prøv å starte en ny samtale.</BodyShort>
            <Link to='/'>
              <Button
                size='small'
                className='max-w-64'
                icon={<NotePencilIcon />}
                as='a'
              >
                Start en ny samtale
              </Button>
            </Link>
          </VStack>
        </Stack>
      </HStack>
    </>
  )
}
