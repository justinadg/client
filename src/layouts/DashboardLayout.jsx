import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Toolbar,
  Container,
  Typography,
  IconButton,
  Badge,
  Divider,
  List,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import DashboardListItems from "../components/DashboardListItems";
import { useDispatch } from "react-redux";
import { logout } from "../services/store/authSlice";
import { useLogoutUserMutation } from "../services/api/authApi";
import { getRefreshTokenFromStorage } from "../utils/storage";
import { useNavigate } from "react-router-dom";
import { StyledAppBar, StyledDrawer } from "./DashboardLayout.styles";
import { Home } from "@mui/icons-material";
import { Link } from "react-router-dom";

DashboardLayout.propTypes = {
  children: PropTypes.node,
};

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [logoutUser] = useLogoutUserMutation(); 

  const [open, setOpen] = React.useState(!isSmallScreen);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  useEffect(() => {
    setOpen(!isSmallScreen);
  }, [isSmallScreen]);

  const handleLogout = async () => {
    const refreshToken = getRefreshTokenFromStorage();
    if (refreshToken) {
      try {
        await logoutUser(refreshToken).unwrap();
        dispatch(logout());
        navigate("/");
      } catch (err) {
        console.error("Failed to logout:", err);
      }
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <StyledAppBar position="absolute" open={open}>
        <Toolbar
          sx={{
            pr: "24px",
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: "36px",
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            Dashboard
          </Typography>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <IconButton color="inherit">
              <Home />
            </IconButton>
          </Link>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </StyledAppBar>
      <StyledDrawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: [1],
          }}
        >
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List component="nav">
          <DashboardListItems />
        </List>
      </StyledDrawer>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}