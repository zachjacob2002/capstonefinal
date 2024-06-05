/* eslint-disable react/prop-types */
import { Card, CardActionArea, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const currentYear = new Date().getFullYear();

const YearsSelection = ({ year, userRole }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (parseInt(year) <= currentYear) {
      navigate(`/app/was-select-month/${year}/${userRole}`); // Include userRole in the path
    }
  };

  return (
    <Card
      sx={{
        width: 315,
        height: 115,
        m: 1,
        boxShadow: "none",
        border: 2,
        borderColor: "#273377",
        borderRadius: "22px 22px 16px 16px",
        "&:hover": {
          boxShadow: parseInt(year) <= currentYear ? 2 : "none",
        },
        opacity: parseInt(year) > currentYear ? 0.5 : 1,
        pointerEvents: parseInt(year) > currentYear ? "none" : "auto",
      }}
    >
      <CardActionArea
        onClick={handleCardClick}
        disabled={parseInt(year) > currentYear}
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: 115,
            p: 2,
            backgroundColor: parseInt(year) <= currentYear ? "#273377" : "grey",
            borderRadius: "19px 19px 0 0",
          }}
        >
          <Typography
            variant="h5"
            color="common.white"
            noWrap
            sx={{ fontSize: 20 }}
          >
            {year}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default YearsSelection;
