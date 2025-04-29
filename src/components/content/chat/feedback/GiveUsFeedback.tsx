import { ChatExclamationmarkIcon } from "@navikt/aksel-icons"
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Modal,
  TextField,
  Tooltip,
} from "@navikt/ds-react"
import { useRef, useState } from "react"
import { Message } from "../../../../types/Message.ts"

// interface GiveUsFeedbackProps {
//   message: Message
// }
//
// export const GiveUsFeedback = ({ message }: GiveUsFeedbackProps) => {
//   const ref = useRef<HTMLDialogElement>(null)
//
//   function encodedText(text: string) {
//     return encodeURIComponent(text).replace(
//       /[-!'()*#]/g,
//       (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
//     )
//   }
//
//   function handleButtonClick() {
//     amplitude.feilMeldt(message.id)
//     window.open(
//       `https://forms.office.com/Pages/ResponsePage.aspx?id=NGU2YsMeYkmIaZtVNSedC0RMRE_b5tVChsvEVOu-VahUMklHSElUVkE1Q0Q3S1RVSFNURlRERzRDNSQlQCN0PWcu&rc84a5384f81a40a8af1ad89105ae94c7=${encodedText(message.id)}&rc60f18cbf19d4053aed8e232647745b4=${encodedText(message.content)}`,
//       "_blank",
//     )
//   }
//
//   return (
//     <div>
//       <Tooltip content='Meld inn feil svar'>
//         <Button
//           variant='tertiary-neutral'
//           size='small'
//           aria-label='Kopier svaret'
//           icon={<ChatExclamationmarkIcon />}
//           onClick={handleButtonClick}
//         />
//       </Tooltip>
//       <Modal
//         ref={ref}
//         closeOnBackdropClick={true}
//         aria-label='Gi oss tilbakemelding'
//         header={{ closeButton: true, heading: "" }}
//       >
//         <Modal.Body>
//           <div className='my-4'>
//             <Heading size='xsmall' spacing>
//               Svaret det gjelder
//             </Heading>
//             <div className='max-h-24 overflow-auto'>
//               <BodyLong>
//                 <Markdown className='markdown'>{message.content}</Markdown>
//               </BodyLong>
//             </div>
//           </div>
//           <div className='flex grow justify-start'>
//             <Button
//               size='small'
//               variant='tertiary-neutral'
//               onClick={() => ref.current?.close()}
//               icon={<ArrowLeftIcon />}
//             >
//               Tilbake
//             </Button>
//           </div>
//         </Modal.Body>
//       </Modal>
//     </div>
//   )
// }

interface FeedbackOnAnswerProps {
  message: Message
}

export const FeedbackOnAnswer = ({ message }: FeedbackOnAnswerProps) => {
  const ref = useRef<HTMLDialogElement>(null)
  const handleChange = (val: string[]) => console.info(val)
  const [isAnnet, setIsAnnet] = useState(false)

  const handleAnnetClick = () => {
    if (!isAnnet) {
      setIsAnnet(true)
    } else {
      setIsAnnet(false)
    }
  }

  return (
    <div className='py-12'>
      <Tooltip content='Meld inn feil med svaret'>
        <Button
          variant='tertiary-neutral'
          size='small'
          aria-label='Meld inn feil med svaret'
          icon={<ChatExclamationmarkIcon />}
          onClick={() => ref.current?.showModal()}
        />
      </Tooltip>

      <Modal
        ref={ref}
        header={{
          heading: "Meld inn feil",
          size: "small",
          icon: <ChatExclamationmarkIcon />,
        }}
        width={400}
      >
        <Modal.Body>
          <form method='dialog' id='skjema' onSubmit={() => alert("onSubmit")}>
            <CheckboxGroup
              legend='Hva er galt med svaret?'
              onChange={handleChange}
              size='small'
            >
              <Checkbox value='feil-med-svar' className='mb-1 mt-3'>
                Hele-/deler av svaret er feil
              </Checkbox>
              <Checkbox value='vesentlige-detaljer' className='mb-1'>
                Mangler vesentlige detaljer
              </Checkbox>
              <Checkbox value='forventede-artikler' className='mb-1'>
                Benytter ikke forventede artikler
              </Checkbox>
              <Checkbox value='kontekst' className='mb-1'>
                Forholder seg ikke til kontekst
              </Checkbox>
              <Checkbox value='blander-ytelser' className='mb-1'>
                Blander ytelser
              </Checkbox>
              <Checkbox value='sitat-i-artikkelen' className='mb-1'>
                Finner ikke sitatet i artikkelen
              </Checkbox>
              <Checkbox value='mangler-kilder' className='mb-1'>
                Mangler kilder
              </Checkbox>
              <Checkbox
                value='annet'
                onClick={handleAnnetClick}
                className='mb-4'
              >
                Annet
              </Checkbox>
              {!isAnnet ? (
                <TextField label='Gi oss en kort beskrivelse av hva som er galt'></TextField>
              ) : null}
            </CheckboxGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button form='skjema'>Send</Button>
          <Button
            type='button'
            variant='secondary'
            onClick={() => ref.current?.close()}
          >
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
