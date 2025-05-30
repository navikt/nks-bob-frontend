import { ExclamationmarkTriangleIcon } from "@navikt/aksel-icons"
import {
  Alert,
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
  useCreateErrorNotification,
  useDeleteErrorNotification,
  useUpdateErrorNotification,
} from "../../../../api/admin"
import { useErrorNotifications } from "../../../../api/api"
import { ErrorNotification } from "../../../../types/Notifications"

export const CreateWarning = () => {
  const { errorNotifications } = useErrorNotifications()
  const [isTesting, setIsTesting] = useState(false)

  return (
    <VStack>
      <WarningDescription />
      <WarningHeader />
      {!isTesting && errorNotifications.length > 0 && (
        <SingleAlertWrapper errorNotification={errorNotifications.at(0)!} />
      )}
      {(isTesting || errorNotifications.length === 0) && (
        <WarningForm setIsTesting={setIsTesting} />
      )}
    </VStack>
  )
}

const WarningDescription = () => {
  return (
    <Box padding='4' position='sticky'>
      <BodyShort size='medium' textColor='subtle'>
        Lag feilmeldinger som blir synlig i grensesnittet for brukere.
      </BodyShort>
    </Box>
  )
}
const WarningHeader = () => {
  return (
    <Box className='bg-[#F5F6F7]' padding='4' position='sticky'>
      <BodyShort size='medium' weight='semibold' textColor='subtle'>
        Publiser feilmelding
      </BodyShort>
    </Box>
  )
}

const WARNING_OPTIONS = {
  "": "Velg",
  Warning: "Warning",
  Error: "Error",
}

type NotificationType = keyof typeof WARNING_OPTIONS

const WarningForm = ({
  setIsTesting,
}: {
  setIsTesting: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [notificationType, setNotificationType] = useState<NotificationType>("")
  const [title, setTitle] = useState<string>("")
  const [text, setText] = useState<string>("")
  const ref = useRef<HTMLDialogElement>(null)
  const { createErrorNotification, isLoading } = useCreateErrorNotification()
  const { mutate } = useSWRConfig()

  const submit = (_event: FormEvent<HTMLFormElement>) => {
    if (notificationType === "") {
      return
    }

const errorNotification = {
      title,
      content: text,
      notificationType,
      expiresAt: null,
    }

    setIsTesting(false)
    createErrorNotification(errorNotification).then(() => {
      mutate("/api/v1/notifications")
      mutate("/api/v1/notifications/errors")
    })
  }

  const testErrorNotification = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault()
    event.stopPropagation()

    if (notificationType === "") {
      return
    }

    setIsTesting(true)
    const errorNotification: ErrorNotification[] = [
      {
        id: "test-id",
        title,
        content: text,
        notificationType,
        expiresAt: null,
        createdAt: new Date().toISOString(),
      },
    ]

    // Update the cache to get a preview
    const opts = { revalidate: false }
    mutate("/api/v1/notifications", errorNotification, opts)
    mutate("/api/v1/notifications/errors", errorNotification, opts)
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
          setNotificationType(event.target.value as NotificationType)
        }
      >
        {Object.entries(WARNING_OPTIONS).map(([value, label]) => (
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
        onClick={testErrorNotification}
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
          <form method='dialog' id='notification-schema' onSubmit={submit}>
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
              form='notification-schema'
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

const SingleAlertWrapper = ({
  errorNotification,
}: {
  errorNotification: ErrorNotification
}) => {
  const [updateErrorNotification, setUpdateErrorNotification] =
    useState<ErrorNotification | null>(null)

  if (updateErrorNotification) {
    return <UpdateAlertForm errorNotification={updateErrorNotification}
      setUpdateErrorNotification={setUpdateErrorNotification}
/>
  }

  return (
    <SingleAlert
      errorNotification={errorNotification}
      setUpdateErrorNotification={setUpdateErrorNotification}
    />
  )
}

const SingleAlert = ({
  errorNotification,
  setUpdateErrorNotification,
}: {
  errorNotification: ErrorNotification
  setUpdateErrorNotification: React.Dispatch<
    React.SetStateAction<ErrorNotification | null>
  >
}) => {
  const { id, createdAt, notificationType, title, content } = errorNotification
  const ref = useRef<HTMLDialogElement>(null)
  const { mutate } = useSWRConfig()
  const { deleteErrorNotification, isLoading } = useDeleteErrorNotification(id)
  const alertVariant = notificationType.toLowerCase() as "error" | "warning"

  const deleteOnSubmit = () => {
    deleteErrorNotification().then(() => {
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
        <Alert inline variant={alertVariant}>
          {notificationType}
        </Alert>
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
            setUpdateErrorNotification(errorNotification)
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
  errorNotification,
  setUpdateErrorNotification,
}: {
  errorNotification: ErrorNotification
  setUpdateErrorNotification: React.Dispatch<
    React.SetStateAction<ErrorNotification | null>
  >
}) => {
  const [notificationType, setNotificationType] = useState<NotificationType>(
    errorNotification.notificationType as NotificationType,
  )
  const [title, setTitle] = useState<string>(errorNotification.title)
  const [text, setText] = useState<string>(errorNotification.content)
  const ref = useRef<HTMLDialogElement>(null)
  const { updateErrorNotification, isLoading } = useUpdateErrorNotification(
    errorNotification.id,
  )
  const { mutate } = useSWRConfig()

  const submit = (_event: FormEvent<HTMLFormElement>) => {
    if (notificationType === "") {
      return
    }

    updateErrorNotification({
      title,
      content: text,
      notificationType,
      expiresAt: null,
    }).then(() => {
      setUpdateErrorNotification(null)
      mutate("/api/v1/notifications")
      mutate("/api/v1/notifications/errors")
    })
  }

  const testErrorNotification = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault()
    event.stopPropagation()

    if (notificationType === "") {
      return
    }

    const errorNotification: ErrorNotification[] = [
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
    mutate("/api/v1/notifications", errorNotification, opts)
    mutate("/api/v1/notifications/errors", errorNotification, opts)
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
          setNotificationType(event.target.value as NotificationType)
        }
      >
        {Object.entries(WARNING_OPTIONS).map(([value, label]) => (
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
        onClick={testErrorNotification}
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
          <form method='dialog' id='notification-schema' onSubmit={submit}>
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
              form='notification-schema'
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
