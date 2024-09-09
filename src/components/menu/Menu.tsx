import { Button } from '@navikt/ds-react';
import { PencilIcon } from "@navikt/aksel-icons";

function Menu() {
    return (
        <div className="
        fixed
        content-center
        top-16
        bg-bg-default
        w-full
        min-h-16
        ">
            <Button variant="tertiary" size="medium" icon={<PencilIcon aria-hidden />}>
                Ny chat
            </Button>
        </div>
    )
}

export default Menu