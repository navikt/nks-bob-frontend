import { useState } from "react"
import { Chips } from "@navikt/ds-react";

interface ToggleCitationsProps {
  onToggle: (selected: string[]) => void
}

const options = [
  "Sitater fra Nav.no",
  "Sitater fra Kunnskapsbasen",
];

const ToggleCitations = ({ onToggle }: ToggleCitationsProps ) => {
  const [selected, setSelected] = useState<string[]>(options)

  const handleToggle = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((x) => x !== option)
      : [...selected, option];
    setSelected(newSelected);
    onToggle(newSelected);
  };

  return (
    <div className='mb-3'>
      <Chips size='small'>
        {options.map((option) => (
          <Chips.Toggle
            key={option}
            selected={selected.includes(option)}
            onClick={() => handleToggle(option)}
          >
            {option}
          </Chips.Toggle>
        ))}
      </Chips>
    </div>
  );
};

export default ToggleCitations