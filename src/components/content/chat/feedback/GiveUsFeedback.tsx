import { ChatExclamationmarkIcon } from "@navikt/aksel-icons"
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Modal,
  TextField,
  Tooltip,
} from "@navikt/ds-react"
import { useMemo, useRef, useState } from "react"
import { useAddFeedback } from "../../../../api/api.ts"
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

const OPTIONS = {
  "feil-med-svar": "Hele-/deler av svaret er feil",
  "vesentlige-detaljer": "Mangler vesentlige detaljer",
  "forventede-artikler": "Benytter ikke forventede artikler",
  kontekst: "Forholder seg ikke til kontekst",
  "blander-ytelser": "Blander ytelser",
  "sitat-i-artikkelen": "Finner ikke sitatet i artikkelen",
  "mangler-kilder": "Mangler kilder",
  annet: "Annet",
}

type OptionKeys = keyof typeof OPTIONS

interface FeedbackOnAnswerProps {
  message: Message
}

export const FeedbackOnAnswer = ({ message }: FeedbackOnAnswerProps) => {
  const modalRef = useRef<HTMLDialogElement>(null)
  const { addFeedback } = useAddFeedback(message.id)

  const [options, setOptions] = useState<OptionKeys[]>([])
  const [comment, setComment] = useState<string | null>(null)
  const isAnnet = useMemo(() => options.includes("annet"), [options])

  const resetFields = () => {
    setOptions([])
    setComment(null)
  }

  const handleOptionChanged = (opts: OptionKeys[]) => {
    setOptions(opts)
  }

  const submit = () => {
    const optionLabels = options.map((option) => OPTIONS[option])
    addFeedback({
      options: optionLabels,
      comment: isAnnet ? comment : null,
    })

    resetFields()
    modalRef.current?.close()
  }

  return (
    <div>
      <Tooltip content='Meld inn feil med svaret'>
        <Button
          variant='tertiary-neutral'
          size='small'
          aria-label='Meld inn feil med svaret'
          icon={<ChatExclamationmarkIcon />}
          onClick={() => modalRef.current?.showModal()}
        />
      </Tooltip>

      <Modal
        ref={modalRef}
        header={{
          heading: "Meld inn feil",
          size: "small",
          icon: <ChatExclamationmarkIcon />,
        }}
        width={400}
      >
        <Modal.Body>
          <CheckboxGroup
            legend='Hva er galt med svaret?'
            onChange={handleOptionChanged}
            value={options}
            size='small'
          >
            {Object.entries(OPTIONS).map(([value, label]) => (
              <Checkbox value={value} className='mb-1 first:mt-3 last:mb-4'>
                {label}
              </Checkbox>
            ))}
            {isAnnet ? (
              <TextField
                label='Gi oss en kort beskrivelse av hva som er galt'
                onChange={(e) => setComment(e.target.value)}
              />
            ) : null}
          </CheckboxGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={submit}>Send</Button>
          <Button
            type='button'
            variant='secondary'
            onClick={() => modalRef.current?.close()}
          >
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
