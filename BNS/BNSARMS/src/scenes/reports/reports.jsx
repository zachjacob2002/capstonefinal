import axios from "axios";
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
  Modal,
  TextField,
  Typography,
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
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { useSnackbar } from "../../context/SnackbarContext";

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showSnackbar } = useSnackbar();
  const currentDate = new Date();
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    String(currentDate.getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showAll, setShowAll] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [showOtherTypeField, setShowOtherTypeField] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isAddDisabled, setIsAddDisabled] = useState(false);
  const nextMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    5,
    23,
    59
  );
  const [newReport, setNewReport] = useState({
    type: "",
    month: String(currentDate.getMonth() + 1).padStart(2, "0"),
    year: currentDate.getFullYear(),
    dueDate: nextMonth.toISOString().slice(0, 16),
    otherType: "",
  });
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [reportToArchive, setReportToArchive] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

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

  const years = Array.from({ length: 58 }, (_, i) => 2023 + i);

  const fetchReports = async () => {
    try {
      const response = await axios.get("http://localhost:3000/newReports", {
        params: { isArchived: false },
      });
      const uniqueReports = response.data.reduce((acc, report) => {
        const key = `${report.type}-${report.year}-${report.month}`;
        if (
          !acc[key] ||
          new Date(report.submissionDate) < new Date(acc[key].submissionDate)
        ) {
          acc[key] = report;
        }
        return acc;
      }, {});

      setReports(
        Object.values(uniqueReports)
          .map((report) => ({
            ...report,
            id: report.reportId,
          }))
          .sort(
            (a, b) => new Date(b.submissionDate) - new Date(a.submissionDate)
          )
      );
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  useEffect(() => {
    if (user && user.user_id) {
      fetchReports();
    }
  }, [user]);

  const handleShowAllChange = (e) => {
    setShowAll(e.target.checked);
  };

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => {
    setModalOpen(false);
    setShowOtherTypeField(false);
    setWarningMessage("");
    setIsAddDisabled(false);
  };

  const checkForDuplicateReport = async (type, month, year) => {
    try {
      // Ensure type and month are strings and year is an integer
      if (
        typeof type !== "string" ||
        typeof month !== "string" ||
        isNaN(parseInt(year))
      ) {
        console.error(
          "Invalid input types. Type and month should be strings, year should be an integer."
        );
        return;
      }

      const params = { type, month, year: parseInt(year) };
      console.log(
        "Checking for duplicate report with parameters:",
        JSON.stringify(params, null, 2)
      ); // Log the parameters in structured format

      const response = await axios.get(
        "http://localhost:3000/newReports/duplicates",
        {
          params,
        }
      );

      console.log(
        "Duplicate check response:",
        JSON.stringify(response.data, null, 2)
      ); // Log the response in structured format

      if (response.data.length > 0) {
        setWarningMessage("This Report already exists");
        setIsAddDisabled(true);
      } else {
        setWarningMessage("");
        setIsAddDisabled(false);
      }
    } catch (error) {
      console.error("Error checking for duplicate report:", error);

      // Log detailed error information
      console.error(
        "Error details:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleNewReportChange = (e) => {
    const { name, value } = e.target;

    setNewReport((prevReport) => {
      const updatedReport = {
        ...prevReport,
        [name]: value,
      };

      // Log the updated report
      console.log(
        "Updated report parameters:",
        JSON.stringify(updatedReport, null, 2)
      );

      if (name === "type" && value === "Other") {
        setShowOtherTypeField(true);
      } else if (name === "type") {
        setShowOtherTypeField(false);
        checkForDuplicateReport(value, updatedReport.month, updatedReport.year);
      } else if (name === "month" || name === "year") {
        checkForDuplicateReport(
          updatedReport.type,
          name === "month" ? value : updatedReport.month,
          name === "year" ? value : updatedReport.year
        );
      } else {
        checkForDuplicateReport(
          updatedReport.type,
          updatedReport.month,
          updatedReport.year
        );
      }

      return updatedReport;
    });
  };

  const handleAddNewReport = async () => {
    try {
      const reportType =
        newReport.type === "Other" ? newReport.otherType : newReport.type;
      const response = await axios.post("http://localhost:3000/newReports", {
        ...newReport,
        type: reportType,
        userId: user.user_id,
      });
      setReports((prevReports) => [
        {
          ...response.data,
          id: response.data.reportId,
        },
        ...prevReports,
      ]);
      handleModalClose();
      setSnackbarMessage("Report successfully created");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error adding new report:", error);
      setSnackbarMessage("Failed to create report");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleOpenArchiveDialog = (reportId) => {
    setReportToArchive(reportId);
    setOpenArchiveDialog(true);
  };

  const handleCloseArchiveDialog = () => {
    setReportToArchive(null);
    setOpenArchiveDialog(false);
  };

  const handleConfirmArchive = async () => {
    try {
      await axios.patch(
        `http://localhost:3000/newReports/archive/${reportToArchive}`
      );
      setReports((prevReports) =>
        prevReports.filter((report) => report.reportId !== reportToArchive)
      );
      showSnackbar("Report successfully archived", "success");
      handleCloseArchiveDialog();
    } catch (error) {
      console.error("Failed to archive report:", error);
      showSnackbar("Failed to archive report", "error");
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesMonth = selectedMonth === "" || report.month === selectedMonth;
    const matchesYear = selectedYear === "" || report.year === selectedYear;
    const matchesSearchQuery =
      searchQuery === "" ||
      Object.values(report).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (showAll) {
      return matchesSearchQuery;
    } else {
      return matchesMonth && matchesYear && matchesSearchQuery;
    }
  });

  const formatDate = (date) => {
    const options = {
      month: "long",
      day: "numeric", // Include day in the formatted date
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const getMonthLabel = (monthValue) => {
    const month = months.find((m) => m.value === monthValue);
    return month ? month.label : monthValue;
  };

  const columns = [
    { field: "reportId", headerName: "ID", width: 90 },
    {
      field: "type",
      headerName: "Type",
      width: 400,
      renderCell: (params) => <Box>{params.value}</Box>,
    },
    {
      field: "month",
      headerName: "Month",
      width: 150,
      valueFormatter: (params) => getMonthLabel(params.value),
    },
    {
      field: "year",
      headerName: "Year",
      width: 150,
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 300,
      valueFormatter: (params) => formatDate(params.value),
      renderCell: (params) => <Box>{formatDate(params.value)}</Box>,
    },
  ];

  if (user.role === "1") {
    columns.unshift({
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key={`archive-${params.id}`}
          icon={<ArchiveIcon />}
          label="Archive"
          onClick={() => handleOpenArchiveDialog(params.row.reportId)}
        />,
      ],
    });
  }

  const handleRowClick = (params) => {
    if (user.role === "1") {
      navigate(`/app/allsubmissions/${params.id}`);
    } else {
      navigate(`/app/bns-submission-page/${params.id}`);
    }
  };

  return (
    <Box m={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Reports" subtitle="View Reports" />
        <Box display="flex" alignItems="center">
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mr: 2 }}
          />
          <FormControl
            variant="outlined"
            size="small"
            sx={{ mr: 2, minWidth: 120 }}
            disabled={showAll}
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
            disabled={showAll}
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
            label="Show All Reports"
          />
          {user.role !== "2" && (
            <Button
              variant="contained"
              onClick={handleModalOpen}
              sx={{
                bgcolor: "green",
                "&:hover": {
                  backgroundColor: "green",
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.25)",
                },
              }}
            >
              Add New Report
            </Button>
          )}
        </Box>
      </Box>
      <Box mt={2}>
        <DataGrid
          rows={filteredReports}
          columns={columns}
          pageSize={10}
          autoHeight
          columnVisibilityModel={{
            reportId: false,
          }}
          getRowId={(row) => row.reportId}
          getRowHeight={() => 70}
          onRowClick={handleRowClick}
        />
      </Box>

      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <h2>Add New Report</h2>
          {warningMessage && (
            <Typography color="error" variant="body2" gutterBottom>
              {warningMessage}
            </Typography>
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-type-label">Report Type</InputLabel>
            <Select
              labelId="select-type-label"
              name="type"
              value={newReport.type}
              onChange={handleNewReportChange}
              label="Report Type"
            >
              <MenuItem value="Monthly Accomplishment Report">
                Monthly Accomplishment Report
              </MenuItem>
              <MenuItem value="Narrative Report">Narrative Report</MenuItem>
              <MenuItem value="Work Activity Schedule Report">
                Work Activity Schedule Report
              </MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          {showOtherTypeField && (
            <TextField
              fullWidth
              margin="normal"
              label="Other Report Type"
              name="otherType"
              value={newReport.otherType}
              onChange={handleNewReportChange}
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-month-modal-label">Month</InputLabel>
            <Select
              labelId="select-month-modal-label"
              name="month"
              value={newReport.month}
              onChange={handleNewReportChange}
            >
              {months.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-year-modal-label">Year</InputLabel>
            <Select
              labelId="select-year-modal-label"
              name="year"
              value={newReport.year}
              onChange={handleNewReportChange}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Due Date"
            type="datetime-local"
            name="dueDate"
            value={newReport.dueDate}
            onChange={handleNewReportChange}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddNewReport}
              disabled={isAddDisabled}
            >
              Add Report
            </Button>
          </Box>
        </Box>
      </Modal>

      <Dialog
        open={openArchiveDialog}
        onClose={handleCloseArchiveDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Archiving"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to archive this report?
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

export default Reports;
