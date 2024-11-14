import { BodyLong, Button, Link, Modal } from "@navikt/ds-react"
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
        <BodyLong spacing>
          Du er nok ivrig etter å begynne, men vennligst les denne
          introduksjonen først.
        </BodyLong>
        <BodyLong spacing>
          Jeg er en språkmodell, som betyr at jeg er trent til å forstå og
          generere tekst basert på mønstre i data. Her er noen tips for å sikre
          at du får gode svar:
        </BodyLong>
        <BodyLong spacing>
          <Markdown>- Still spørsmål, ikke bare stikkord.</Markdown>
          <Markdown>
            - Vær spesifikk: Jo mer detaljert spørsmålet , desto bedre svar.
          </Markdown>
          <Markdown>
            - Gi kontekst: Fortell om situasjonen til brukeren eller hva som
            ligger bak spørsmålet.
          </Markdown>
          <Markdown>
            - Still oppfølgingsspørsmål: Hvis svaret ikke dekker alt, er det
            bare å spørre mer spesifikt.
          </Markdown>
        </BodyLong>
        <BodyLong spacing>
          Jeg baserer svarene på informasjon hentet fra{" "}
          <Link
            href='https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/index.html'
            target='_blank'
          >
            Kunnskapsbasen
          </Link>
          , som er NAV Kontaktsenter (NKS) sitt eget oppslagsverk med rutiner og
          faglig innhold.
        </BodyLong>
        <BodyLong>Og husk: ikke del personlige opplysninger med meg.</BodyLong>
      </Modal.Body>
      <Modal.Footer className='justify-center'>
        <Button type='button' variant='secondary' onClick={handleClose}>
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
        heading: "Her har du noen tips:",
        icon: <BobHead aria-hidden />,
        size: "small",
      }}
      onClose={() => buttonClickModal.current?.close()}
      className='modal-styling'
    >
      <Modal.Body>
        <BodyLong spacing>
          <Markdown>- Still spørsmål, ikke bare stikkord.</Markdown>
          <Markdown>
            - Vær spesifikk: Jo mer detaljert spørsmålet , desto bedre svar.
          </Markdown>
          <Markdown>
            - Gi kontekst: Fortell om situasjonen til brukeren eller hva som
            ligger bak spørsmålet.
          </Markdown>
          <Markdown>
            - Still oppfølgingsspørsmål: Hvis svaret ikke dekker alt, er det
            bare å spørre mer spesifikt.
          </Markdown>
        </BodyLong>
        <BodyLong spacing>
          Jeg baserer svarene på informasjon hentet fra{" "}
          <Link
            href='https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/index.html'
            target='_blank'
          >
            Kunnskapsbasen
          </Link>
          , som er NAV Kontaktsenter (NKS) sitt eget oppslagsverk med rutiner og
          faglig innhold.
        </BodyLong>
        <BodyLong>Og husk: ikke del personlige opplysninger med meg.</BodyLong>
      </Modal.Body>
      <Modal.Footer className='justify-center'>
        <Button
          type='button'
          variant='secondary'
          onClick={() => buttonClickModal.current?.close()}
        >
          Takk for det, Bob!
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
