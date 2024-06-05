import { Box, Button } from "@mui/material";
import Header from "../../components/Header";
import YearsSelection from "./narrativeYearsSelection";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const SelectYear = () => {
  const { userRole } = useParams();
  const isNPC = userRole === "npc";

  const [years, setYears] = useState(() => {
    const savedYears = localStorage.getItem("narrativeYears");
    return savedYears
      ? JSON.parse(savedYears)
      : ["2024", "2025", "2026", "2027"];
  });

  useEffect(() => {
    localStorage.setItem("narrativeYears", JSON.stringify(years));
  }, [years]);

  const handleAddYear = () => {
    const lastYear = parseInt(years[years.length - 1]);
    setYears([...years, (lastYear + 1).toString()]);
  };

  const handleDeleteYear = () => {
    if (years.length > 0) {
      setYears(years.slice(0, -1));
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title={
            isNPC ? "BNS Weekly Activity Schedule Reports" : "Your Reports"
          }
          subtitle={isNPC ? "Review BNS MAR" : "Your Reports"}
        />
        <Box display="flex" alignItems="center">
          {isNPC && (
            <Box>
              <Button
                variant="contained"
                sx={{ bgcolor: "Green", marginRight: 1 }}
                onClick={handleAddYear}
              >
                Add A Year
              </Button>
              <Button
                variant="contained"
                sx={{ bgcolor: "Red" }}
                onClick={handleDeleteYear}
              >
                Delete A Year
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          maxWidth: "100%",
          gap: 1,
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            boxShadow: "inset 0 0 5px grey",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "darkgrey",
            borderRadius: "10px",
          },
        }}
      >
        {years.map((year) => (
          <YearsSelection key={year} year={year} userRole={userRole} />
        ))}
      </Box>
    </Box>
  );
};

export default SelectYear;
