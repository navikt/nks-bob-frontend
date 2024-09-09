import { mockUser } from './mockUser.ts';
import {
    InternalHeader,
    Spacer,
} from "@navikt/ds-react";

function Header() {
    return (
        <InternalHeader className="flex min-h-16 fixed top-0 left-0 right-0 z-3">
            <InternalHeader.Title as="h1">NKS-Bob</InternalHeader.Title>
            <Spacer />
            <InternalHeader.User name={mockUser.username} description={mockUser.aadUsername} />
        </InternalHeader>
    );
};

export default Header