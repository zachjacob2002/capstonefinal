// dashboard.jsx

import { Box, Divider } from "@mui/material";
import Header from "../../components/Header";
import MonthlyReportsCard from "./npcMonthlyReportsCard";
import MonthlyActivitiesCard from "./npcMonthlyActivitiesCard";
import BNSMonthlyReportsCard from "./bnsMonthlyReportsCard";
import BNSMonthlyActivitiesCard from "./bnsMonthlyActivitiesCard";

import useAuthStore from "../../stores/authStore"; // Import the useAuthStore hook

const Dashboard = () => {
  const { user } = useAuthStore(); // Get the user object from the store

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your Dashboard" />
      </Box>
      <Divider
        sx={{
          my: 1, // Margin top and bottom for the divider
          bgcolor: "white",
          color: "black",
          width: "1200px",
        }}
      />
      <Box
        display="flex"
        flexDirection="column" // Arrange items vertically
        justifyContent="center"
        alignItems="center"
        width="100%"
        marginTop="20px"
      >
        {user?.role === "1" && (
          <>
            <MonthlyReportsCard />
            <MonthlyActivitiesCard />
          </>
        )}
        {user?.role === "2" && (
          <>
            <BNSMonthlyReportsCard />
            <BNSMonthlyActivitiesCard />
          </>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
