import { BodyLong, Button, Heading, Link, Modal } from "@navikt/ds-react"
import { RefObject } from "react"
import Markdown from "react-markdown"
import { useUpdateUserConfig, useUserConfig } from "../../../api/api.ts"
import { BobHead } from "../../../assets/icons/BobHead.tsx"
import "./TipsFromBob.css"

interface FirstTimeLoginModalProps {
  firstTimeLoginModal: RefObject<HTMLDialogElement>
}

export const FirstTimeLoginModal = ({
  firstTimeLoginModal,
}: FirstTimeLoginModalProps) => {
  const { updateUserConfig } = useUpdateUserConfig()
  const { userConfig } = useUserConfig()

  function handleClose() {
    updateUserConfig({ showStartInfo: false }).then(() => {
      firstTimeLoginModal.current?.close()
    })
  }

  return (
    <Modal
      ref={firstTimeLoginModal}
      header={{
        icon: <BobHead aria-hidden />,
        heading: "Velkommen!",
        size: "small",
        closeButton: false,
      }}
      open={!!userConfig?.showStartInfo}
      onClose={handleClose}
      className='modal-styling'
    >
      <Modal.Body>
        <BodyLong spacing className='pt-2'>
          Du er nok ivrig etter å starte. Men ta en rask titt på denne guiden
          før du starter – det sparer tid!
        </BodyLong>
        <Heading size='xsmall' spacing>
          Om denne tjenesten
        </Heading>
        <BodyLong className='mb-4'>
          Jeg er en kunstig intelligens, altså et dataprogram designet for å
          hjelpe deg med spørsmål og informasjon spesifikt om tjenestene Nav
          tilbyr.
        </BodyLong>
        <BodyLong className='mb-10'>
          Svarene du mottar baserer seg kun på informasjonen fra{" "}
          <Link
            href='https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/index.html'
            target='_blank'
          >
            NKS Kunnskapsbasen
          </Link>
          . Dette er de samme artiklene du finner i Salesforce. Jeg har ikke
          tilgang til noen annen informasjon.
        </BodyLong>
        <Heading size='xsmall' spacing>
          Få mest mulig ut av svarene
        </Heading>
        <BodyLong className='mb-10 gap-2'>
          <Markdown>- Still hele spørsmål, ikke bare stikkord.</Markdown>
          <Markdown>- Vær detaljert og tydelig.</Markdown>
          <Markdown>- Forklar situasjonen eller gi mer kontekst.</Markdown>
          <Markdown>- Still oppfølgingsspørsmål hvis noe mangler.</Markdown>
        </BodyLong>
        <Heading size='xsmall' spacing>
          Og husk
        </Heading>
        <BodyLong spacing>
          <Markdown>
            - **Ikke del personsensitiv informasjon** når du sender meg
            spørsmål.
          </Markdown>
          <Markdown>
            - **Kontroller kilden om du er usikker på om svaret er korrekt.** Da
            følger du bare vedlagt lenke til artikkelen jeg siterer fra.
          </Markdown>
        </BodyLong>
      </Modal.Body>
      <Modal.Footer className='justify-center'>
        <Button type='button' variant='primary' onClick={handleClose}>
          Takk for det, Bob!
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

interface ButtonClickModalProps {
  buttonClickModal: RefObject<HTMLDialogElement>
}

export const ButtonClickModal = ({
  buttonClickModal,
}: ButtonClickModalProps) => {
  return (
    <Modal
      ref={buttonClickModal}
      header={{
        heading: "Her har du noen tips",
        icon: <BobHead aria-hidden />,
        size: "small",
      }}
      onClose={() => buttonClickModal.current?.close()}
      className='modal-styling'
    >
      <Modal.Body>
        <Heading size='xsmall' spacing className='pt-2'>
          Få mest mulig ut av svarene
        </Heading>
        <BodyLong className='mb-10 gap-2'>
          <Markdown>- Still hele spørsmål, ikke bare stikkord.</Markdown>
          <Markdown>- Vær detaljert og tydelig.</Markdown>
          <Markdown>- Forklar situasjonen eller gi mer kontekst.</Markdown>
          <Markdown>- Still oppfølgingsspørsmål hvis noe mangler.</Markdown>
        </BodyLong>
        <Heading size='xsmall' spacing>
          Og husk
        </Heading>
        <BodyLong spacing>
          <Markdown>
            - **Ikke del personsensitiv informasjon** når du sender meg
            spørsmål.
          </Markdown>
          <Markdown>
            - **Kontroller kilden om du er usikker på om svaret er korrekt.** Da
            følger du bare vedlagt lenke til artikkelen jeg siterer fra.
          </Markdown>
        </BodyLong>
      </Modal.Body>
      <Modal.Footer className='justify-center'>
        <Button
          type='button'
          variant='primary'
          onClick={() => buttonClickModal.current?.close()}
        >
          Takk for det, Bob!
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
