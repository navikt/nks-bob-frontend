import { mockUser } from "./mockUser.ts";
import { InternalHeader, Spacer } from "@navikt/ds-react";

function Header() {
  return (
      <InternalHeader className="sticky top-0 min-h-16 z-10 w-full">
      <InternalHeader.Title as="h1">NKS-Bob</InternalHeader.Title>
      <Spacer />
      <InternalHeader.User
        name={mockUser.username}
        description={mockUser.aadUsername}
      />
    </InternalHeader>
  );
}

export default Header;
