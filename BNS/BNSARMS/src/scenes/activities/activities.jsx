/* eslint-disable no-undef */
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import ArchiveIcon from "@mui/icons-material/Archive";
import EditIcon from "@mui/icons-material/Edit";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import useActivityStore from "../../stores/useActivityStore";
import { fetchActivities, fetchAllUsers } from "../../functions/forActivities";
import useAuthStore from "../../stores/authStore";
import axios from "axios";

const Activities = () => {
  const navigate = useNavigate();
  const {
    activities,
    setActivities,
    removeActivity,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    closeSnackbar,
    setSnackbar,
  } = useActivityStore((state) => ({
    activities: state.activities,
    setActivities: state.setActivities,
    removeActivity: state.removeActivity,
    snackbarOpen: state.snackbarOpen,
    snackbarMessage: state.snackbarMessage,
    snackbarSeverity: state.snackbarSeverity,
    closeSnackbar: state.closeSnackbar,
    setSnackbar: state.setSnackbar,
  }));
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    String(currentDate.getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showAll, setShowAll] = useState(true);
  const [showSelectedUserActivities, setShowSelectedUserActivities] =
    useState(false); // New state for the second checkbox
  const { user } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState(""); // New state for selected user
  const [allUsers, setAllUsers] = useState([]); // New state for all users
  const [searchText, setSearchText] = useState(""); // State for search text
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [activityToArchive, setActivityToArchive] = useState(null);

  const months = [
    { label: "January", value: "01" },
    { label: "February", value: "02" },
    { label: "March", value: "03" },
    { label: "April", value: "04" },
    { label: "May", value: "05" },
    { label: "June", value: "06" },
    { label: "July", value: "07" },
    { label: "August", value: "08" },
    { label: "September", value: "09" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  const years = Array.from({ length: 71 }, (_, i) => 2005 + i);

  const handleOpenNewActivityForm = () => navigate("/app/activities/new");

  const handleOpenEditActivityForm = (activity) =>
    navigate("/app/activities/new", { state: { activity } });

  useEffect(() => {
    if (user && user.user_id) {
      const fetchAllActivities = async () => {
        const activitiesData = await fetchActivities(
          user.role === "1" ? null : user.user_id // Fetch all activities if user role is '1'
        );
        setActivities(
          activitiesData
            .map((activity) => ({
              ...activity,
              id: activity.activityId, // Ensure each activity has a unique id
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      };

      const fetchUsers = async () => {
        const usersData = await fetchAllUsers();
        setAllUsers(usersData);
      };

      fetchAllActivities();
      if (user.role === "1") fetchUsers(); // Fetch all users if user role is '1'
    }
  }, [setActivities, user]);

  const handleShowAllChange = (e) => {
    setShowAll(e.target.checked);
    if (e.target.checked) {
      setShowSelectedUserActivities(false);
    }
  };

  const handleShowSelectedUserActivitiesChange = (e) => {
    setShowSelectedUserActivities(e.target.checked);
    if (e.target.checked) {
      setShowAll(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleOpenArchiveDialog = (activityId) => {
    setActivityToArchive(activityId);
    setOpenArchiveDialog(true);
  };

  const handleCloseArchiveDialog = () => {
    setActivityToArchive(null);
    setOpenArchiveDialog(false);
  };

  const handleConfirmArchive = async () => {
    try {
      await axios.patch(
        `http://localhost:3000/activities/archive/${activityToArchive}`
      );
      removeActivity(activityToArchive); // Update the state immediately
      handleCloseArchiveDialog();
      setSnackbar("Activity successfully archived", "success");
    } catch (error) {
      console.error("Failed to archive activity:", error);
      setSnackbar("Failed to archive activity", "error");
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const searchRegex = new RegExp(searchText, "i");
    if (showAll) {
      return Object.values(activity).some((value) =>
        searchRegex.test(String(value))
      );
    }
    if (
      showSelectedUserActivities &&
      activity.createdBy === parseInt(selectedUser)
    ) {
      return Object.values(activity).some((value) =>
        searchRegex.test(String(value))
      );
    }
    const activityDate = new Date(activity.activityDate);
    const matchesMonth =
      selectedMonth === "" ||
      activityDate.getMonth() + 1 === parseInt(selectedMonth);
    const matchesYear = activityDate.getFullYear() === selectedYear;
    const matchesUser =
      selectedUser === "" || activity.createdBy === parseInt(selectedUser);
    const matchesSearch = Object.values(activity).some((value) =>
      searchRegex.test(String(value))
    );
    return matchesMonth && matchesYear && matchesUser && matchesSearch;
  });

  const formatDate = (date) => {
    const options = { month: "long", year: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const columns = [
    { field: "activityId", headerName: "ID", width: 90 },
    {
      field: "title",
      headerName: "Title",
      width: 500,
      renderCell: (params) => (
        <Box
          sx={{
            bgcolor: "#b2fab4", // Slightly darker green than the row color
            borderRadius: 2,
            p: 1,
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 300,
    },
    {
      field: "activityDate",
      headerName: "Date",
      width: 150,
      valueFormatter: (params) => formatDate(params.value),
      renderCell: (params) => (
        <Box
          sx={{
            bgcolor: "#FFE8C5", // Slightly darker green than the row color
            borderRadius: 2,
            p: 1,
          }}
        >
          {formatDate(params.value)}
        </Box>
      ),
    },
    {
      field: "numberOfBeneficiaries",
      headerName: "No. of Beneficiaries Involved",
      width: 300,
    },
  ];

  if (user.role !== "1") {
    columns.unshift({
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          key={`edit-${params.id}`}
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleOpenEditActivityForm(params.row)}
        />,
        <GridActionsCellItem
          key={`archive-${params.id}`}
          icon={<ArchiveIcon />}
          label="Archive"
          onClick={() => handleOpenArchiveDialog(params.row.activityId)}
        />,
      ],
    });
  }

  return (
    <Box m={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Activities" subtitle="View Your Activities" />
        <Box display="flex" alignItems="center">
          {user.role === "1" && (
            <FormControl
              variant="outlined"
              size="small"
              sx={{ mr: 2, minWidth: 200 }}
              disabled={showAll || showSelectedUserActivities}
            >
              <InputLabel id="select-user-label">Select BNS</InputLabel>
              <Select
                labelId="select-user-label"
                id="select-user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="Select User"
                sx={{ bgcolor: "background.paper" }}
              >
                {allUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {`${user.firstName} ${user.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl
            variant="outlined"
            size="small"
            sx={{ mr: 2, minWidth: 120 }}
            disabled={showAll || showSelectedUserActivities}
          >
            <InputLabel id="select-month-label">Select Month</InputLabel>
            <Select
              labelId="select-month-label"
              id="select-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Select Month"
              sx={{ bgcolor: "background.paper" }}
            >
              {months.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            variant="outlined"
            size="small"
            sx={{ mr: 2, minWidth: 120 }}
            disabled={showAll || showSelectedUserActivities}
          >
            <InputLabel id="select-year-label">Select Year</InputLabel>
            <Select
              labelId="select-year-label"
              id="select-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              label="Select Year"
              sx={{ bgcolor: "background.paper" }}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={showAll}
                onChange={handleShowAllChange}
                color="primary"
              />
            }
            label="Show All Activities"
          />
          {user.role === "1" && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={showSelectedUserActivities}
                  onChange={handleShowSelectedUserActivitiesChange}
                  color="primary"
                />
              }
              label="Show All Activities by Selected User"
            />
          )}
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchChange}
            sx={{ mr: 2 }}
          />
          {user.role !== "1" && ( // Conditionally render the Add New Activity button
            <Button
              variant="contained"
              onClick={handleOpenNewActivityForm}
              sx={{
                bgcolor: "green",
                "&:hover": {
                  backgroundColor: "green",
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.25)",
                },
              }}
            >
              Add New Activity
            </Button>
          )}
        </Box>
      </Box>
      <Box mt={2}>
        <DataGrid
          rows={filteredActivities}
          columns={columns}
          pageSize={10}
          autoHeight
          columnVisibilityModel={{
            activityId: false,
            numberOfBeneficiaries: false,
          }}
          getRowHeight={() => 70}
          sx={{
            "& .MuiDataGrid-row": {
              bgcolor: "#e0f7e0", // Much lighter green, close to white
              color: "green",
              fontWeight: "bold",
              fontSize: "1rem",
              "&:hover": {
                bgcolor: "lightGreen", // Slightly darker green on hover
              },
              "&.Mui-selected, &.MuiDataGrid-row--selected": {
                bgcolor: "rgba(50, 205, 50, 0.8)", // Slightly darker green on selection
              },
            },
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "darkGreen",
              color: "white",
              fontSize: "1.1rem", // Slightly larger font size for column headers
            },
          }}
          getRowId={(row) => row.id} // Ensure each row has a unique id
          onRowClick={(params) => navigate(`/app/activities/view/${params.id}`)}
        />
      </Box>
      <Dialog
        open={openArchiveDialog}
        onClose={handleCloseArchiveDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Archiving"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to archive this activity?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseArchiveDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmArchive} color="primary" autoFocus>
            Archive
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Activities;
