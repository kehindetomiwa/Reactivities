import { Button } from "@mui/material";
import type { ReactNode } from "react";
import { NavLink } from "react-router";

type Props = {
  children: ReactNode;
  to: string;
};

// Built on Button rather than MenuItem: MUI's MenuItem requires MenuListContext
// and throws when rendered outside a Menu/MenuList, which the NavBar is not.
export default function MenuItemLink({ children, to }: Props) {
  return (
    <Button
      component={NavLink}
      to={to}
      sx={{
        fontSize: "1.2rem",
        textTransform: "uppercase",
        fontWeight: "bold",
        color: "inherit",
        "&.active": {
          color: "#F9E8A2",
        },
      }}
    >
      {children}
    </Button>
  );
}
