import { BodyLong, Button, Link, Modal } from "@navikt/ds-react"
import { useEffect, useRef } from "react"
import Markdown from "react-markdown"
import { useUpdateUserConfig } from "../../../api/api.ts"
import { BobHead } from "../../../assets/icons/BobHead.tsx"

const FirstTimeLoginInfo = () => {
  const modalRef = useRef<HTMLDialogElement>(null)
  const { updateUserConfig } = useUpdateUserConfig()

  useEffect(() => {
    modalRef.current?.showModal()
  }, [])

  function handleClose() {
    updateUserConfig({ showStartInfo: false }).then(() => {
      modalRef.current?.close()
    })
  }

  return (
    <Modal
      ref={modalRef}
      header={{
        icon: <BobHead aria-hidden />,
        heading: "Velkommen!",
        size: "small",
      }}
    >
      <Modal.Body>
        <BodyLong spacing>
          Jeg vet du er ivrig etter å begynne, men vennligst se disse tipsene
          først:
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
          Jeg baserer svarene på informasjonen fra NAV Kontaktsenter (NKS) sitt
          oppslagsverk:{" "}
          <Link href='https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/index.html'>
            Kunnskapsbasen
          </Link>
          .
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

export default FirstTimeLoginInfo
