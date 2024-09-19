import { InternalHeader, Spacer } from "@navikt/ds-react";
import { Link } from "react-router-dom";
import { mockUser } from "./mockUser.ts";

function Header() {
  return (
    <InternalHeader className="sticky left-0 right-0 top-0 z-10 h-16 w-full">
      <Link to="/" className="items-center">
        <InternalHeader.Title as="h1">NKS-Bob</InternalHeader.Title>
      </Link>
      <Spacer />
      <InternalHeader.User
        name={mockUser.username}
        description={mockUser.aadUsername}
      />
    </InternalHeader>
  );
}

export default Header;
