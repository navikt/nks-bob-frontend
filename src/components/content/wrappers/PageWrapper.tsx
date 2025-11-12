import { ReactNode } from "react"
import { LoginBoundary } from "../../LoginBoundary"
import { ErrorBoundary } from "react-error-boundary"
import Header from "../../header/Header"
import embarressedBob from "../../../assets/illustrations/EmbarrassedBob.svg"
import { BodyShort, Button, Heading, HStack, VStack } from "@navikt/ds-react"
import { ArrowsCirclepathIcon } from "@navikt/aksel-icons"
import * as api from "../../../api/api"

const ErrorComponent = ({ error }: { error: any; resetErrorBoundary: (...args: any[]) => void }) => {
  console.log({ error })
  return (
    <div className='h-dvh justify-start'>
      <Header conversation={undefined} />
      <HStack
        className='h-dvh'
        gap='16'
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
          gap='4'
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
        onError={(error: Error) => api.log("error", error.message)}
      >
        <LoginBoundary>{children}</LoginBoundary>
      </ErrorBoundary>
    </div>
  )
}

export default PageWrapper
