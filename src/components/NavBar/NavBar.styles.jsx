import { styled } from "@mui/material";
import {
  AppBar,
  Button,
  IconButton,
  Drawer,
  ListItemText,
} from "@mui/material";

export const NavBarContainer = styled(AppBar)(() => ({
  backgroundColor: "transparent",
  boxShadow: "none",
  padding: "0.5rem 0",
  borderBottom: "1px solid #ccc",

  boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
}));

export const NavLink = styled(Button)(({ theme, variant }) => ({
  color: theme.palette.secondary.dark,
  padding: "0.75rem 1.45rem",
  fontWeight: "bold",
  marginRight: theme.spacing(1),
  textTransform: "uppercase",
  textDecoration: "none",

  "&:hover": {
    color: theme.palette.primary.dark,
    backgroundColor: theme.palette.primary.custom,

    ...(variant === "outlined" && {
      backgroundColor: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    }),
  },

  "& > a": {
    textDecoration: "none",
    color: "inherit",
  },

  [theme.breakpoints.down("lg")]: {
    padding: "0.5rem 1rem",
  },

  [theme.breakpoints.down("md")]: {
    fontSize: "1.1rem",
  },
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.secondary.dark,

  "& > svg": {
    width: "2.2rem",
    height: "2.2rem",
  },
}));

export const StyledDrawer = styled(Drawer)(() => ({
  "& .MuiDrawer-paper": {
    width: "50vw", 
  },
}));

export const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  fontSize: "1rem", 

  "& > span": {
    [theme.breakpoints.down("md")]: {
      fontSize: "1.35rem",
    },
  },
}));
