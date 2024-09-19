import { HStack } from "@navikt/ds-react";
import { HistorikkButton, NewButton } from "./Buttons.tsx";
import "./Menu.css";

function Menu() {
  return (
    <div className="sticky top-0 z-10 min-h-16 w-full max-w-2xl bg-bg-subtle">
      <HStack justify="start" align="center" className="min-h-16">
        <HistorikkButton />
        <NewButton />
      </HStack>
    </div>
  );
}

export default Menu;
