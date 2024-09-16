import { HistorikkButton, NewButton } from "./Buttons.tsx";
import "./Menu.css";
import {HStack} from "@navikt/ds-react";

interface MenuProps {
  onNewChatClick: () => void;
}

function Menu({ onNewChatClick }: MenuProps) {
  return (
    <div className="sticky top-16 min-h-16 z-10 bg-bg-default">
      <HStack justify="space-between" align="center" className="min-h-16">
        <HistorikkButton />
        <NewButton newChatClick={onNewChatClick} />
      </HStack>
    </div>
  );
}

export default Menu;
