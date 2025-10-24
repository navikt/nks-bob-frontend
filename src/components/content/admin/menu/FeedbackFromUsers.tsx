import { ChatExclamationmarkIcon, CheckmarkCircleIcon, FilterIcon } from "@navikt/aksel-icons"
import {
  ActionMenu,
  BodyShort,
  Box,
  Button,
  HStack,
  Label,
  Loader,
  Pagination,
  Popover,
  Select,
  Tag,
  Textarea,
  VStack,
} from "@navikt/ds-react"
import { format } from "date-fns"
import { Dispatch, FormEvent, RefObject, SetStateAction, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { preloadFeedbacks, useFeedbacks, useUpdateFeedback } from "../../../../api/admin"
import { Feedback } from "../../../../types/Message"

export const FeedbackFromUsers = () => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [sort, setSort] = useState<SortValue>("CREATED_AT_DESC")
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>(["nye"])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 4

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilters])

  return (
    <VStack ref={menuRef}>
      <FeedbackDescription />
      <FeedbackHeader
        menuRef={menuRef}
        sort={sort}
        setSort={setSort}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
      />
      <FeedbackList
        sort={sort}
        activeFilters={activeFilters}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </VStack>
  )
}

const FeedbackDescription = () => {
  return (
    <Box
      padding='4'
      position='sticky'
    >
      Her finner du tilbakemeldinger som veilederne sender oss når de ser at noe er galt med svaret.
    </Box>
  )
}

const SORT = {
  CREATED_AT_DESC: "Nyeste først",
  CREATED_AT_ASC: "Eldste først",
}

type SortValue = keyof typeof SORT

const FILTERS = {
  nye: "Nye",
  ferdigstilte: "Ferdigstilte",
  "ikke-relevante": "Ikke relevante",
  "litt-viktige": "Litt viktige",
  viktige: "Viktige",
  "særskilt-viktige": "Særskilt viktige",
  brukerfeil: "Brukerfeil",
  "ki-feil": "KI-feil",
  "hele-deler-av-svaret-er-feil": "Hele-/deler av svaret er feil",
  "mangler-vesentlige-detaljer": "Mangler vesentlige detaljer",
  "benytter-ikke-forventede-artikler": "Benytter ikke forventede artikler",
  "forholder-seg-ikke-til-kontekst": "Forholder seg ikke til kontekst",
  "blander-ytelser": "Blander ytelser",
  "finner-ikke-sitatet-i-artikkelen": "Finner ikke sitatet i artikkelen",
  "mangler-kilder": "Mangler kilder",
  annet: "Annet",
  arbeid: "Arbeid",
  helse: "Helse",
  familie: "Familie",
  pleiepenger: "Pleiepenger",
  gjeldsveiledning: "Gjeldsveiledning",
  "sosiale-tjenester": "Sosiale tjenester",
  pensjon: "Pensjon",
  uforetrygd: "Uføretrygd",
  arbeidsgiver: "Arbeidsgiver",
  internasjonalt: "Internasjonalt",
  fellesrutinene: "Fellesrutinene",
}

type FilterValue = keyof typeof FILTERS

const FeedbackHeader = ({
  menuRef,
  sort,
  setSort,
  activeFilters,
  setActiveFilters,
}: {
  menuRef: RefObject<HTMLDivElement | null>
  sort: SortValue
  setSort: Dispatch<SetStateAction<SortValue>>
  activeFilters: FilterValue[]
  setActiveFilters: Dispatch<SetStateAction<FilterValue[]>>
}) => {
  const { total } = useFeedbacks(activeFilters)

  const handleCheckboxChange = (value: FilterValue) => {
    setActiveFilters(
      activeFilters.includes(value) ? activeFilters.filter((filter) => filter !== value) : [...activeFilters, value],
    )
  }

  return (
    <Box
      className='bg-[#F5F6F7]'
      padding='4'
      position='sticky'
    >
      <HStack
        align='center'
        justify='space-between'
      >
        <HStack
          gap='2'
          align='center'
        >
          <ChatExclamationmarkIcon />
          <BodyShort
            size='medium'
            textColor='subtle'
          >
            Alle tilbakemeldinger {total > 0 && `(${total})`}
          </BodyShort>
        </HStack>
        <ActionMenu rootElement={menuRef.current}>
          <ActionMenu.Trigger>
            <Button
              variant='tertiary-neutral'
              icon={<FilterIcon />}
            />
          </ActionMenu.Trigger>
          <ActionMenu.Content>
            <ActionMenu.Group
              label='Filtrer'
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {Object.entries(FILTERS).map(([value, label]) => (
                <ActionMenu.CheckboxItem
                  key={`feedback-filter-item-${value}`}
                  checked={activeFilters.includes(value as FilterValue)}
                  onCheckedChange={() => handleCheckboxChange(value as FilterValue)}
                >
                  {label}
                </ActionMenu.CheckboxItem>
              ))}
            </ActionMenu.Group>
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
  activeFilters,
  currentPage,
  pageSize,
  onPageChange,
}: {
  sort: SortValue
  activeFilters: FilterValue[]
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
}) => {
  const { feedbacks, total, isLoading } = useFeedbacks(activeFilters, currentPage - 1, pageSize, sort)
  const [searchParams] = useSearchParams()
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)

  const totalPages = Math.ceil(total / pageSize)

  // preloads the page before and after `page`
  const preloadPrevNext = (page: number) => {
    // NOTE: `page` is 1-indexed
    const prevPage = Math.max(0, page - 2)
    const nextPage = Math.min(totalPages - 1, page)

    preloadFeedbacks(activeFilters, prevPage, pageSize, sort)
    preloadFeedbacks(activeFilters, nextPage, pageSize, sort)
  }

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
    return <BodyShort textColor='subtle'>Fant ingen tilbakemeldinger.</BodyShort>
  }

  return (
    <VStack className='overflow-scroll'>
      {feedbacks.map((feedback) => (
        <SingleFeedback
          key={`single-feedback-${feedback.id}`}
          feedback={feedback}
          isSelected={feedback.messageId !== null && feedback.messageId === selectedMessageId}
        />
      ))}

      {totalPages > 1 && (
        <HStack
          padding='4'
          justify='center'
        >
          <Pagination
            page={currentPage}
            onPageChange={(page) => {
              preloadPrevNext(page)
              onPageChange(page)
            }}
            count={totalPages}
            size='xsmall'
            onPointerEnter={() => preloadPrevNext(currentPage)}
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

const DOMAIN_OPTIONS = {
  arbeid: "Arbeid",
  helse: "Helse",
  familie: "Familie",
  pleiepenger: "Pleiepenger",
  gjeldsveiledning: "Gjeldsveiledning",
  "sosiale-tjenester": "Sosiale tjenester",
  pensjon: "Pensjon",
  uforetrygd: "Uføretrygd",
  arbeidsgiver: "Arbeidsgiver",
  internasjonalt: "Internasjonalt",
  fellesrutinene: "Fellesrutinene",
}

type DomainOptionsValue = keyof typeof DOMAIN_OPTIONS

const SingleFeedback = ({ feedback, isSelected }: { feedback: Feedback; isSelected: boolean }) => {
  const navigate = useNavigate()
  const [category, setCategory] = useState<CategoryOptionsValue | "">(
    (feedback.resolvedCategory as CategoryOptionsValue) ?? "",
  )
  const [importance, setImportance] = useState<ImportanceOptionsValue | "">(
    (feedback.resolvedImportance as ImportanceOptionsValue) ?? "",
  )
  const [domain, setDomain] = useState<DomainOptionsValue | "">((feedback.domain as DomainOptionsValue) ?? "")
  const [note, setNote] = useState<string>(feedback.resolvedNote ?? "")
  const [isResolved, setIsResolved] = useState(feedback.resolved)
  const { updateFeedback, isLoading } = useUpdateFeedback(feedback.id)

  const boxRef = useRef(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

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
      domain: domain === "" ? null : domain,
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
      ref={boxRef}
      paddingBlock='7'
      paddingInline='4'
      borderWidth='0 0 1 0'
      borderColor='border-subtle'
      onClick={() =>
        feedback.messageId === null
          ? setPopoverOpen(true)
          : navigate(`/admin/${feedback.conversationId}?messageId=${feedback.messageId}`)
      }
      className={`cursor-pointer hover:bg-[#F1F7FF] ${isSelected ? "bg-[#F5F6F7]" : ""}`}
    >
      <Popover
        anchorEl={boxRef.current}
        open={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        offset={0}
        className='max-w-[90%]'
      >
        <Popover.Content>
          Denne meldingen finnes ikke. Den har sannsynligvis blitt slettet hvis den er over 30 dager gammel.
        </Popover.Content>
      </Popover>
      <VStack gap='4'>
        <HStack justify='space-between'>
          <Label size='medium'>Feil innmeldt: {format(new Date(feedback.createdAt), "dd.MM.yy (HH:mm)")}</Label>
          <Tag
            variant='neutral-moderate'
            size='xsmall'
          >
            {feedback.id.substring(30)}
          </Tag>
        </HStack>
        <VStack gap='2'>
          <Label size='small'>Hva er galt med svaret?</Label>
          {feedback.options.map((option) => (
            <VStack gap='4'>
              <HStack gap='2'>
                <FeedbackOptionTag
                  key={`${feedback.id}-${option}`}
                  option={option}
                />
              </HStack>
            </VStack>
          ))}
          <VStack gap='2'>
            <Label size='small'>Kommentar: </Label>
            <BodyShort size='small'>{feedback.comment}</BodyShort>
          </VStack>
        </VStack>
        <form onSubmit={submit}>
          <HStack
            gap='4'
            align='end'
          >
            <Select
              label='Marker som'
              size='small'
              className='max-w-32'
              onChange={(event) => setCategory(event.target.value as CategoryOptionsValue | "")}
              value={category}
              disabled={isResolved}
            >
              <option value=''>Velg</option>
              {Object.entries(CATEGORY_OPTIONS).map(([value, label]) => (
                <option
                  key={`feedback-category-option-${value}`}
                  value={value}
                >
                  {label}
                </option>
              ))}
            </Select>
            <Select
              label='Viktighet'
              size='small'
              className='max-w-32'
              onChange={(event) => setImportance(event.target.value as ImportanceOptionsValue | "")}
              value={importance}
              disabled={isResolved}
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
            <Select
              label='Fagområde'
              size='small'
              className='max-w-32'
              onChange={(event) => setDomain(event.target.value as DomainOptionsValue | "")}
              value={domain}
              disabled={isResolved}
            >
              <option value=''>Velg</option>
              {Object.entries(DOMAIN_OPTIONS).map(([value, label]) => (
                <option
                  key={`feedback-domain-option-${value}`}
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
              disabled={isResolved}
              size='small'
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
                disabled={isResolved}
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

const FeedbackOptionTag = ({ option }: { option: string }) => {
  // if (option === "Annet") {
  //   return <BodyShort>Annet: {comment}</BodyShort>
  // }

  return (
    <Tag
      variant='neutral'
      size='small'
    >
      {option}
    </Tag>
  )
}
