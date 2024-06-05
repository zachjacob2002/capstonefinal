import { Box, Stack } from "@mui/material";
import Header from "../../components/Header";
import BNSMonthlyAccomplishmentReport from "./bnsMonthlyAccomplishmentReport";
import NarrativeReport from "./narrativeReport";
import WASReport from "./wasReport";

import useAuthStore from "../../stores/authStore";

const Reports = () => {
  const { user } = useAuthStore();
  const isNPC = user && user.role == 1;
  // Log user object

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title={isNPC ? "BNS Reports" : "Your Reports"}
          subtitle={isNPC ? "Review BNS Reports" : "Your Reports"}
        />
      </Box>
      <Stack direction="row" spacing={2} sx={{ overflowX: "auto", mt: 3 }}>
        <BNSMonthlyAccomplishmentReport />
        <NarrativeReport />
        <WASReport />

        {/* Instantiate other report components as needed */}
      </Stack>
    </Box>
  );
};

export default Reports;
