import { Chat2Icon } from "@navikt/aksel-icons"
import { BodyShort, Button, Detail, Heading, HStack, Label, Link, Loader, TextField, VStack } from "@navikt/ds-react"
import { format } from "date-fns"
import { FormEvent, useState } from "react"
import { NavLink } from "react-router"
import useSWR from "swr"
import { ApiError, fetcher } from "../../../../../api/api"
import { Conversation } from "../../../../../types/Message"

const SearchConversation = () => {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messageId, setMessageId] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState<{
    value: string
    type: "conversationId" | "messageId" | null
  }>({ value: "", type: null })

  const updateConversationId = (value: string) => {
    setMessageId(null)
    setConversationId(value)
  }

  const updateMessageId = (value: string) => {
    setConversationId(null)
    setMessageId(value)
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    search()
  }

  const search = () => {
    if (conversationId !== null) {
      setSearchValue({ value: conversationId, type: "conversationId" })
    } else if (messageId !== null) {
      setSearchValue({ value: messageId, type: "messageId" })
    } else {
      setSearchValue({ value: "", type: null })
    }
  }

  return (
    <VStack>
      <div className='border-b-ax-border-neutral-subtle mb-2 w-full border-b p-4'>
        <Heading size='xsmall'>Søk etter samtale</Heading>
      </div>
      <form
        onSubmit={submit}
        className='max-w-full'
      >
        <VStack className='mb-6 p-4'>
          <BodyShort
            size='small'
            className='mb-6'
          >
            Bruk enten samtale-id eller meldings-id for å finne samtalen det gjelder.
          </BodyShort>
          <TextField
            size='small'
            label='Søk med samtale-id'
            className='mb-6'
            autoComplete='off'
            value={conversationId ?? ""}
            onChange={(e) => updateConversationId(e.target.value)}
          />
          <TextField
            size='small'
            label='Søk med meldings-id'
            className='mb-6'
            autoComplete='off'
            value={messageId ?? ""}
            onChange={(e) => updateMessageId(e.target.value)}
          />
          <Button
            data-color='neutral'
            variant='primary'
            size='small'
            className='w-fit px-4'
            type='submit'
          >
            Søk
          </Button>
        </VStack>
        <VStack>
          <HStack
            className='bg-ax-bg-neutral-soft w-full p-4'
            gap='space-8'
            align='center'
          >
            <Chat2Icon fontSize={20} />
            <Label size='small'>Samtale</Label>
          </HStack>
          <div className='h-full w-full overflow-auto p-4'>
            {searchValue.type === "conversationId" && <ConversationIdSearch conversationId={searchValue.value} />}
            {searchValue.type === "messageId" && <MessageIdSearch messageId={searchValue.value} />}
            {searchValue.type === null && <BodyShort textColor='subtle'>Samtalen vises her ved søk.</BodyShort>}
          </div>
        </VStack>
      </form>
    </VStack>
  )
}

const ConversationIdSearch = ({ conversationId }: { conversationId: string }) => {
  const {
    data: conversation,
    isLoading,
    error,
  } = useSWR<Conversation, ApiError>(conversationId ? `/api/v1/admin/conversations/${conversationId}` : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  if (error && error.status === 404) {
    return <BodyShort textColor='subtle'>Ingen samtaler funnet med denne samtale-id.</BodyShort>
  }

  if (error) {
    console.error(error)
    return <BodyShort textColor='subtle'>Feil ved lasting av samtale.</BodyShort>
  }

  if (isLoading) {
    return <ConversationLoading />
  }

  if (!conversation) {
    return <BodyShort textColor='subtle'>Samtalen vises her ved søk.</BodyShort>
  }

  return <ConversationPreview conversation={conversation} />
}

const MessageIdSearch = ({ messageId }: { messageId: string }) => {
  const {
    data: conversation,
    isLoading,
    error,
  } = useSWR<Conversation, ApiError>(messageId ? `/api/v1/admin/messages/${messageId}/conversation` : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  if (error && error.status === 404) {
    return <BodyShort textColor='subtle'>Ingen samtaler funnet med denne meldings-id.</BodyShort>
  }

  if (error) {
    console.error(error)
    return <BodyShort textColor='subtle'>Feil ved lasting av samtale.</BodyShort>
  }

  if (isLoading) {
    return <ConversationLoading />
  }

  if (!conversation) {
    return <BodyShort textColor='subtle'>Samtalen vises her ved søk.</BodyShort>
  }

  return (
    <ConversationPreview
      conversation={conversation!}
      messageId={messageId}
    />
  )
}

const ConversationLoading = () => {
  return (
    <div className='align-center flex justify-center'>
      <Loader />
    </div>
  )
}

const ConversationPreview = ({ conversation, messageId }: { conversation: Conversation; messageId?: string }) => {
  const queryParams = messageId ? `?messageId=${messageId}` : ""
  return (
    <VStack gap='space-12'>
      <Heading size='small'>
        <Link
          as={NavLink}
          to={`/admin/${conversation.id}${queryParams}`}
        >
          Samtale med Bob
        </Link>
      </Heading>
      <Detail>ID: {conversation.id}</Detail>
      <Detail>Tittel: "{conversation.title}"</Detail>
      <Detail>Opprettet: {format(new Date(conversation.createdAt), "dd.MM.yyyy HH:mm:ss")}</Detail>
    </VStack>
  )
}

export default SearchConversation
