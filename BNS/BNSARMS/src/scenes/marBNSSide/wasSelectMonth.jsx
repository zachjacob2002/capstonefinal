import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import WASMonthsSelection from "./wasMonthsSelection";
import { useEffect } from "react";
// import useAuthStore from "../../stores/authStore";

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

const SelectMonth = () => {
  const { year, userRole } = useParams();
  // const { user } = useAuthStore(); // This might be used if additional user details are necessary
  const isNPC = userRole === "npc"; // Get userRole from the route parameters

  useEffect(() => {
    const roleMessage = isNPC
      ? "This is the page for the NPC"
      : "This is the page for the BNS";
    console.log(`${roleMessage} for the year ${year}`);
  }, [year, isNPC]);

  return (
    <Box m="20px">
      <Header
        title={
          isNPC ? `BNS WAS Reports for ${year}` : `Your WAS Reports for ${year}`
        }
        subtitle={isNPC ? "Review BNS MAR" : "Your Reports"}
      />

      <Box
        sx={{ display: "flex", flexWrap: "wrap", gap: 1, overflowX: "auto" }}
      >
        {months.map((month) => (
          <WASMonthsSelection
            key={month}
            month={month}
            year={year}
            isNPC={isNPC}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SelectMonth;
