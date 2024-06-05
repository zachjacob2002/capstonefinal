// src/scenes/reports/MonthlyAccomplishmentReport.jsx
import { Card, CardActionArea, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore"; // Import the auth store to access user information

const MonthlyAccomplishmentReport = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userRole = user && user.role == 1 ? "npc" : "bns";

  const handleCardClick = () => {
    navigate(`/app/was-select-year/${userRole}`); // Navigate with the role parameter
  };

  return (
    <Card
      sx={{
        width: 345,
        height: 160,
        m: 1,
        boxShadow: "none",
        border: 2,
        borderColor: "#273377",
        borderRadius: "22px 22px 16px 16px",
        "&:hover": {
          boxShadow: 2,
        },
      }}
    >
      <CardActionArea
        onClick={handleCardClick}
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            display: "flex-start",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: 115,
            p: 2,
            backgroundColor: "#273377",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            borderRadius: "19px 19px 0 0",
          }}
        >
          <Typography
            variant="h5"
            color="common.white"
            noWrap
            sx={{ fontSize: 20 }}
          >
            Work Activity Schedule Report
          </Typography>
        </Box>
        <Box
          sx={{
            height: "50%",
            width: "100%",
            flexGrow: 1,
            p: 2,
            display: "flex-start",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.paper",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <Typography sx={{ fontSize: 14 }}>
            View Work Activity Schedule Reports
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default MonthlyAccomplishmentReport;
