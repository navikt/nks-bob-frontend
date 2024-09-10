import { Button } from '@navikt/ds-react';
import { NotePencilIcon, ClockDashedIcon } from "@navikt/aksel-icons";

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

export const NewButton = () => {
    return (
        <>
            <Button
                variant="secondary"
                size="small"
                icon={<NotePencilIcon aria-hidden />}
                className="lg:hidden"
            >
            </Button>
            <Button
                variant="tertiary"
                size="medium"
                icon={<NotePencilIcon aria-hidden />}
                className="max-lg:hidden"
            >
                Ny chat
            </Button>
        </>
    )
}