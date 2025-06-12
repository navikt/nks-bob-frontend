import {
  ChatExclamationmarkIcon,
  CheckmarkCircleIcon,
  FilterIcon,
} from "@navikt/aksel-icons"
import {
  ActionMenu,
  BodyShort,
  Box,
  Button,
  HStack,
  Label,
  Loader,
  Pagination,
  Select,
  Tag,
  Textarea,
  VStack,
} from "@navikt/ds-react"
import { format } from "date-fns"
import {
  Dispatch,
  FormEvent,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react"
import { useNavigate, useSearchParams } from "react-router"
import { useFeedbacks, useUpdateFeedback } from "../../../../api/admin"
import { Feedback } from "../../../../types/Message"

export const FeedbackFromUsers = () => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [sort, setSort] = useState<SortValue>("nyest")
  const [activeFilter, setActiveFilter] = useState<FilterValue>("nye")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 4

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter])

  return (
    <VStack ref={menuRef}>
      <FeedbackDescription />
      <FeedbackHeader
        menuRef={menuRef}
        sort={sort}
        setSort={setSort}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
      <FeedbackList
        sort={sort}
        activeFilter={activeFilter}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </VStack>
  )
}

const FeedbackDescription = () => {
  return (
    <Box padding='4' position='sticky'>
      Her finner du tilbakemeldinger som veilederne sender oss når de ser at noe
      er galt med svaret.
    </Box>
  )
}

const SORT = {
  nyest: "Nyeste først",
  eldst: "Eldste først",
}

type SortValue = keyof typeof SORT

const FILTERS = {
  nye: "Nye",
  ferdigstilte: "Ferdigstilte",
  viktige: "Viktige",
  "særskilt-viktige": "Særskilt viktige",
}

type FilterValue = keyof typeof FILTERS

const FeedbackHeader = ({
  menuRef,
  sort,
  setSort,
  activeFilter,
  setActiveFilter,
}: {
  menuRef: RefObject<HTMLDivElement | null>
  sort: SortValue
  setSort: Dispatch<SetStateAction<SortValue>>
  activeFilter: FilterValue
  setActiveFilter: Dispatch<SetStateAction<FilterValue>>
}) => {
  const { total } = useFeedbacks(activeFilter, 0, 0)
  return (
    <Box className='bg-[#F5F6F7]' padding='4' position='sticky'>
      <HStack align='center' justify='space-between'>
        <HStack gap='2' align='center'>
          <ChatExclamationmarkIcon />
          <BodyShort size='medium' textColor='subtle'>
            Alle tilbakemeldinger {total > 0 && `(${total})`}
          </BodyShort>
        </HStack>
        <ActionMenu rootElement={menuRef.current}>
          <ActionMenu.Trigger>
            <Button variant='tertiary-neutral' icon={<FilterIcon />} />
          </ActionMenu.Trigger>
          <ActionMenu.Content>
            <ActionMenu.RadioGroup
              label='Filtrer'
              defaultValue='nye'
              value={activeFilter as string}
              onValueChange={(value) => setActiveFilter(value as FilterValue)}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {Object.entries(FILTERS).map(([value, label]) => (
                <ActionMenu.RadioItem
                  key={`feedback-filter-item-${value}`}
                  value={value}
                >
                  {label}
                </ActionMenu.RadioItem>
              ))}
            </ActionMenu.RadioGroup>
            <ActionMenu.Divider />
            <ActionMenu.RadioGroup
              label='Sorter'
              defaultValue='nyest'
              value={sort as string}
              onValueChange={(value) => setSort(value as SortValue)}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {Object.entries(SORT).map(([value, label]) => (
                <ActionMenu.RadioItem
                  key={`feedback-sort-item-${value}`}
                  value={value}
                >
                  {label}
                </ActionMenu.RadioItem>
              ))}
            </ActionMenu.RadioGroup>
          </ActionMenu.Content>
        </ActionMenu>
      </HStack>
    </Box>
  )
}

const FeedbackList = ({
  sort,
  activeFilter,
  currentPage,
  pageSize,
  onPageChange,
}: {
  sort: SortValue
  activeFilter: FilterValue
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
}) => {
  const { feedbacks, total, isLoading } = useFeedbacks(
    activeFilter,
    currentPage - 1,
    pageSize,
  )
  const [searchParams] = useSearchParams()
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  )

  const totalPages = Math.ceil(total / pageSize)

  useEffect(() => {
    if (searchParams.has("messageId")) {
      const messageId = searchParams.get("messageId")!
      setSelectedMessageId(messageId)
    }
  }, [searchParams])

  if (isLoading) {
    return (
      <div className='align-center flex justify-center'>
        <Loader />
      </div>
    )
  }

  if (!feedbacks) {
    return (
      <BodyShort textColor='subtle'>Fant ingen tilbakemeldinger.</BodyShort>
    )
  }

  const compareDate = (a: string, b: string) =>
    new Date(a).getTime() - new Date(b).getTime()

  const byDate: ((a: Feedback, b: Feedback) => number) | undefined = (a, b) =>
    sort === "eldst"
      ? compareDate(a.createdAt, b.createdAt)
      : compareDate(b.createdAt, a.createdAt)

  return (
    <VStack className='overflow-scroll'>
      {feedbacks.sort(byDate).map((feedback) => (
        <SingleFeedback
          key={`single-feedback-${feedback.id}`}
          feedback={feedback}
          isSelected={feedback.messageId === selectedMessageId}
        />
      ))}

      {totalPages > 1 && (
        <HStack padding='4' justify='center'>
          <Pagination
            page={currentPage}
            onPageChange={onPageChange}
            count={totalPages}
            size='xsmall'
          />
        </HStack>
      )}
    </VStack>
  )
}

const IMPORTANCE_OPTIONS = {
  "ikke-relevant": "Ikke relevant",
  "lite-viktig": "Lite viktig",
  viktig: "Viktig",
  "særskilt-viktig": "Særskilt viktig",
}

type ImportanceOptionsValue = keyof typeof IMPORTANCE_OPTIONS

const CATEGORY_OPTIONS = {
  "ki-feil": "KI-feil",
  brukerfeil: "Brukerfeil",
}

type CategoryOptionsValue = keyof typeof CATEGORY_OPTIONS

const SingleFeedback = ({
  feedback,
  isSelected,
}: {
  feedback: Feedback
  isSelected: boolean
}) => {
  const navigate = useNavigate()
  const [category, setCategory] = useState<CategoryOptionsValue | "">(
    (feedback.resolvedCategory as CategoryOptionsValue) ?? "",
  )
  const [importance, setImportance] = useState<ImportanceOptionsValue | "">(
    (feedback.resolvedImportance as ImportanceOptionsValue) ?? "",
  )
  const [note, setNote] = useState<string>("")
  const [isResolved, setIsResolved] = useState(feedback.resolved)
  const { updateFeedback, isLoading } = useUpdateFeedback(feedback.id)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (category === "" || !CATEGORY_OPTIONS[category]) {
      console.error(`Invalid category value "${category}"`)
      return
    }

    if (importance === "" || !IMPORTANCE_OPTIONS[importance]) {
      console.error(`Invalid importance value "${importance}"`)
      return
    }

    const updatedFeedback = {
      options: feedback.options,
      comment: feedback.comment,
      resolved: true,
      resolvedCategory: category,
      resolvedImportance: importance,
      resolvedNote: note,
    }

    updateFeedback(updatedFeedback).then(({ resolved }) => {
      setIsResolved(resolved)
    })
  }

  const buttonLabel = isResolved ? "Ferdigstilt" : "Ferdigstill"
  const buttonStyle = isResolved ? "bg-[#00893C] text-white" : ""

  const isResolvable = category !== "" && importance !== ""

  return (
    <Box
      paddingBlock='7'
      paddingInline='4'
      borderWidth='0 0 1 0'
      borderColor='border-subtle'
      onClick={() =>
        navigate(
          `/admin/${feedback.conversationId}?messageId=${feedback.messageId}`,
        )
      }
      className={`cursor-pointer hover:bg-[#F1F7FF] ${isSelected ? "bg-[#F5F6F7]" : ""}`}
    >
      <VStack gap='4'>
        <HStack justify='space-between'>
          <Label size='medium'>
            Feil innmeldt:{" "}
            {format(new Date(feedback.createdAt), "dd.MM.yy (HH:mm)")}
          </Label>
          <Tag variant='neutral-moderate' size='xsmall'>
            {feedback.id.substring(30)}
          </Tag>
        </HStack>
        <VStack gap='2'>
          <Label size='small'>Hva er galt med svaret?</Label>
          <HStack gap='2'>
            {feedback.options.map((option) => (
              <FeedbackOptionTag
                key={`${feedback.id}-${option}`}
                option={option}
                comment={feedback.comment}
              />
            ))}
          </HStack>
        </VStack>
        <form onSubmit={submit}>
          <HStack gap='2' align='end'>
            <Select
              label='Marker som'
              size='small'
              className='max-w-32'
              onChange={(event) =>
                setCategory(event.target.value as CategoryOptionsValue | "")
              }
              value={category}
            >
              <option value=''>Velg</option>
              {Object.entries(CATEGORY_OPTIONS).map(([value, label]) => (
                <option key={`feedback-category-option-${value}`} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              label='Viktighet'
              size='small'
              className='max-w-32'
              onChange={(event) =>
                setImportance(event.target.value as ImportanceOptionsValue | "")
              }
              value={importance}
            >
              <option value=''>Velg</option>
              {Object.entries(IMPORTANCE_OPTIONS).map(([value, label]) => (
                <option
                  key={`feedback-importance-option-${value}`}
                  value={value}
                >
                  {label}
                </option>
              ))}
            </Select>
            <Textarea
              label='Notat'
              value={note}
              onChange={(event) => setNote(event.target.value)}
              size="small"
              minRows={1}
              rows={1}
              maxRows={5}
            />
            {isResolvable && (
              <Button
                type='submit'
                variant='secondary-neutral'
                size='small'
                iconPosition='right'
                icon={<CheckmarkCircleIcon />}
                loading={isLoading}
                className={buttonStyle}
              >
                {buttonLabel}
              </Button>
            )}
          </HStack>
        </form>
      </VStack>
    </Box>
  )
}

const FeedbackOptionTag = ({
  option,
  comment,
}: {
  option: string
  comment: string | null
}) => {
  if (option === "Annet") {
    return <BodyShort>Annet: {comment}</BodyShort>
  }

  return (
    <Tag variant='neutral' size='small'>
      {option}
    </Tag>
  )
}
