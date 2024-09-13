import { Button } from '@navikt/ds-react';
import { NotePencilIcon, ClockDashedIcon } from "@navikt/aksel-icons";

interface ButtonsProps {
    newChatClick: () => void
}

export const HistorikkButton = () => {
    return (
        <>
            <Button
                variant="secondary"
                size="small"
                icon={<ClockDashedIcon aria-hidden />}
                className="lg:hidden mr-2"
            >
            </Button>
        </>
    )
}

export const NewButton = ( {newChatClick}: ButtonsProps ) => {
    return (
        <>
            <Button
                variant="secondary"
                size="small"
                icon={<NotePencilIcon aria-hidden />}
                className="lg:hidden"
                onClick={newChatClick}
            >
            </Button>
            <Button
                variant="tertiary"
                size="medium"
                icon={<NotePencilIcon aria-hidden />}
                className="max-lg:hidden"
                onClick={newChatClick}
            >
                Ny chat
            </Button>
        </>
    )
}