import { Button } from '@navikt/ds-react';
import { PencilIcon } from "@navikt/aksel-icons";

function Menu() {
    return (
        <div className="fixed top-20 bg-white">
            <Button variant="tertiary" size="medium" icon={<PencilIcon aria-hidden />}>
                Historikk
            </Button>
        </div>
    )
}

export default Menu