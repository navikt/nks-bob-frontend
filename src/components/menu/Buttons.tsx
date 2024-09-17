import { Button } from "@navikt/ds-react";
import { NotePencilIcon, ClockDashedIcon } from "@navikt/aksel-icons";

interface ButtonsProps {
  newChatClick: () => void;
}

export const HistorikkButton = () => {
  return (
    <>
      <Button
        variant="tertiary"
        size="medium"
        icon={<ClockDashedIcon aria-hidden />}
        className="md:hidden mr-2"
      ></Button>
    </>
  );
};

export const NewButton = ({ newChatClick }: ButtonsProps) => {
  return (
    <>
      <Button
        variant="tertiary"
        size="medium"
        icon={<NotePencilIcon aria-hidden />}
        className="md:hidden"
        onClick={newChatClick}
      ></Button>
      <Button
        variant="tertiary"
        size="medium"
        icon={<NotePencilIcon aria-hidden />}
        className="max-md:hidden"
        onClick={newChatClick}
      >
        Ny chat
      </Button>
    </>
  );
};
