import { HStack } from "@navikt/ds-react";
import { HistorikkButton, NewButton } from "./Buttons.tsx";
import "./Menu.css";

interface MenuProps {
  onNewChatClick: () => void;
}

function Menu({ onNewChatClick }: MenuProps) {
  return (
    <div className="fixed top-16 min-h-16 w-full max-w-2xl bg-bg-default">
      <HStack justify="start" align="center" className="min-h-16">
        <HistorikkButton />
        <NewButton newChatClick={onNewChatClick} />
      </HStack>
    </div>
  );
}

export default Menu;
