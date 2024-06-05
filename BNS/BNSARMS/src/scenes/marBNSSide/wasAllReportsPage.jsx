/* eslint-disable react/prop-types */
// wasAllReportsPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Card, Typography } from "@mui/material";
import Header from "../../components/Header";
import { allReportDetails } from "../../functions/reportSubmit";
import InfoIcon from "@mui/icons-material/Info";

const ReportDetail = ({ userName, reportStatus, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 2,
        margin: 1,
        borderRadius: 2,
        backgroundColor: "#4caf50", // Normal background color
        color: "white", // Sets the text color to white
        boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
        transition: "background-color 0.3s ease, box-shadow 0.3s ease", // Smooth transition for background color and shadow
        "&:hover": {
          backgroundColor: "#8bc34a", // Background color on hover
          boxShadow: "0px 4px 8px rgba(0,0,0,0.25)", // Increase shadow intensity on hover
          transform: "translateY(-1px)", // Subtle lift effect on hover
        },
      }}
    >
      <Typography variant="h6" sx={{ marginLeft: 2, color: "inherit" }}>
        {userName}
      </Typography>

      <Typography
        variant="h6"
        color="inherit" // Ensuring text color is white for better contrast
        sx={{ marginRight: 2 }}
      >
        {reportStatus}
      </Typography>
    </Card>
  );
};

const ReportsPage = () => {
  const { month, year } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  const fetchReports = useCallback(async () => {
    const response = await allReportDetails(
      month,
      year,
      "Work Activity Schedule Report"
    );
    console.log("Fetched reports:", response); // Debugging to check fetched data
    setReports(response || []);
  }, [month, year]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleReportClick = (reportId) => {
    if (!reportId) {
      console.error("Report ID is missing or invalid");
      return;
    }
    navigate(`/app/bns-submission-details/${reportId}`);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Header
        title="All Narrative Report Submissions"
        subtitle={`For the month of ${month} ${year}`}
      />
      {reports.length > 0 ? (
        reports.map((report, index) => (
          <ReportDetail
            key={report.reportId || index}
            userName={
              report.user
                ? `${report.user.firstName} ${report.user.lastName}`
                : "Unknown User"
            }
            reportStatus={report.status}
            reportId={report.reportId}
            onClick={() => handleReportClick(report.reportId)}
          />
        ))
      ) : (
        <Card
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 2,
            margin: "auto",
            marginTop: 4,
            width: "fit-content",
            borderRadius: 2,
            boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <InfoIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="h6">There are no submissions yet.</Typography>
        </Card>
      )}
    </Box>
  );
};

export default ReportsPage;
