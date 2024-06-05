import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Divider,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem as MuiMenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { tokens } from "../../theme";
import DataSaverOffOutlinedIcon from "@mui/icons-material/DataSaverOffOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";
import FileOpenOutlinedIcon from "@mui/icons-material/FileOpenOutlined";
import Diversity1OutlinedIcon from "@mui/icons-material/Diversity1Outlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import CategoryIcon from "@mui/icons-material/Category";
import useAuthStore from "../../stores/authStore";
import axios from "axios";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
        <Typography>{title}</Typography>
      </Link>
    </MenuItem>
  );
};

const determineActiveItem = (location) => {
  const path = location.pathname.split("/app/")[1];
  switch (path) {
    case "dashboard":
      return "Dashboard";
    case "activities":
      return "Activities";
    case "reports":
      return "Reports";
    case "calendar":
      return "Calendar";
    case "beneficiaries":
      return "Beneficiaries";
    case "managetypes":
      return "Manage Beneficiary Types";
    case "manageaccount":
      return "Manage Account";
    case "archives":
      return "Archives";
    case "bns":
      return "BNS";
    default:
      return ""; // Default case, no selection
  }
};

const Sidebar = () => {
  const { user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("");
  const [openAccountModal, setOpenAccountModal] = useState(false);
  const [accountFormData, setAccountFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    sex: "",
    barangay: "",
  });
  const location = useLocation();
  const apiBaseUrl = "http://localhost:3000"; // Adjust this URL to your backend server's URL

  useEffect(() => {
    setSelected(determineActiveItem(location));
  }, [location]);

  useEffect(() => {
    if (user && user.user_id) {
      setAccountFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        password: "********",
        sex: user.sex || "",
        barangay: user.barangay || "",
      });
    }
  }, [user]);

  const handleAccountChange = (event) => {
    const { name, value } = event.target;
    setAccountFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAccountUpdate = async () => {
    try {
      const response = await axios.put(`${apiBaseUrl}/bns/manage-account`, {
        userId: user.user_id,
        ...accountFormData,
        password:
          accountFormData.password !== "********"
            ? accountFormData.password
            : undefined,
      });
      if (response.status === 200) {
        // Handle successful update
      }
    } catch (error) {
      // Handle update error
    } finally {
      setOpenAccountModal(false);
    }
  };

  return (
    <Box
      sx={{
        mt: 1,
        mb: 2,
        ml: 1,
        "& .pro-sidebar-inner": {
          background: "green !important",
          borderRadius: "10px",
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#ffeb3b!important",
        },
        "& .pro-menu-item.active": {
          color: "#ffeb3b !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: "white",
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                sx={{ width: "100%" }}
              >
                <IconButton
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  sx={{ color: "white" }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}
            {!isCollapsed && user && (
              <Typography variant="body1" sx={{ ml: 2, mt: 1, color: "white" }}>
                Welcome {user.role === "2" ? "BNS" : ""}, {user.lastName}
              </Typography>
            )}
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="60px"
                mt="30px"
              >
                <img
                  src="/assets/pol-logo.jpg"
                  alt="Logo"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                  }}
                />
              </Box>
            )}
          </MenuItem>

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <MenuItem
              onClick={() => setSelected("Dashboard")}
              active={selected === "Dashboard"}
              icon={<DataSaverOffOutlinedIcon />}
              style={{ color: "white" }}
            >
              <Link
                to="/app/dashboard"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Dashboard
              </Link>
            </MenuItem>

            <MenuItem
              onClick={() => setSelected("Activities")}
              active={selected === "Activities"}
              icon={<AddTaskOutlinedIcon />}
              style={{ color: "white" }}
            >
              <Link
                to="/app/activities"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Activities
              </Link>
            </MenuItem>

            <MenuItem
              onClick={() => setSelected("Reports")}
              active={selected === "Reports"}
              icon={<FileOpenOutlinedIcon />}
              style={{ color: "white" }}
            >
              <Link
                to="/app/reports"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Reports
              </Link>
            </MenuItem>

            <MenuItem
              onClick={() => setSelected("Beneficiaries")}
              active={selected === "Beneficiaries"}
              icon={<Diversity1OutlinedIcon />}
              style={{ color: "white" }}
            >
              <Link
                to="/app/beneficiaries"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Beneficiaries
              </Link>
            </MenuItem>
            <MenuItem
              onClick={() => setSelected("Archives")}
              active={selected === "Archives"}
              icon={<ArchiveOutlinedIcon />} // Use the Archive icon
              style={{ color: "white" }}
            >
              <Link
                to="/app/archives"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Archives
              </Link>
            </MenuItem>

            {user && user.role === "1" && (
              <>
                <MenuItem
                  onClick={() => setSelected("BNS")}
                  active={selected === "BNS"}
                  icon={<PeopleIcon />}
                  style={{ color: "white" }}
                >
                  <Link
                    to="/app/bns"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    BNS
                  </Link>
                </MenuItem>
                <MenuItem
                  onClick={() => setSelected("Calendar")}
                  active={selected === "Calendar"}
                  icon={<CalendarMonthOutlinedIcon />}
                  style={{ color: "white" }}
                >
                  <Link
                    to="/app/calendar"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    Events
                  </Link>
                </MenuItem>
              </>
            )}
            {user && user.role === "2" && (
              <MenuItem
                onClick={() => setSelected("Calendar")}
                active={selected === "Calendar"}
                icon={<CalendarMonthOutlinedIcon />}
                style={{ color: "white" }}
              >
                <Link
                  to="/app/calendar"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Events
                </Link>
              </MenuItem>
            )}
            <SubMenu
              title="Settings"
              icon={<SettingsIcon />}
              style={{ color: "white" }}
              open={selected === "Settings"}
              onOpenChange={() =>
                setSelected(selected === "Settings" ? "" : "Settings")
              }
            >
              {user && user.role === "1" && (
                <MenuItem
                  onClick={() => setSelected("Manage Beneficiary Types")}
                  active={selected === "Manage Beneficiary Types"}
                  icon={<CategoryIcon />}
                  style={{ color: "white" }}
                >
                  <Link
                    to="/app/viewtypes"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    Manage Beneficiary Types
                  </Link>
                </MenuItem>
              )}
              <MenuItem
                onClick={() => setOpenAccountModal(true)}
                active={selected === "Manage Account"}
                icon={<ManageAccountsIcon />}
                style={{ color: "white" }}
              >
                Manage Account
              </MenuItem>
            </SubMenu>
          </Box>
        </Menu>
        {!isCollapsed && (
          <Box
            sx={{
              mt: "auto",
              pb: 2,
              width: "100%",
            }}
          >
            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 2, color: "white" }}
            >
              Municipal Nutrition Office
            </Typography>
            <Divider
              sx={{
                my: 1,
                bgcolor: "white",
                width: "180px",
                alignSelf: "center",
                ml: 5,
              }}
            />
            <Typography variant="body2" align="center" sx={{ color: "white" }}>
              Polomolok South Cotabato
            </Typography>
          </Box>
        )}
      </ProSidebar>

      <Dialog
        open={openAccountModal}
        onClose={() => setOpenAccountModal(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Manage Account</DialogTitle>
        <DialogContent>
          {user.role === "1" && (
            <>
              <TextField
                autoFocus
                margin="dense"
                name="firstName"
                label="First Name"
                type="text"
                fullWidth
                value={accountFormData.firstName}
                onChange={handleAccountChange}
              />
              <TextField
                margin="dense"
                name="lastName"
                label="Last Name"
                type="text"
                fullWidth
                value={accountFormData.lastName}
                onChange={handleAccountChange}
              />
            </>
          )}
          <TextField
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            value={accountFormData.username}
            onChange={handleAccountChange}
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            value={accountFormData.password}
            onChange={handleAccountChange}
          />
          {user.role === "1" && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel>Sex</InputLabel>
                <Select
                  name="sex"
                  value={accountFormData.sex}
                  onChange={handleAccountChange}
                >
                  <MuiMenuItem value="Male">Male</MuiMenuItem>
                  <MuiMenuItem value="Female">Female</MuiMenuItem>
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                name="barangay"
                label="Barangay"
                type="text"
                fullWidth
                value={accountFormData.barangay}
                onChange={handleAccountChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAccountModal(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAccountUpdate} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

Item.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  selected: PropTypes.string.isRequired,
  setSelected: PropTypes.func.isRequired,
};

export default Sidebar;
