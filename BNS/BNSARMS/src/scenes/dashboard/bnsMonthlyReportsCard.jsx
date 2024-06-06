/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import { useState, useEffect } from "react";
import {
  Card,
  Paper,
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Divider,
  List,
  ListItem,
  Grid,
} from "@mui/material";
import axios from "axios";
import useAuthStore from "../../stores/authStore";
import { useNavigate } from "react-router-dom";

// Function to get the color based on the status
const getStatusColor = (status) => {
  switch (status) {
    case "Submitted":
      return "darkOrange"; // grey
    case "Needs Revision":
      return "red"; // red
    case "Completed":
      return "#81c784"; // green
    default:
      return "#424242"; // default to grey
  }
};

// Reusable component for each report
const ReportPaper = ({ title, status, color }) => {
  const statusColor = getStatusColor(status);

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 4,
        padding: "20px",
        margin: "10px",
        minWidth: "30%",
        height: "150px",
        boxShadow: "2px 0 10px rgba(0,0,0,0.1), -3px 0 10px rgba(0,0,0,0.1)",

        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: color, // Apply the background color
      }}
    >
      <Typography variant="h6" sx={{ color: "darkGreen", fontWeight: "Bold" }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{ flexGrow: 1, color: "darkGreen", fontWeight: "bold" }}
        >
          {status}
        </Typography>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: statusColor,
            marginLeft: 1,
            mr: 2,
          }}
        />
      </Box>
      <Divider sx={{ my: 1, bgcolor: "green" }} />
    </Paper>
  );
};

const RecentReportsPaper = ({ reports }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted":
        return "orange"; // grey
      case "Needs Revision":
        return "#e57373"; // red
      case "Completed":
        return "#81c784"; // green
      default:
        return "#b0bec5"; // default to grey
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
        padding: "20px",
        margin: "10px",
        width: "98%",
        maxHeight: "300px",
        overflowY: "auto",
        boxShadow: "2px 0 10px rgba(0,0,0,0.1), -3px 0 10px rgba(0,0,0,0.1)",
        "&:hover": {
          boxShadow: "5px 0 15px rgba(0,0,0,0.2), -5px 0 15px rgba(0,0,0,0.2)",
        },
      }}
    >
      <List>
        <ListItem>
          <Grid container>
            <Grid item xs={3}>
              <Typography variant="subtitle2">Type</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subtitle2">Report Date</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2">Submission Date</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subtitle2">Status</Typography>
            </Grid>
          </Grid>
        </ListItem>

        {reports.map((report) => (
          <ListItem key={report.id}>
            <Grid container>
              <Grid item xs={3}>
                <Typography>{report.type}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>{report.monthYear}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography>
                  {new Date(report.submissionDate).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: getStatusColor(report.status),
                      marginRight: 1,
                    }}
                  />
                  <Typography>{report.status}</Typography>
                </Box>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

const BnsMonthlyReportCard = () => {
  const { user } = useAuthStore(); // Get the user object from the store
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // month is 0-indexed

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [reportStatus, setReportStatus] = useState({
    MAR: "No submission",
    Narrative: "No submission",
    WAS: "No submission",
  });
  const [recentReports, setRecentReports] = useState([]);

  const yearOptions = [];
  for (let i = currentYear; i <= 2050; i++) {
    yearOptions.push(
      <MenuItem key={i} value={i}>
        {i}
      </MenuItem>
    );
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthOptions = monthNames.map((name, index) => (
    <MenuItem key={index} value={index}>
      {name}
    </MenuItem>
  ));

  const convertMonthToNumber = (monthName) => {
    const monthIndex = monthNames.indexOf(monthName);
    return monthIndex >= 0 ? String(monthIndex + 1).padStart(2, "0") : "01";
  };

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const MARStatus = await axios.get(
          `http://localhost:3000/dashboard/user-report-status`,
          {
            params: {
              userId: user.user_id,
              type: "Monthly Accomplishment Report",
              year,
              month: convertMonthToNumber(monthNames[month]),
            },
          }
        );

        const NarrativeStatus = await axios.get(
          `http://localhost:3000/dashboard/user-report-status`,
          {
            params: {
              userId: user.user_id,
              type: "Narrative Report",
              year,
              month: convertMonthToNumber(monthNames[month]),
            },
          }
        );

        const WASStatus = await axios.get(
          `http://localhost:3000/dashboard/user-report-status`,
          {
            params: {
              userId: user.user_id,
              type: "Work Activity Schedule Report",
              year,
              month: convertMonthToNumber(monthNames[month]),
            },
          }
        );

        setReportStatus({
          MAR: MARStatus.data.status,
          Narrative: NarrativeStatus.data.status,
          WAS: WASStatus.data.status,
        });

        console.log("Report Statuses: ", {
          MAR: MARStatus.data.status,
          Narrative: NarrativeStatus.data.status,
          WAS: WASStatus.data.status,
        });
      } catch (error) {
        console.error("Failed to fetch report statuses:", error);
      }
    };

    const fetchReports = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/dashboard/user-recent-reports`,
          {
            params: { userId: user.user_id },
          }
        );
        setRecentReports(response.data);
      } catch (error) {
        console.error("Failed to fetch recent reports:", error);
      }
    };

    fetchStatuses();
    fetchReports();
  }, [user, year, month]);

  return (
    <Card
      style={{
        position: "relative",
        borderRadius: 12,
        borderColor: "green",
        padding: "20px",
        margin: "10px",
        boxShadow: "5px 0 10px rgba(0,0,0,0.1), -5px 0 10px rgba(0,0,0,0.1)",
        width: "100%",
      }}
    >
      <Typography>Your Monthly Reports Submissions</Typography>
      <Box position="absolute" top="10px" right="10px">
        <FormControl size="small">
          <Select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            displayEmpty
          >
            {monthOptions}
          </Select>
        </FormControl>
        <FormControl size="small" style={{ marginLeft: "10px" }}>
          <Select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            displayEmpty
          >
            {yearOptions}
          </Select>
        </FormControl>
      </Box>
      <Box
        display="flex"
        justifyContent="space-around"
        alignItems="center"
        sx={{ mt: 5 }}
      >
        <ReportPaper
          title="Monthly Accomplishment Report"
          status={reportStatus.MAR}
          color="#b2fab4"
        />
        <ReportPaper
          title="Narrative Report"
          status={reportStatus.Narrative}
          color="lightBlue"
        />
        <ReportPaper
          title="WAS Report"
          status={reportStatus.WAS}
          color="#ffdd72"
        />
      </Box>
      <Box justifyContent="center" sx={{ mt: 2 }}>
        <Divider
          sx={{
            my: 1, // Margin top and bottom for the divider
            bgcolor: "white",
            color: "black",
            width: "100%",
          }}
        />
      </Box>
      <Typography variant="h6" sx={{ mt: 1 }}>
        Recent Reports
      </Typography>
      <RecentReportsPaper reports={recentReports} />
    </Card>
  );
};

export default BnsMonthlyReportCard;
