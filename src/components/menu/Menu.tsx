import { HStack } from "@navikt/ds-react";
import { HistorikkButton, NewButton } from "./Buttons.tsx";
import "./Menu.css";

interface MenuProps {
  onNewChatClick: () => void;
}

function Menu({ onNewChatClick }: MenuProps) {
  return (
    <div className="sticky top-0 w-full bg-bg-default">
      <HStack justify="start" align="center" className="min-h-16">
        <HistorikkButton />
        <NewButton newChatClick={onNewChatClick} />
      </HStack>
    </div>
  );
}

export default Menu;
