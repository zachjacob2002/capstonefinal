/* eslint-disable react/prop-types */
// npcMonthlyActivitiesCard.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Paper,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  Card,
  Divider,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import axios from "axios";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";
import Diversity1OutlinedIcon from "@mui/icons-material/Diversity1Outlined";

const ActivityPaper = ({ title, count, icon: Icon, iconColor }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
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
      }}
    >
      <Typography variant="h6" sx={{ color: "Grey" }}>
        {title}
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h1">{count}</Typography>
        <Icon sx={{ color: iconColor, marginLeft: 1, fontSize: 40 }} />
      </Box>
    </Paper>
  );
};

const MonthlyActivityChartPaper = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [activitiesData, setActivitiesData] = useState([]);

  const fetchActivitiesCountByYear = useCallback(async (year) => {
    try {
      const response = await axios.get(
        "http://localhost:3000/dashboard/activities-count-by-month",
        {
          params: { year },
        }
      );
      setActivitiesData(response.data);
    } catch (error) {
      console.error("Error fetching activities count by year:", error);
    }
  }, []);

  useEffect(() => {
    fetchActivitiesCountByYear(year);
  }, [year, fetchActivitiesCountByYear]);

  const yearOptions = [];
  for (let i = currentYear; i <= 2075; i++) {
    yearOptions.push(
      <MenuItem key={i} value={i}>
        {i}
      </MenuItem>
    );
  }

  const months = [
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

  const data = months.map((month, index) => {
    const monthData = activitiesData.find(
      (item) => item.month === index + 1
    ) || { count: 0 };
    return {
      name: month,
      Activities: monthData.count,
    };
  });

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
        padding: "20px",
        margin: "10px",
        width: "70%",
        height: "400px", // Set height to accommodate the chart
        boxShadow: "2px 0 10px rgba(0,0,0,0.1), -3px 0 10px rgba(0,0,0,0.1)",
        "&:hover": {
          boxShadow: "5px 0 15px rgba(0,0,0,0.2), -5px 0 15px rgba(0,0,0,0.2)",
        },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <FormControl size="small" sx={{ mb: 2 }}>
        <Select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          displayEmpty
        >
          {yearOptions}
        </Select>
      </FormControl>
      <Typography>Total Number of Activities Conducted Every Month</Typography>

      {activitiesData.length > 0 ? (
        <BarChart
          width={800} // Adjust width to fit the Paper component
          height={300} // Adjust height to fit the Paper component
          data={data}
          margin={{
            top: 5,
            right: 35,
            left: 5,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Activities" fill="#82ca9d" />
        </BarChart>
      ) : (
        <Typography variant="h6">No activities created</Typography>
      )}
    </Paper>
  );
};

const MonthlyActivitiesCard = () => {
  const [beneficiariesCount, setBeneficiariesCount] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);

  const fetchBeneficiariesCount = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/dashboard/total-beneficiaries"
      );
      setBeneficiariesCount(response.data.totalBeneficiaries);
    } catch (error) {
      console.error("Error fetching beneficiaries count:", error);
    }
  }, []);

  const fetchTotalActivities = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/dashboard/total-activities"
      );
      setTotalActivities(response.data.totalActivities);
    } catch (error) {
      console.error("Error fetching total activities count:", error);
    }
  }, []);

  useEffect(() => {
    fetchBeneficiariesCount();
    fetchTotalActivities();
  }, [fetchBeneficiariesCount, fetchTotalActivities]);

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
      <Typography>BNS Monthly Activities</Typography>
      <Box display="flex" justifyContent="space-around" alignItems="center">
        <MonthlyActivityChartPaper />
        <Box>
          <ActivityPaper
            title="Total Activities This Year"
            count={totalActivities}
            icon={AddTaskOutlinedIcon}
            iconColor="#ffa726"
          />
          <ActivityPaper
            title="Total Number of Beneficiaries"
            count={beneficiariesCount}
            icon={Diversity1OutlinedIcon}
            iconColor="#9ccc65"
          />
        </Box>
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
    </Card>
  );
};

export default MonthlyActivitiesCard;
