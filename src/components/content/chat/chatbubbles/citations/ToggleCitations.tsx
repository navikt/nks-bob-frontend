import { Chips } from "@navikt/ds-react"
import { useState } from "react"
import { Message } from "../../../../../types/Message.ts"
import { useSourcesStore } from "../sources/ShowAllSources.tsx"

interface ToggleCitationsProps {
  onToggle: (selected: string[]) => void
  message: Message
}

const citationOptions = ["Sitater fra Nav.no", "Sitater fra Kunnskapsbasen"]

const ToggleCitations = ({ onToggle, message }: ToggleCitationsProps) => {
  const hasNavnoCitations = message.citations.some(
    (citation) => message.context[citation.sourceId].source === "navno",
  )
  const hasKunnskapsbasenCitations = message.citations.some(
    (citation) => message.context[citation.sourceId].source === "nks",
  )

  const filteredOptions = citationOptions.filter((option) => {
    if (option === "Sitater fra Nav.no" && !hasNavnoCitations) {
      return false
    }
    return !(
      option === "Sitater fra Kunnskapsbasen" && !hasKunnskapsbasenCitations
    )
  })

  const [selected, setSelected] = useState<string[]>(citationOptions)

  const handleToggle = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((x) => x !== option)
      : [...selected, option]
    setSelected(newSelected)
    onToggle(newSelected)
  }

  const { activeMessage, setActiveMessage } = useSourcesStore()

  const isActive = activeMessage !== null && activeMessage.id === message.id

  const toggleActive = () => setActiveMessage(isActive ? null : message)

  return (
    <div className='mb-3'>
      <Chips size='small'>
        {filteredOptions.map((option) => (
          <Chips.Toggle
            key={option}
            selected={selected.includes(option)}
            onClick={() => handleToggle(option)}
          >
            {option}
          </Chips.Toggle>
        ))}
        <Chips.Toggle
          key={"Vis alle kilder"}
          selected={isActive}
          onClick={toggleActive}
        >
          Vis alle kilder
        </Chips.Toggle>
      </Chips>
    </div>
  )
}

export default ToggleCitations
