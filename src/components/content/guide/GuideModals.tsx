import { XMarkIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, Button, Heading, HStack, Link, VStack } from "@navikt/ds-react"
import { useState } from "react"
import { useUpdateUserConfig } from "../../../api/api.ts"
import { BobTheGuide1, BobTheGuide2, BobThePirate } from "../../../assets/illustrations/BobTheGuide.tsx"
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
            gap='4'
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
              variant='primary-neutral'
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

export const WelcomeMessage = ({ onNext, onClose }: { onNext: () => void; onClose: () => void }) => (
  <div className='guide-modal fade-in items-center gap-4'>
    <div className='self-center'>
      <BobTheGuide1 />
    </div>
    <VStack
      className='modal-container'
      gap='4'
    >
      <HStack
        align='center'
        justify='space-between'
      >
        <Heading
          size='small'
          level='2'
        >
          Velkommen
        </Heading>
        <Button
          size='small'
          variant='tertiary-neutral'
          icon={<XMarkIcon />}
          onClick={onClose}
        />
      </HStack>
      <BodyLong>
        Du er nok ivrig etter å starte. Men ta en rask titt på denne guiden før du starter – det hjelper deg å få bedre
        svar.
      </BodyLong>
      <HStack
        align='stretch'
        gap='2'
        justify='end'
      >
        <Button
          onClick={onClose}
          variant='tertiary-neutral'
        >
          Jeg trenger ikke opplæring
        </Button>
        <Button
          onClick={onNext}
          variant='primary-neutral'
        >
          Videre
        </Button>
      </HStack>
    </VStack>
  </div>
)

export const Step1 = ({
  onNext,
  handleSelectChange,
  onClose,
}: {
  onNext: () => void
  onClose: () => void
  step: number
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) => (
  <div className='guide-modal items-center gap-4'>
    <div className='self-center'>
      <BobTheGuide1 />
    </div>
    <VStack
      className='modal-container'
      gap='4'
    >
      <HStack
        align='center'
        justify='space-between'
      >
        <Heading
          size='small'
          level='2'
        >
          Om tjenesten
        </Heading>
        <Button
          size='small'
          variant='tertiary-neutral'
          icon={<XMarkIcon />}
          onClick={onClose}
          autoFocus={true}
        />
      </HStack>
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
      <HStack
        align='stretch'
        gap='2'
        justify='space-between'
        className='mt-4 items-end'
      >
        <StepSelect
          step={1}
          onChange={handleSelectChange}
        />

        <Button
          onClick={onNext}
          variant='primary-neutral'
          size='medium'
        >
          Neste
        </Button>
      </HStack>
    </VStack>
  </div>
)

export const Step2 = ({
  step,
  handleSelectChange,
  onNext,
  onClose,
  onPrevious,
}: {
  step: number
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) => (
  <div className='fixed left-1/2 top-1/2 z-1000 w-[calc(100%-32px)] max-w-[700px] -translate-x-1/2 -translate-y-1/2 transform flex-col'>
    <div className='flex translate-y-[16px] justify-start'>
      <BobTheGuide2 />
    </div>
    <VStack
      className='modal-container'
      gap='4'
    >
      <HStack
        align='center'
        justify='space-between'
      >
        <Heading
          size='small'
          level='2'
        >
          Når du stiller spørsmål
        </Heading>
        <Button
          size='small'
          variant='tertiary-neutral'
          icon={<XMarkIcon />}
          onClick={onClose}
        />
      </HStack>
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
            Husk å <strong>starte en ny samtale</strong> når du får en ny henvendelse – da unngår du at Bob blander
            temaer.
          </li>
        </ul>
      </BodyLong>
      <HStack
        align='stretch'
        gap='2'
        justify='space-between'
        className='mt-4 items-end'
      >
        <StepSelect
          step={step}
          onChange={handleSelectChange}
        />
        <HStack gap='4'>
          <Button
            onClick={onPrevious}
            variant='tertiary-neutral'
            size='medium'
          >
            Forrige
          </Button>
          <Button
            onClick={onNext}
            variant='primary-neutral'
            size='medium'
          >
            Neste
          </Button>
        </HStack>
      </HStack>
    </VStack>
  </div>
)

export const Step3 = ({
  step,
  handleSelectChange,
  onNext,
  onClose,
  onPrevious,
}: {
  step: number
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) => (
  <div className='fixed left-1/2 top-1/2 z-1000 w-[calc(100%-32px)] max-w-[700px] -translate-x-1/2 -translate-y-1/2 transform flex-col'>
    <div className='flex translate-y-[60px] justify-center'>
      <BobTheGuide2 />
    </div>
    <VStack
      className='modal-container sticky z-1000'
      gap='4'
    >
      <HStack
        align='center'
        justify='space-between'
      >
        <Heading
          size='small'
          level='2'
        >
          Om svaret fra Bob
        </Heading>
        <Button
          size='small'
          variant='tertiary-neutral'
          icon={<XMarkIcon />}
          onClick={onClose}
        />
      </HStack>
      <BodyLong className='mb-2'>
        Hver gang du mottar et svar fra Bob baserer det seg på informasjon hentet fra Kunnskapsbasen og Nav.no. Hen
        velger det som er mest relevant for spørsmålet ditt.
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
      <HStack
        align='stretch'
        gap='2'
        justify='space-between'
        className='mt-4 items-end'
      >
        <StepSelect
          step={step}
          onChange={handleSelectChange}
        />
        <HStack gap='4'>
          <Button
            onClick={onPrevious}
            variant='tertiary-neutral'
          >
            Forrige
          </Button>
          <Button
            onClick={onNext}
            variant='primary-neutral'
          >
            Neste
          </Button>
        </HStack>
      </HStack>
    </VStack>
  </div>
)

export const Step4 = ({
  step,
  handleSelectChange,
  onClose,
  onPrevious,
  onNext,
}: {
  step: number
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) => (
  <div className='fixed left-1/2 top-[40%] z-1000 w-[calc(100%-32px)] max-w-[700px] -translate-x-1/2 -translate-y-1/2 transform flex-col'>
    <div className='flex translate-y-[60px] justify-end'>
      <BobThePirate />
    </div>
    <VStack
      className='modal-container sticky z-1000'
      gap='0'
    >
      <HStack
        align='center'
        justify='space-between'
        className='mb-6'
      >
        <Heading
          size='small'
          level='2'
        >
          Misfornøyd med svaret? Prøv dette:
        </Heading>
        <Button
          size='small'
          variant='tertiary-neutral'
          icon={<XMarkIcon />}
          onClick={onClose}
        />
      </HStack>
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
      <HStack
        align='stretch'
        gap='6'
        justify='space-between'
        className='mt-4 items-end'
      >
        <StepSelect
          step={step}
          onChange={handleSelectChange}
        />
        <HStack gap='4'>
          <Button
            onClick={onPrevious}
            variant='tertiary-neutral'
          >
            Forrige
          </Button>
          <Button
            onClick={onNext}
            variant='primary-neutral'
          >
            Neste
          </Button>
        </HStack>
      </HStack>
    </VStack>
  </div>
)

export const Step5 = ({
  step,
  handleSelectChange,
  onClose,
  onPrevious,
}: {
  step: number
  onClose: () => void
  onPrevious: () => void
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) => (
  <div className='fixed left-1/2 top-1/2 z-1000 w-[calc(100%-32px)] max-w-[700px] -translate-x-1/2 -translate-y-1/2 transform flex-col'>
    <div className='flex translate-y-[16px] justify-start'>
      <BobTheGuide2 />
    </div>{" "}
    <VStack
      className='modal-container sticky z-1000'
      gap='0'
    >
      <HStack
        align='center'
        justify='space-between'
        className='mb-6'
      >
        <Heading
          size='small'
          level='2'
        >
          Hurtigtaster
        </Heading>
        <Button
          size='small'
          variant='tertiary-neutral'
          icon={<XMarkIcon />}
          onClick={onClose}
        />
      </HStack>
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
      <HStack
        align='stretch'
        gap='6'
        justify='space-between'
        className='mt-2 items-end'
      >
        <StepSelect
          step={step}
          onChange={handleSelectChange}
        />
        <HStack gap='4'>
          <Button
            onClick={onPrevious}
            variant='tertiary-neutral'
            size='medium'
          >
            Forrige
          </Button>
          <Button
            onClick={onClose}
            variant='primary-neutral'
            size='medium'
          >
            Takk, Bob!
          </Button>
        </HStack>
      </HStack>
    </VStack>
  </div>
)
