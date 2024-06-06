/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Typography,
  Badge,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import useAuthStore from "../../stores/authStore";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchorEl);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [newReports, setNewReports] = useState([]);
  const { user, logout } = useAuthStore();
  const apiBaseUrl = "http://localhost:3000"; // Adjust this URL to your backend server's URL

  const goBack = () => navigate(-1);

  useEffect(() => {
    const fetchNewReports = async () => {
    };

    fetchNewReports();
  }, []);

  useEffect(() => {
    if (user && user.user_id) {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get(`${apiBaseUrl}/notifications`, {
            params: { userId: user.user_id },
          });
          setNotifications(response.data);

        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      };
      fetchNotifications();
    }
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (event) => {
    setNotificationAnchorEl(event.currentTarget);

    try {
      await axios.patch(`${apiBaseUrl}/notifications/read`, {
        userId: user.user_id,
      });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
    //FOR DUE DAT HANDLING

    try {
      console.log("fethcing");
      const response = await axios.get(`${apiBaseUrl}/newReports`, {
        params: { isArchived: false },
      });
      const today = new Date();
      response.data.forEach(e => {
        const dueDate = new Date(e.dueDate);
        console.log();
        e.dueStatus = dueDate.getTime() < today.getTime() ? 2 : dueDate.getDate() === today.getDate() && dueDate.getTime() > today.getTime() ? 1 : 0
      });
      setNewReports(response.data);
      console.log(newReports);
    } catch (error) {
      console.error('Error fetching new reports:', error);
    }
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleDueDateClick = (id)=>{
    window.location.replace(`/app/bns-submission-page/${id}`);
  };

  const handleLogoutClick = () => {
    setOpenModal(true);
    handleClose();
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      setSnackbarMessage("Logout successful!");
      setSnackbarSeverity("success");
      navigate("/");
    } catch (error) {
      setSnackbarMessage("Logout failed!");
      setSnackbarSeverity("error");
    } finally {
      setOpenSnackbar(true);
      handleCloseModal();
    }
  };

  const handleClearNotifications = async () => {
    try {
      await axios.delete(`${apiBaseUrl}/notifications/clear`, {
        data: { userId: user.user_id },
      });
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const NotificationMenu = ({
    notifications,
    anchorEl,
    open,
    onClose,
    onClear,
  }) => (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      MenuListProps={{
        "aria-labelledby": "notification-button",
        sx: {
          width: 350, // Slightly wider to accommodate more content
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 0, // Remove padding around the list
        },
      }}
      transitionDuration={350} // Smooth transition for the menu
    >
      <Card sx={{ minWidth: 350 }}>
        <CardContent
          sx={{
            p: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" color="text.primary">
            Notifications
          </Typography>
          <Button size="small" onClick={onClear}>
            Clear
          </Button>
        </CardContent>
        <Divider />
        <List dense>
        {newReports.filter(report => report.dueStatus !== 0).map((report, index) => (
            <ListItem key={index} button onClick={() => handleDueDateClick(report.reportId)} style={{ backgroundColor: report.dueStatus === 1 ? 'yellow' : '#dd9595' }}>
              <ListItemIcon>
                <MailOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={report.dueStatus == 1 ? `You have a ${report.type} due today! Please comply.` : `Your ${report.type} is already due!`}
                secondary={`Due ${new Date(
                  report.dueDate
                ).toLocaleString()}`}
              />
            </ListItem>
          ))}
          
          {notifications.map((notification, index) => (
            <ListItem key={index} button onClick={onClose}>
              <ListItemIcon>
                <MailOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={notification.message}
                secondary={`Received ${new Date(
                  notification.createdAt
                ).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
        {notifications.length === 0 && (
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              No new notifications.
            </Typography>
          </CardContent>
        )}
      </Card>
    </Menu>
  );

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box
      className="topbar"
      display="flex"
      justifyContent="space-between"
      p={2}
      sx={{ backgroundColor: "green", m: 1, borderRadius: "10px" }}
    >
      <Box display="flex">
        <IconButton
          onClick={goBack}
          sx={{
            alignSelf: "flex-start",
            mr: 1,
            backgroundColor: "darkGreen",
            color: "white",
            "&:hover": { backgroundColor: "#8bc34a" },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Badge
          badgeContent={notifications.filter((n) => !n.read).length}
          color="error"
        >
          <IconButton
            onClick={handleNotificationClick}
            sx={{ color: "white", backgroundColor: "darkGreen" }}
          >
            <NotificationsOutlinedIcon />
          </IconButton>
        </Badge>
        <NotificationMenu
          notifications={notifications}
          anchorEl={notificationAnchorEl}
          open={notificationOpen}
          onClose={handleNotificationClose}
          onClear={handleClearNotifications}
        />

        <IconButton
          onClick={handleMenu}
          sx={{ color: "white", backgroundColor: "darkGreen", ml: 1 }}
        >
          <PersonOutlinedIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{ "aria-labelledby": "basic-button" }}
        >
          <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
        </Menu>
      </Box>
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmLogout} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Topbar;
