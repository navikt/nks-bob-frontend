import { ChatExclamationmarkIcon, FilterIcon } from "@navikt/aksel-icons"
import {
  ActionMenu,
  BodyShort,
  Box,
  Button,
  HStack,
  Label,
  Loader,
  Select,
  Tag,
  VStack,
} from "@navikt/ds-react"
import { format } from "date-fns"
import { Dispatch, RefObject, SetStateAction, useRef, useState } from "react"
import { useFeedbacks } from "../../../../api/admin"
import { Feedback } from "../../../../types/Message"

export const FeedbackFromUsers = () => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [sort, setSort] = useState<SortValue>("nyest")
  const [activeFilter, setActiveFilter] = useState<FilterValue>("nye")

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
      <FeedbackList sort={sort} activeFilter={activeFilter} />
    </VStack>
  )
}

const FeedbackDescription = () => {
  return (
    <Box padding='4' position='sticky'>
      Her finner du feilmeldinger som veilederne sender oss når de ser at noe er
      galt med svaret.
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
    menuRef: RefObject<HTMLDivElement | null>
  sort: SortValue
  setSort: Dispatch<SetStateAction<SortValue>>
  activeFilter: FilterValue
  setActiveFilter: Dispatch<SetStateAction<FilterValue>>
}) => {
  return (
    <Box className='bg-[#F5F6F7]' padding='4' position='sticky'>
      <HStack align='center' justify='space-between'>
        <HStack gap='2' align='center'>
          <ChatExclamationmarkIcon />
          <BodyShort size='medium' textColor='subtle'>
            Alle feilmeldinger
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
}: {
  sort: SortValue
  activeFilter: FilterValue
}) => {
  const { feedbacks, isLoading } = useFeedbacks(activeFilter)

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
        />
      ))}
    </VStack>
  )
}

const OPTIONS = {
  "ikke-relevant": "Ikke relevant",
  "lite-viktig": "Lite viktig",
  viktig: "Viktig",
  "særskilt-viktig": "Særskilt viktig",
}

const SingleFeedback = ({ feedback }: { feedback: Feedback }) => {
  return (
    <Box
      paddingBlock='7'
      paddingInline='4'
      borderWidth='0 0 1 0'
      borderColor='border-subtle'
    >
      <VStack gap='4'>
        <Label size='medium'>
          Feil innmeldt:{" "}
          {format(new Date(feedback.createdAt), "dd.MM.yy (HH:mm)")}
        </Label>
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
        <Select label='Marker som' size='small'>
          <option value=''>Velg</option>
          {Object.entries(OPTIONS).map(([value, label]) => (
            <option key={`feedback-option-${value}`} value={value}>
              {label}
            </option>
          ))}
        </Select>
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
