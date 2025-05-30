import { ExclamationmarkTriangleIcon } from "@navikt/aksel-icons"
import {
  Alert as AlertComponent,
  BodyShort,
  Box,
  Button,
  Detail,
  Heading,
  HStack,
  Label,
  Modal,
  Select,
  Textarea,
  TextField,
  VStack,
} from "@navikt/ds-react"
import { formatDate } from "date-fns"
import { FormEvent, useEffect, useRef, useState } from "react"
import { useSWRConfig } from "swr"
import {
  useCreateAlert,
  useDeleteAlert,
  useUpdateAlert,
} from "../../../../api/admin"
import { useAlerts } from "../../../../api/api"
import { Alert } from "../../../../types/Notifications"

export const CreateAlert = () => {
  const { alerts } = useAlerts()
  const [isTesting, setIsTesting] = useState(false)

  return (
    <VStack>
      <AlertDescription />
      <AlertHeader />
      {!isTesting && alerts.length > 0 && <SingleAlert alert={alerts.at(0)!} />}
      {(isTesting || alerts.length === 0) && (
        <AlertForm setIsTesting={setIsTesting} />
      )}
    </VStack>
  )
}

const AlertDescription = () => {
  return (
    <Box padding='4' position='sticky'>
      <BodyShort size='medium' textColor='subtle'>
        Lag feilmeldinger som blir synlig i grensesnittet for brukere.
      </BodyShort>
    </Box>
  )
}
const AlertHeader = () => {
  return (
    <Box className='bg-[#F5F6F7]' padding='4' position='sticky'>
      <BodyShort size='medium' weight='semibold' textColor='subtle'>
        Publiser feilmelding
      </BodyShort>
    </Box>
  )
}

const ALERT_OPTIONS = {
  "": "Velg",
  Warning: "Warning",
  Error: "Error",
}

type AlertNotificationType = keyof typeof ALERT_OPTIONS

const AlertForm = ({
  setIsTesting,
}: {
  setIsTesting: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [notificationType, setNotificationType] =
    useState<AlertNotificationType>("")
  const [title, setTitle] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const ref = useRef<HTMLDialogElement>(null)
  const { createAlert, isLoading } = useCreateAlert()
  const { mutate } = useSWRConfig()

  const submit = (_event: FormEvent<HTMLFormElement>) => {
    if (notificationType === "") {
      return
    }

    const alert = {
      title,
      content,
      notificationType,
      expiresAt: null,
    }

    setIsTesting(false)
    createAlert(alert).then(() => {
      mutate("/api/v1/notifications")
      mutate("/api/v1/notifications/errors")
    })
  }

  const testAlert = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (notificationType === "") {
      return
    }

    setIsTesting(true)
    const alert: Alert[] = [
      {
        id: "test-id",
        title,
        content: content,
        notificationType,
        expiresAt: null,
        createdAt: new Date().toISOString(),
      },
    ]

    // Update the cache to get a preview
    const opts = { revalidate: false }
    mutate("/api/v1/notifications", alert, opts)
    mutate("/api/v1/notifications/errors", alert, opts)
  }

  // Clear test data on unmount
  useEffect(() => {
    return () => {
      mutate("/api/v1/notifications")
      mutate("/api/v1/notifications/errors")
    }
  }, [])

  const isValidForm = () => {
    return notificationType !== "" && title !== "" && content !== ""
  }

  return (
    <VStack padding='4' gap='6'>
      <Select
        label='Type feilmelding'
        size='small'
        className='max-w-48'
        value={notificationType}
        onChange={(event) =>
          setNotificationType(event.target.value as AlertNotificationType)
        }
      >
        {Object.entries(ALERT_OPTIONS).map(([value, label]) => (
          <option key={`notification-type-option-${value}`} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <TextField
        label='Tittel'
        size='small'
        value={title}
        onChange={(event) => {
          setTitle(event.target.value)
        }}
      />
      <Textarea
        label='Tekst'
        size='small'
        value={content}
        onChange={(event) => {
          setContent(event.target.value)
        }}
      />
      <Detail textColor='subtle'>
        NB: Du må teste feilmeldingen før du kan publisere.
      </Detail>
      <Button
        variant='secondary-neutral'
        size='small'
        className='w-fit'
        onClick={testAlert}
      >
        Test (vises kun for deg)
      </Button>
      <Button
        variant='primary'
        size='small'
        className='w-fit'
        onClick={() => {
          ref.current?.showModal()
        }}
        disabled={!isValidForm()}
      >
        Publiser for alle
      </Button>
      <Modal
        ref={ref}
        header={{
          icon: <ExclamationmarkTriangleIcon />,
          heading: "Du er på vei til å publisere en feilmelding",
          closeButton: false,
        }}
        closeOnBackdropClick
      >
        <Modal.Body>
          <form method='dialog' id='alert-schema' onSubmit={submit}>
            <BodyShort textColor='subtle'>
              Er du sikker på at du ønsker å publisere feilmeldingen? Den vil
              bli synlig for alle brukere.
            </BodyShort>
          </form>
        </Modal.Body>
        <Modal.Footer className='flex-row'>
          <HStack gap='4'>
            <Button variant='secondary' onClick={() => ref.current?.close()}>
              Avbryt
            </Button>
            <Button
              variant='primary'
              form='alert-schema'
              type='submit'
              loading={isLoading}
            >
              Ja, publiser feilmeldingen!
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal>
    </VStack>
  )
}

const SingleAlert = ({ alert }: { alert: Alert }) => {
  const [updateAlert, setUpdateAlert] = useState<Alert | null>(null)

  if (updateAlert) {
    return (
      <UpdateAlertForm alert={updateAlert} setUpdateAlert={setUpdateAlert} />
    )
  }

  return <SingleAlertInner alert={alert} setUpdateAlert={setUpdateAlert} />
}

const SingleAlertInner = ({
  alert,
  setUpdateAlert,
}: {
  alert: Alert
  setUpdateAlert: React.Dispatch<React.SetStateAction<Alert | null>>
}) => {
  const { id, createdAt, notificationType, title, content } = alert
  const ref = useRef<HTMLDialogElement>(null)
  const { mutate } = useSWRConfig()
  const { deleteAlert, isLoading } = useDeleteAlert(id)
  const alertVariant = notificationType.toLowerCase() as "error" | "warning"

  const deleteOnSubmit = () => {
    deleteAlert().then(() => {
      mutate("/api/v1/notifications")
      mutate("/api/v1/notifications/errors")
    })
  }

  return (
    <VStack padding='4' gap='4'>
      <VStack gap='1'>
        <Heading level='3' size='xsmall' textColor='subtle'>
          Du har 1 aktiv feilmelding
        </Heading>
        <Detail>NB: Du må slette feilmeldingen for å publisere en ny.</Detail>
      </VStack>
      <BodyShort>
        Publisert: {formatDate(new Date(createdAt), "dd.MM.yyyy (HH:mm)")}
      </BodyShort>
      <VStack>
        <Label>Feilmeldingstype</Label>
        <AlertComponent inline variant={alertVariant}>
          {notificationType}
        </AlertComponent>
      </VStack>
      <VStack>
        <Label>Tittel</Label>
        <BodyShort>{title}</BodyShort>
      </VStack>
      <VStack>
        <Label>Tekst</Label>
        <BodyShort>{content}</BodyShort>
      </VStack>
      <HStack gap='2'>
        <Button
          size='small'
          variant='secondary-neutral'
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setUpdateAlert(alert)
          }}
        >
          Endre
        </Button>
        <Button
          size='small'
          variant='danger'
          loading={isLoading}
          onClick={() => {
            ref.current?.showModal()
          }}
        >
          Slett
        </Button>
        <Modal
          ref={ref}
          header={{
            icon: <ExclamationmarkTriangleIcon />,
            heading: "Slett feilmeldingen",
            closeButton: false,
          }}
          closeOnBackdropClick
        >
          <Modal.Body>
            <form
              method='dialog'
              id='notification-delete-schema'
              onSubmit={deleteOnSubmit}
            >
              <BodyShort textColor='subtle'>
                Feilmeldingen vil ikke lenger være synlig. Ønsker du å
                fortsette?
              </BodyShort>
            </form>
          </Modal.Body>
          <Modal.Footer className='flex-row'>
            <HStack gap='4'>
              <Button variant='secondary' onClick={() => ref.current?.close()}>
                Avbryt
              </Button>
              <Button
                variant='danger'
                form='notification-delete-schema'
                type='submit'
                loading={isLoading}
              >
                Ja, slett feilmeldingen!
              </Button>
            </HStack>
          </Modal.Footer>
        </Modal>
      </HStack>
    </VStack>
  )
}

const UpdateAlertForm = ({
  alert,
  setUpdateAlert,
}: {
  alert: Alert
  setUpdateAlert: React.Dispatch<React.SetStateAction<Alert | null>>
}) => {
  const [notificationType, setNotificationType] =
    useState<AlertNotificationType>(
      alert.notificationType as AlertNotificationType,
    )
  const [title, setTitle] = useState<string>(alert.title)
  const [text, setText] = useState<string>(alert.content)
  const ref = useRef<HTMLDialogElement>(null)
  const { updateAlert, isLoading } = useUpdateAlert(alert.id)
  const { mutate } = useSWRConfig()

  const submit = (_event: FormEvent<HTMLFormElement>) => {
    if (notificationType === "") {
      return
    }

    updateAlert({
      title,
      content: text,
      notificationType,
      expiresAt: null,
    }).then(() => {
      setUpdateAlert(null)
      mutate("/api/v1/notifications")
      mutate("/api/v1/notifications/errors")
    })
  }

  const testAlert = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (notificationType === "") {
      return
    }

    const alert: Alert[] = [
      {
        id: "test-id",
        title,
        content: text,
        notificationType,
        expiresAt: null,
        createdAt: new Date().toISOString(),
      },
    ]

    const opts = { revalidate: false }
    mutate("/api/v1/notifications", alert, opts)
    mutate("/api/v1/notifications/errors", alert, opts)
  }

  // Clear test data on unmount
  useEffect(() => {
    return () => {
      mutate("/api/v1/notifications")
      mutate("/api/v1/notifications/errors")
    }
  }, [])

  const isValidForm = () => {
    return notificationType !== "" && title !== "" && text !== ""
  }

  return (
    <VStack padding='4' gap='6'>
      <Select
        label='Type feilmelding'
        size='small'
        className='max-w-48'
        value={notificationType}
        onChange={(event) =>
          setNotificationType(event.target.value as AlertNotificationType)
        }
      >
        {Object.entries(ALERT_OPTIONS).map(([value, label]) => (
          <option key={`notification-type-option-${value}`} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <TextField
        label='Tittel'
        size='small'
        value={title}
        onChange={(event) => {
          setTitle(event.target.value)
        }}
      />
      <Textarea
        label='Tekst'
        size='small'
        value={text}
        onChange={(event) => {
          setText(event.target.value)
        }}
      />
      <Detail textColor='subtle'>
        NB: Du må teste feilmeldingen før du kan publisere.
      </Detail>
      <Button
        variant='secondary-neutral'
        size='small'
        className='w-fit'
        onClick={testAlert}
      >
        Test (vises kun for deg)
      </Button>
      <Button
        variant='primary'
        size='small'
        className='w-fit'
        onClick={() => {
          ref.current?.showModal()
        }}
        disabled={!isValidForm()}
      >
        Endre feilmeldingen
      </Button>
      <Modal
        ref={ref}
        header={{
          icon: <ExclamationmarkTriangleIcon />,
          heading: "Du er på vei til å endre en feilmelding",
          closeButton: false,
        }}
        closeOnBackdropClick
      >
        <Modal.Body>
          <form method='dialog' id='alert-schema' onSubmit={submit}>
            <BodyShort textColor='subtle'>
              Er du sikker på at du ønsker å endre feilmeldingen? Endringene vil
              bli synlig for alle brukere.
            </BodyShort>
          </form>
        </Modal.Body>
        <Modal.Footer className='flex-row'>
          <HStack gap='4'>
            <Button variant='secondary' onClick={() => ref.current?.close()}>
              Avbryt
            </Button>
            <Button
              variant='primary'
              form='alert-schema'
              type='submit'
              loading={isLoading}
            >
              Ja, endre feilmeldingen!
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal>
    </VStack>
  )
}
