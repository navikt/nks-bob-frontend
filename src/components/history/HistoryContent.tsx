import { Heading, Link } from '@navikt/ds-react';

function HistoryContent() {
    return(
        <div className="
        sticky
        left-0
        top-16
        min-w-60
        bg-bg-subtle
        max-md:hidden
        p-4
        ">
          <Heading size="small" className="mb-6 pt-2">Dine samtaler</Heading>
          <ul className="list-none w-full">
            <li><Link>Hei</Link></li>
          </ul>
        </div>
    )
}

export default HistoryContent