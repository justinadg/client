import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ContentCutIcon from "@mui/icons-material/Handyman";
import PeopleIcon from "@mui/icons-material/People";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import StarIcon from "@mui/icons-material/Star";
import ElectricCar from "@mui/icons-material/ElectricCar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InventoryIcon from "@mui/icons-material/Inventory";

export default function DashboardListItems() {
  const userRole = useSelector((state) => state.auth.user?.role);

  const getDashboardRoute = () => {
    switch (userRole) {
      case "admin":
        return "/admin/dashboard";
      case "staff":
        return "/staff/dashboard";
      case "user":
        return "/user/dashboard";
      default:
        return "/";
    }
  };

  return (
    <>
      {/* Only show Dashboard for admin and staff */}
      {(userRole === "admin" || userRole === "staff") && (
        <ListItemButton component={Link} to={getDashboardRoute()}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      )}
      
      <ListItemButton component={Link} to="/appointments">
        <ListItemIcon>
          <WatchLaterIcon />
        </ListItemIcon>
        <ListItemText primary="Appointments" />
      </ListItemButton>
      
      {(userRole === "user" || userRole === "admin") && (
        <ListItemButton component={Link} to="/reviews">
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <ListItemText primary="Reviews" />
        </ListItemButton>
      )}
      
      {userRole === "admin" && (
        <>
          <ListItemButton component={Link} to="/manage-staffs">
            <ListItemIcon>
              <ContentCutIcon />
            </ListItemIcon>
            <ListItemText primary="Staffs" />
          </ListItemButton>

          <ListItemButton component={Link} to="/manage-stocks">
            <ListItemIcon>
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText primary="Stock" />
          </ListItemButton>

          <ListItemButton component={Link} to="/manage-services">
            <ListItemIcon>
              <ElectricCar />
            </ListItemIcon>
            <ListItemText primary="Services" />
          </ListItemButton>
          
          <ListItemButton component={Link} to="/manage-users">
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItemButton>
        </>
      )}
      
      <ListItemButton component={Link} to="/profile">
        <ListItemIcon>
          <AccountCircleIcon />
        </ListItemIcon>
        <ListItemText primary="My Profile" />
      </ListItemButton>
    </>
  );
}