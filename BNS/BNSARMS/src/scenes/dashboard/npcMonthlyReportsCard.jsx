/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
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
  ListItemText,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

// Reusable component for each report
const ReportPaper = ({
  title,
  count,
  completedCount,
  totalCount,
  onClick,
  color,
  progressBarColor,
}) => {
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
        "&:hover": {
          boxShadow: "5px 0 15px rgba(0,0,0,0.2), -5px 0 15px rgba(0,0,0,0.2)",
        },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "pointer",
        backgroundColor: color, // Apply the background color
      }}
      onClick={onClick}
    >
      <Typography variant="h6" sx={{ color: "darkGreen", fontWeight: "bold" }}>
        {title}
      </Typography>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Typography
          variant="h1"
          sx={{ flexGrow: 1, color: "darkGreen", fontWeight: "bold" }}
        >
          {count}
        </Typography>
        <Box sx={{ position: "relative", display: "inline-flex", ml: 2 }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={60}
            thickness={5}
            sx={{ color: "#337f83", opacity: "50%" }} // Light grey background
          />
          <CircularProgress
            variant="determinate"
            value={progress}
            size={60}
            thickness={5}
            sx={{ color: progressBarColor, position: "absolute", left: 0 }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="caption" component="div" color="darkGreen">
              {`${Math.round(progress)}%`}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ my: 1, bgcolor: "green" }} />
      <Typography
        variant="body2"
        sx={{ cursor: "pointer", color: "darkGreen" }}
      >
        Click to View Details
      </Typography>
    </Paper>
  );
};

// Component for displaying recent reports
const RecentReportsPaper = ({ reports }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted":
        return "Orange"; // grey
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
        width: "100%",
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
            <Grid item xs={2}>
              <Typography variant="subtitle2">Name</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2">Type</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subtitle2">Report Date</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2">Submitted On</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subtitle2">Status</Typography>
            </Grid>
          </Grid>
        </ListItem>
        {reports.map((report) => (
          <ListItem key={report.id} sx={{ display: "flex" }}>
            <Grid container>
              <Grid item xs={2}>
                <ListItemText primary={report.name} />
              </Grid>
              <Grid item xs={3}>
                <ListItemText primary={report.type} />
              </Grid>
              <Grid item xs={2}>
                <ListItemText primary={report.monthYear} />
              </Grid>
              <Grid item xs={3}>
                <ListItemText
                  primary={new Date(report.submissionDate).toLocaleString(
                    "en-US",
                    {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}
                />
              </Grid>
              <Grid item xs={2}>
                <Box
                  sx={{
                    backgroundColor: getStatusColor(report.status),
                    borderRadius: 2,
                    padding: "4px 8px",
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  {report.status}
                </Box>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

// Component for displaying BNS count
const BNSCountPaper = ({ count }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        backgroundColor: "#689f38",
        borderRadius: 2,
        padding: "20px",
        margin: "10px",
        minWidth: "30%",
        height: "300px",
        boxShadow: "2px 0 10px rgba(0,0,0,0.1), -3px 0 10px rgba(0,0,0,0.1)",
        "&:hover": {
          boxShadow: "5px 0 15px rgba(0,0,0,0.2), -5px 0 15px rgba(0,0,0,0.2)",
        },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="h6" sx={{ color: "white" }}>
        Total Number of Barangay Nutrition Scholars
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexGrow: 1,
        }}
      >
        <Typography variant="h1" sx={{ fontSize: 100, mt: 2, color: "white" }}>
          {count}
        </Typography>
      </Box>
    </Paper>
  );
};

const MonthlyReportsCard = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // month is 0-indexed

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [recentReports, setRecentReports] = useState([]);
  const [bnsCount, setBNSCount] = useState(10); // Static BNS count
  const [reportCounts, setReportCounts] = useState({
    "Monthly Accomplishment Report": 0,
    "Narrative Report": 0,
    "Work Activity Schedule Report": 0,
  });

  const [completedCounts, setCompletedCounts] = useState({
    "Monthly Accomplishment Report": 0,
    "Narrative Report": 0,
    "Work Activity Schedule Report": 0,
  });

  const [statusCounts, setStatusCounts] = useState({});
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReportCounts = useCallback(
    async (type, year, month) => {
      try {
        const response = await axios.get(
          "http://localhost:3000/dashboard/report-count",
          {
            params: {
              type,
              year,
              month: month < 9 ? `0${month + 1}` : `${month + 1}`,
            },
          }
        );

        const { totalCount, statusDistribution } = response.data;

        setReportCounts((prevCounts) => ({
          ...prevCounts,
          [type]: totalCount,
        }));

        if (type === selectedReportType) {
          setStatusCounts(statusDistribution);
        }
      } catch (error) {
        console.error("Error fetching report count:", error);
        setReportCounts((prevCounts) => ({
          ...prevCounts,
          [type]: 0,
        }));
        if (type === selectedReportType) {
          setStatusCounts({});
        }
      }
    },
    [selectedReportType]
  );

  const fetchCompletedCounts = useCallback(async (type, year, month) => {
    try {
      const response = await axios.get(
        "http://localhost:3000/dashboard/recent-completed-reports",
        {
          params: {
            type,
            year,
            month: month < 9 ? `0${month + 1}` : `${month + 1}`,
          },
        }
      );

      setCompletedCounts((prevCounts) => ({
        ...prevCounts,
        [type]: response.data.completedCount,
      }));
    } catch (error) {
      console.error("Error fetching completed report count:", error);
      setCompletedCounts((prevCounts) => ({
        ...prevCounts,
        [type]: 0,
      }));
    }
  }, []);

  const handleReportPaperClick = useCallback(
    async (type) => {
      await fetchReportCounts(type, year, month);
      await fetchCompletedCounts(type, year, month);
      setSelectedReportType(type);
      setIsModalOpen(true);
    },
    [fetchReportCounts, fetchCompletedCounts, year, month]
  );

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

  useEffect(() => {
    const fetchBNSCount = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/dashboard/total-bns"
        );
        setBNSCount(response.data.count);
      } catch (error) {
        console.error("Error fetching BNS count:", error);
      }
    };

    const fetchAllReportCounts = async () => {
      await fetchReportCounts("Monthly Accomplishment Report", year, month);
      await fetchCompletedCounts("Monthly Accomplishment Report", year, month);
      await fetchReportCounts("Narrative Report", year, month);
      await fetchCompletedCounts("Narrative Report", year, month);
      await fetchReportCounts("Work Activity Schedule Report", year, month);
      await fetchCompletedCounts("Work Activity Schedule Report", year, month);
    };

    const fetchRecentReports = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/dashboard/recent-submissions"
        );
        setRecentReports(response.data);
      } catch (error) {
        console.error("Error fetching recent reports:", error);
      }
    };

    fetchBNSCount();
    fetchAllReportCounts();
    fetchRecentReports();
  }, [month, year, fetchReportCounts, fetchCompletedCounts]);

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
      <Typography>
        Barangay Nutrition Scholars Monthly Report Submissions
      </Typography>
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
          title="Monthly Accomplishment Reports"
          count={reportCounts["Monthly Accomplishment Report"]}
          completedCount={completedCounts["Monthly Accomplishment Report"]}
          totalCount={bnsCount}
          onClick={() =>
            handleReportPaperClick("Monthly Accomplishment Report")
          }
          color="#b2fab4"
          progressBarColor="Orange"
        />
        <ReportPaper
          title="Narrative Reports"
          count={reportCounts["Narrative Report"]}
          completedCount={completedCounts["Narrative Report"]}
          totalCount={bnsCount}
          onClick={() => handleReportPaperClick("Narrative Report")}
          color="lightBlue"
          progressBarColor="orange"
        />
        <ReportPaper
          title="WAS Reports"
          count={reportCounts["Work Activity Schedule Report"]}
          completedCount={completedCounts["Work Activity Schedule Report"]}
          totalCount={bnsCount}
          onClick={() =>
            handleReportPaperClick("Work Activity Schedule Report")
          }
          color="#ffdd72"
          progressBarColor="Orange"
        />
      </Box>
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>{selectedReportType} Status Distribution</DialogTitle>
        <DialogContent>
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            Total: {reportCounts[selectedReportType]}
          </Typography>
          <PieChart width={400} height={400}>
            <Pie
              data={[
                { name: "Submitted", value: statusCounts.Submitted || 0 },
                {
                  name: "Needs Revision",
                  value: statusCounts["Needs Revision"] || 0,
                },
                { name: "Completed", value: statusCounts.Completed || 0 },
              ]}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${value}`}
              labelStyle={{
                fill: "white",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              <Cell key="Submitted" fill="Orange" />
              <Cell key="Needs Revision" fill="#f44336" />
              <Cell key="Completed" fill="#00C49F" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
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
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        sx={{ mt: 1 }}
      >
        <RecentReportsPaper reports={recentReports} />
        <BNSCountPaper count={bnsCount} />
      </Box>
    </Card>
  );
};

export default MonthlyReportsCard;
