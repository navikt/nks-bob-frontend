import { ClockDashedIcon, NotePencilIcon } from "@navikt/aksel-icons";
import { Button } from "@navikt/ds-react";

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
        className="mr-2 md:hidden"
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
