/* eslint-disable react/prop-types */
// Import necessary components from MUI
import { Card, Typography, CardActionArea } from "@mui/material";

const ReportDetail = ({ userName, reportStatus, reportId, onClick }) => {
  return (
    <Card
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 2,
        margin: 1,
        borderRadius: 2,
        boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
        "&:hover": {
          boxShadow: "0px 4px 8px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" sx={{ marginLeft: 2 }}>
          {userName}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginRight: 2 }}
        >
          ID: {reportId} {/* Display report ID */}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ marginRight: 2 }}>
          {reportStatus}
        </Typography>
      </CardActionArea>
    </Card>
  );
};

export default ReportDetail;
