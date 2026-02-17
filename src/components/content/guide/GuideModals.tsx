import { BodyLong, BodyShort, Button, Heading, HStack, Link, Modal, VStack } from "@navikt/ds-react"
import { useState } from "react"
import { useUpdateUserConfig } from "../../../api/api.ts"
import { BobTheGuide1 } from "../../../assets/illustrations/BobTheGuide.tsx"
import { SitaterFraKB, SitaterFraNavno, VisAlleKilder } from "../../../assets/illustrations/ChipsIllustrations.tsx"
import { StepSelect } from "./StepSelect.tsx"

export const NewConceptMessage = () => {
  const { updateUserConfig } = useUpdateUserConfig()
  const [newConceptMessage, setNewConceptMessage] = useState<boolean>(true)

  const handleClick = () => {
    updateUserConfig({
      showNewConceptInfo: false,
    }).then(() => {
      setNewConceptMessage(false)
    })
  }

  return (
    newConceptMessage && (
      <div>
        <div className='modal-overlay' />
        <div className='guide-modal fade-in items-center gap-4'>
          <div className='self-center'>
            <BobTheGuide1 />
          </div>
          <VStack
            className='modal-container'
            gap='space-16'
          >
            <Heading
              size='small'
              level='2'
            >
              Møt den nye Bob!
            </Heading>
            <BodyLong>
              Bob har fått et nytt utseende! Nå møter du en smart, liten robot som lærer og utvikler seg for å gi deg
              enda bedre støtte. Vi har endret hvordan Bob fremstilles for å unngå personifisering av kunstig
              intelligens.
            </BodyLong>
            <BodyLong>Les mer om endringen i nyhetssaken.</BodyLong>
            <BodyLong className='mb-4'>Samme Bob – ny drakt. La oss komme i gang!</BodyLong>
            <Button
              data-color='neutral'
              variant='primary'
              className='w-fit'
              onClick={handleClick}
            >
              Takk for det, Bob!
            </Button>
          </VStack>
        </div>
      </div>
    )
  )
}

const WelcomeMessage = () => (
  <BodyLong>
    Du er nok ivrig etter å starte. Men ta en rask titt på denne guiden før du starter – det hjelper deg å få bedre
    svar.
  </BodyLong>
)

const Step1 = () => (
  <>
    <BodyLong>
      Jeg er en kunstig intelligens, altså et dataprogram designet for å hjelpe deg med spørsmål og informasjon
      spesifikt om tjenestene Nav tilbyr.
    </BodyLong>
    <BodyLong>
      Svarene du mottar baserer seg kun på informasjonen fra{" "}
      <Link
        href='https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/index.html'
        target='_blank'
      >
        NKS Kunnskapsbasen
      </Link>
      {" og "}
      <Link
        href='https://nav.no/'
        target='_blank'
      >
        nav.no
      </Link>
      .
    </BodyLong>
  </>
)

const Step2 = () => (
  <BodyLong>
    Du tar i bruk tjenesten ved å spørre meg om noe nav-relatert i tekstfeltet.
    <ul className='mb-6'>
      <li>Still hele spørsmål, ikke bare stikkord.</li>
      <li>Vær detaljert og tydelig.</li>
      <li>Forklar situasjonen eller gi mer kontekst.</li>
      <li>Still oppfølgingsspørsmål hvis noe mangler.</li>
    </ul>
    Spesielt viktig:
    <ul className='my-2 gap-1'>
      <li>
        Ikke del <strong>personlige opplysninger</strong> når du sender meg spørsmål.
      </li>
      <li>
        <strong>Kontroller kilden</strong> om du er usikker på om svaret er korrekt.
      </li>
      <li>
        Husk å <strong>starte en ny samtale</strong> når du får en ny henvendelse – da unngår du at Bob blander temaer.
      </li>
    </ul>
  </BodyLong>
)

const Step3 = () => (
  <>
    <BodyLong className='mb-2'>
      Hver gang du mottar et svar fra Bob baserer det seg på informasjon hentet fra Kunnskapsbasen og Nav.no. Hen velger
      det som er mest relevant for spørsmålet ditt.
    </BodyLong>
    <VStack>
      <HStack className='mb-2'>
        <SitaterFraKB />
        <SitaterFraNavno />
      </HStack>
      <BodyLong className='mb-3'>
        Under svaret finner du sitater fra relevante artikler. Disse hjelper deg med å raskt sjekke at informasjonen
        stemmer.
      </BodyLong>
    </VStack>
    <VStack>
      <div className='mb-3 self-start'>
        <VisAlleKilder />
      </div>
      <BodyLong>
        Bob viser også en liste over alle kildene han har vurdert. Det betyr ikke at alle artiklene er brukt i svaret,
        men at han har sett på dem for å finne relevant informasjon.
      </BodyLong>
    </VStack>
  </>
)

const Step4 = () => (
  <>
    <BodyLong spacing>Husk at du kan be om svaret akkurat slik du ønsker det.</BodyLong>
    <BodyShort>For eksempel kan du be Bob om å:</BodyShort>
    <ul className='mb-6'>
      <li>Oversette til engelsk eller nynorsk</li>
      <li>Legge til detaljer om andre ytelser</li>
      <li>Forenkle forklaringen</li>
    </ul>
    <BodyLong spacing>
      Du kan til og med be Bob om å skrive svaret som en pirat, eller på en annen kreativ måte. Mulighetene er mange –
      du bestemmer!
    </BodyLong>
  </>
)

const Step5 = () => (
  <>
    <BodyLong>Følgende hurtigtaster kan du benytte deg av:</BodyLong>
    <ul className='mb-6'>
      <li>
        Ny samtale: <strong>Ctrl+Alt+N</strong>
      </li>
      <li>
        Vis varsler: <strong>Ctrl+Alt+V</strong>
      </li>
      <li>
        Darkmode av/på: <strong>Ctrl+Alt+D</strong>
      </li>
      <li>
        Kopier siste svar: <strong>Ctrl+Alt+C</strong>
      </li>
      <li>
        Oversett siste svar til engelsk: <strong>Ctrl+Alt+O</strong>
      </li>
      <li>
        Lag siste svar som punktliste: <strong>Ctrl+Alt+P</strong>
      </li>
      <li>
        Lag siste svar mer empatisk: <strong>Ctrl+Alt+E</strong>
      </li>
      <li>
        Scroll til bunnen: <strong>Ctrl+Alt+B</strong>
      </li>
    </ul>
  </>
)

const stepHeading = (step: number) => {
  if (step === 0) {
    return "Velkommen"
  }
  if (step === 1) {
    return "Om tjenesten"
  }
  if (step === 2) {
    return "Når du stiller spørsmål"
  }
  if (step === 3) {
    return "Om svaret fra Bob"
  }
  if (step === 4) {
    return "Misfornøyd med svaret? Prøv dette:"
  }
  if (step === 5) {
    return "Hurtigtaster"
  }

  return ""
}

type StepModalProps = {
  step: number
  totalSteps: number
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const StepModal = ({ step, totalSteps, onClose, onPrevious, onNext, handleSelectChange }: StepModalProps) => (
  <>
    <Modal.Header id='modal-heading'>
      <Heading
        size='small'
        level='2'
      >
        {stepHeading(step)}
      </Heading>
    </Modal.Header>
    <Modal.Body>
      {step === 0 && <WelcomeMessage />}
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
      {step === 5 && <Step5 />}
    </Modal.Body>
    <Modal.Footer>
      <HStack
        align='stretch'
        gap='space-24'
        justify='space-between'
        className='mt-2 items-end'
        width='100%'
      >
        <StepSelect
          step={step}
          onChange={handleSelectChange}
        />
        <HStack gap='space-16'>
          {step === 0 && (
            <Button
              data-color='neutral'
              onClick={onClose}
              variant='tertiary'
            >
              Jeg trenger ikke opplæring
            </Button>
          )}
          {step > 1 && (
            <Button
              data-color='neutral'
              onClick={onPrevious}
              variant='tertiary'
              size='medium'
            >
              Forrige
            </Button>
          )}
          {step === totalSteps && (
            <Button
              data-color='neutral'
              onClick={onClose}
              variant='primary'
              size='medium'
            >
              Takk, Bob!
            </Button>
          )}
          {step !== totalSteps && (
            <Button
              data-color='neutral'
              onClick={onNext}
              variant='primary'
            >
              {step === 0 ? "Videre" : "Neste"}
            </Button>
          )}
        </HStack>
      </HStack>
    </Modal.Footer>
  </>
)
