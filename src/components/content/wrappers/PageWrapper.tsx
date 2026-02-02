import { ArrowsCirclepathIcon } from "@navikt/aksel-icons"
import { BodyShort, Button, Heading, HStack, VStack } from "@navikt/ds-react"
import { ReactNode } from "react"
import { ErrorBoundary } from "react-error-boundary"
import * as api from "../../../api/api"
import embarressedBob from "../../../assets/illustrations/EmbarrassedBob.svg"
import Header from "../../header/Header"
import { LoginBoundary } from "../../LoginBoundary"

const ErrorComponent = ({ error }: { error: any; resetErrorBoundary: (...args: any[]) => void }) => {
  console.log({ error })
  return (
    <div className='h-dvh justify-start'>
      <Header conversation={undefined} />
      <HStack
        className='h-dvh'
        gap='space-16'
        align='center'
        justify='center'
      >
        <img
          src={embarressedBob}
          alt='Embarresed Bob'
          width='200px'
        />
        <VStack
          className='max-w-[30%]'
          gap='space-4'
        >
          <Heading size='medium'>Det har oppstått en uventet feil</Heading>
          <BodyShort>
            Prøv å laste inn siden på nytt ved å trykke på knappen under. Hvis problemet skjer flere ganger, gi gjerne
            beskjed til Bob-teamet i Teams-kanalen.
          </BodyShort>
          <Button
            size='small'
            className='max-w-64'
            icon={<ArrowsCirclepathIcon />}
            onClick={() => window.location.reload()}
          >
            Last inn siden på nytt
          </Button>
        </VStack>
      </HStack>
    </div>
  )
}

interface PageWrapperProps {
  children: ReactNode
}

function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className='pagewrapper'>
      <ErrorBoundary
        FallbackComponent={ErrorComponent}
        onError={(error: Error) => {
          if (error.message === "network error") {
            // Vanlig feil som oppstår om man åpner en fane med en utlogget sesjon
            return api.log("warn", error.message)
          }

          return api.log("error", error.message)
        }}
      >
        <LoginBoundary>{children}</LoginBoundary>
      </ErrorBoundary>
    </div>
  )
}

export default PageWrapper
