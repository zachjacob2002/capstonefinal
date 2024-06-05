/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import RestoreIcon from "@mui/icons-material/Restore";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import Header from "../../components/Header";
import useAuthStore from "../../stores/authStore"; // Import the auth store
import { useSnackbar } from "../../context/SnackbarContext"; // Import the snackbar context

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};

const Archives = () => {
  const [value, setValue] = useState(0);
  const { user } = useAuthStore(); // Get the user object from the auth store
  const { showSnackbar } = useSnackbar(); // Get the snackbar function from context

  const [bnsData, setBnsData] = useState([]);
  const [beneficiariesData, setBeneficiariesData] = useState([]);
  const [activitiesData, setActivitiesData] = useState([]);
  const [reportsData, setReportsData] = useState([]);
  const [typesData, setTypesData] = useState([]); // State for archived beneficiary types
  const [eventsData, setEventsData] = useState([]); // State for archived events
  const [open, setOpen] = useState(false);
  const [restoreInfo, setRestoreInfo] = useState({ type: "", id: null });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bnsResponse = await axios.get(
          "http://localhost:3000/archives/bns?isArchived=true"
        );
        setBnsData(bnsResponse.data);

        const beneficiariesResponse = await axios.get(
          `http://localhost:3000/archives/beneficiaries?isArchived=true&role=${user.role}&barangay=${user.barangay}`
        );
        setBeneficiariesData(beneficiariesResponse.data);

        const activitiesResponse = await axios.get(
          `http://localhost:3000/archives/activities?isArchived=true&role=${user.role}&userId=${user.user_id}`
        );
        setActivitiesData(activitiesResponse.data);

        if (user.role === "1") {
          const reportsResponse = await axios.get(
            "http://localhost:3000/archives/reports?isArchived=true"
          );
          setReportsData(reportsResponse.data);

          // Fetch archived beneficiary types only if user.role is 1
          const typesResponse = await axios.get(
            "http://localhost:3000/archives/types?isArchived=true"
          );
          setTypesData(typesResponse.data);

          // Fetch archived events only if user.role is 1
          const eventsResponse = await axios.get(
            "http://localhost:3000/archives/events?isArchived=true"
          );
          setEventsData(eventsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [user.role, user.barangay, user.user_id]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleRestore = async () => {
    try {
      await axios.patch(
        `http://localhost:3000/archives/${restoreInfo.type}/restore/${restoreInfo.id}`
      );
      setOpen(false);
      showSnackbar("Item successfully restored", "success");
      setSnackbarMessage("Item successfully restored");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Fetch data again to refresh the state
      const fetchData = async () => {
        try {
          const bnsResponse = await axios.get(
            "http://localhost:3000/archives/bns?isArchived=true"
          );
          setBnsData(bnsResponse.data);

          const beneficiariesResponse = await axios.get(
            `http://localhost:3000/archives/beneficiaries?isArchived=true&role=${user.role}&barangay=${user.barangay}`
          );
          setBeneficiariesData(beneficiariesResponse.data);

          const activitiesResponse = await axios.get(
            `http://localhost:3000/archives/activities?isArchived=true&role=${user.role}&userId=${user.user_id}`
          );
          setActivitiesData(activitiesResponse.data);

          if (user.role === "1") {
            const reportsResponse = await axios.get(
              "http://localhost:3000/archives/reports?isArchived=true"
            );
            setReportsData(reportsResponse.data);

            const typesResponse = await axios.get(
              "http://localhost:3000/archives/types?isArchived=true"
            );
            setTypesData(typesResponse.data);

            const eventsResponse = await axios.get(
              "http://localhost:3000/archives/events?isArchived=true"
            );
            setEventsData(eventsResponse.data);
          }
        } catch (error) {
          console.error("Error fetching data", error);
        }
      };

      fetchData();
    } catch (error) {
      console.error("Error restoring item", error);
      showSnackbar("Failed to restore item", "error");
      setSnackbarMessage("Failed to restore item");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const formatDate = (date, format) => {
    return dayjs(date).format(format);
  };

  const bnsColumns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <GridActionsCellItem
          icon={<RestoreIcon />}
          label="Restore"
          onClick={() => {
            setRestoreInfo({ type: "bns", id: params.row.user_id });
            setOpen(true);
          }}
        />
      ),
    },
    { field: "user_id", headerName: "ID", width: 90 },
    { field: "firstName", headerName: "First name", width: 150 },
    { field: "lastName", headerName: "Last name", width: 150 },
    { field: "username", headerName: "Username", width: 150 },
    { field: "sex", headerName: "Sex", width: 110 },
    { field: "barangay", headerName: "Barangay", width: 150 },
    // Add other necessary fields here for BNS
  ];

  const beneficiariesColumns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <GridActionsCellItem
          icon={<RestoreIcon />}
          label="Restore"
          onClick={() => {
            setRestoreInfo({
              type: "beneficiaries",
              id: params.row.beneficiaryId,
            });
            setOpen(true);
          }}
        />
      ),
    },
    { field: "beneficiaryId", headerName: "ID", width: 90 },
    { field: "firstName", headerName: "First name", width: 150 },
    { field: "middleName", headerName: "Middle name", width: 150 },
    { field: "lastName", headerName: "Last name", width: 150 },
    { field: "suffix", headerName: "Suffix", width: 90 },
    {
      field: "birthdate",
      headerName: "Birthdate",
      width: 150,
      valueFormatter: (params) => formatDate(params.value, "MMMM-DD-YYYY"),
    },
    { field: "age", headerName: "Age", width: 90 },
    { field: "sex", headerName: "Sex", width: 110 },
    { field: "job", headerName: "Job", width: 150 },
    { field: "barangay", headerName: "Barangay", width: 150 },
    { field: "healthStation", headerName: "Health Station", width: 150 },
    { field: "primaryType", headerName: "Primary Type", width: 150 },
    { field: "civilStatus", headerName: "Civil Status", width: 150 },
    { field: "contactNumber", headerName: "Contact Number", width: 150 },
    { field: "beneficiaryTypes", headerName: "Beneficiary Types", width: 200 },
    // Add other necessary fields here for Beneficiaries
  ];

  const activitiesColumns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <GridActionsCellItem
          icon={<RestoreIcon />}
          label="Restore"
          onClick={() => {
            setRestoreInfo({ type: "activities", id: params.row.activityId });
            setOpen(true);
          }}
        />
      ),
    },
    { field: "activityId", headerName: "ID", width: 90 },
    { field: "title", headerName: "Title", width: 200 },
    { field: "description", headerName: "Description", width: 300 },
    {
      field: "activityDate",
      headerName: "Activity Date",
      width: 150,
      valueFormatter: (params) => formatDate(params.value, "MMMM-YYYY"),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 150,
      valueFormatter: (params) => formatDate(params.value, "MMMM-DD-YYYY"),
    },
    // Add other necessary fields here for Activities
  ];

  const reportsColumns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <GridActionsCellItem
          icon={<RestoreIcon />}
          label="Restore"
          onClick={() => {
            setRestoreInfo({ type: "reports", id: params.row.reportId });
            setOpen(true);
          }}
        />
      ),
    },
    { field: "reportId", headerName: "ID", width: 90 },
    { field: "type", headerName: "Type", width: 150 },
    { field: "month", headerName: "Month", width: 110 },
    { field: "year", headerName: "Year", width: 110 },
    {
      field: "submissionDate",
      headerName: "Submission Date",
      width: 150,
      valueFormatter: (params) =>
        formatDate(params.value, "MMMM-DD-YYYY hh:mm A"),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 150,
      valueFormatter: (params) =>
        formatDate(params.value, "MMMM-DD-YYYY hh:mm A"),
    },
    // Add other necessary fields here for Reports
  ];

  const typesColumns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <GridActionsCellItem
          icon={<RestoreIcon />}
          label="Restore"
          onClick={() => {
            setRestoreInfo({ type: "types", id: params.row.typeId });
            setOpen(true);
          }}
        />
      ),
    },
    { field: "typeId", headerName: "ID", width: 90 },
    { field: "typeName", headerName: "Type Name", width: 150 },
    { field: "typeCategory", headerName: "Type Category", width: 150 },
    {
      field: "primaryTypes",
      headerName: "Primary Type Referenced",
      width: 200,
      valueGetter: (params) =>
        params.row.primaryTypes.length > 0
          ? params.row.primaryTypes
              .map((pt) => pt.primaryType.typeName)
              .join(", ")
          : "N/A",
    },
    { field: "sex", headerName: "Sex", width: 120 },
    {
      field: "parentType",
      headerName: "Secondary Type Referenced",
      width: 150,
      valueGetter: (params) =>
        params.row.parentType ? params.row.parentType.typeName : "N/A",
    },
  ];

  const eventsColumns = [
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <GridActionsCellItem
          icon={<RestoreIcon />}
          label="Restore"
          onClick={() => {
            setRestoreInfo({ type: "events", id: params.row.eventId });
            setOpen(true);
          }}
        />
      ),
    },
    { field: "eventId", headerName: "ID", width: 90 },
    { field: "title", headerName: "Title", width: 200 },
    {
      field: "start",
      headerName: "Start Date",
      width: 150,
      valueFormatter: (params) =>
        formatDate(params.value, "MMMM-DD-YYYY hh:mm A"),
    },
    {
      field: "end",
      headerName: "End Date",
      width: 150,
      valueFormatter: (params) =>
        formatDate(params.value, "MMMM-DD-YYYY hh:mm A"),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 150,
      valueFormatter: (params) =>
        formatDate(params.value, "MMMM-DD-YYYY hh:mm A"),
    },
  ];

  return (
    <Box m={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Archives" subtitle="View Archives" />
      </Box>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="simple tabs example"
        sx={{
          // Change background color of tabs to pale green
          "& .MuiTabs-indicator": {
            backgroundColor: "darkgreen", // Change indicator color to dark green
            height: 4, // Make the indicator slightly thicker
          },
          "& .MuiTab-root": {
            color: "darkgreen", // Change label colors to dark green
            fontWeight: "bold",
          },
        }}
      >
        {user.role === "1" && <Tab label="BNS" />}
        <Tab label="Beneficiaries" />
        <Tab label="Activities" />
        {user.role === "1" && <Tab label="Reports" />}
        {user.role === "1" && <Tab label="Beneficiary Types" />}
        {user.role === "1" && <Tab label="Events" />}
      </Tabs>
      {user.role === "1" && (
        <TabPanel value={value} index={0}>
          <DataGrid
            rows={bnsData}
            columns={bnsColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) => row.user_id} // Specify the custom row ID
          />
        </TabPanel>
      )}
      <TabPanel value={value} index={user.role === "1" ? 1 : 0}>
        <DataGrid
          rows={beneficiariesData}
          columns={beneficiariesColumns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowId={(row) => row.beneficiaryId} // Specify the custom row ID
        />
      </TabPanel>
      <TabPanel value={value} index={user.role === "1" ? 2 : 1}>
        <DataGrid
          rows={activitiesData}
          columns={activitiesColumns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowId={(row) => row.activityId} // Specify the custom row ID
        />
      </TabPanel>
      {user.role === "1" && (
        <TabPanel value={value} index={3}>
          <DataGrid
            rows={reportsData}
            columns={reportsColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) => row.reportId} // Specify the custom row ID
          />
        </TabPanel>
      )}
      {user.role === "1" && (
        <TabPanel value={value} index={4}>
          <DataGrid
            rows={typesData}
            columns={typesColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) => row.typeId} // Specify the custom row ID
          />
        </TabPanel>
      )}
      {user.role === "1" && (
        <TabPanel value={value} index={5}>
          <DataGrid
            rows={eventsData}
            columns={eventsColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) => row.eventId} // Specify the custom row ID
          />
        </TabPanel>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Restore Item"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to restore this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRestore} color="primary" autoFocus>
            Restore
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Archives;
