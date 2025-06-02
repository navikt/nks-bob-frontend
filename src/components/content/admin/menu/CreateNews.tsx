import { ExclamationmarkTriangleIcon } from "@navikt/aksel-icons"
import {
  BodyShort,
  Box,
  Button,
  Detail,
  HStack,
  Modal,
  Textarea,
  TextField,
  VStack,
} from "@navikt/ds-react"
import { FormEvent, useEffect, useRef, useState } from "react"
import { useSWRConfig } from "swr"
import { useCreateNews } from "../../../../api/admin"
import { NewsNotification } from "../../../../types/Notifications"

export const CreateNews = () => {
  return (
    <VStack>
      <NewsDescription />
      <NewsHeader />
      <NewsForm />
    </VStack>
  )
}

export const NewsDescription = () => {
  return (
    <Box padding='4' position='sticky'>
      <BodyShort size='medium' textColor='subtle'>
        Publiser nyheter som blir synlig fo alle som bruker Bob.
      </BodyShort>
    </Box>
  )
}
export const NewsHeader = () => {
  return (
    <Box className='bg-[#F5F6F7]' padding='4' position='sticky'>
      <BodyShort size='medium' weight='semibold' textColor='subtle'>
        Publiser nyhet
      </BodyShort>
    </Box>
  )
}

export const NewsForm = () => {
  const [title, setTitle] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const ref = useRef<HTMLDialogElement>(null)
  const { createNews, isLoading } = useCreateNews()
  const { mutate } = useSWRConfig()

  const submit = (_event: FormEvent<HTMLFormElement>) => {
    const newsNotification = {
      title,
      content,
    }

    createNews(newsNotification).then(() => {
      mutate("/api/v1/notifications/news")
    })
  }

  const testAlert = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const news: NewsNotification = {
      id: crypto.randomUUID(),
      title,
      content: content,
      createdAt: new Date().toISOString(),
    }

    // Update the cache to get a preview
    const opts = { revalidate: false }
    mutate(
      "/api/v1/notifications/news",
      (existing: any) => {
        return [news, ...existing]
      },
      opts,
    )
  }

  // Clear test data on unmount
  useEffect(() => {
    return () => {
      mutate("/api/v1/notifications/news")
    }
  }, [])

  const isValidForm = () => {
    return title !== "" && content !== ""
  }

  return (
    <VStack padding='4' gap='6'>
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
          heading: "Du er på vei til å publisere en nyhet",
          closeButton: false,
        }}
        closeOnBackdropClick
      >
        <Modal.Body>
          <form method='dialog' id='news-schema' onSubmit={submit}>
            <BodyShort textColor='subtle'>
              Nyheten vil bli synlig for alle som bruker Bob. Ønsker du å
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
              variant='primary'
              form='news-schema'
              type='submit'
              loading={isLoading}
            >
              Ja, publiser nyheten!
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal>
    </VStack>
  )
}
