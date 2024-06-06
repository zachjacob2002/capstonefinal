import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";

// Helper function to convert month number to month name
const getMonthLabel = (monthValue) => {
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
  return months[parseInt(monthValue, 10) - 1];
};

const AllSubmissions = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportDetails, setReportDetails] = useState({});

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/newReports/report/${reportId}`
        );
        setReportDetails(response.data);
        console.log("Report Details:", response.data);
      } catch (error) {
        console.error("Error fetching report details:", error);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/newReports/${reportId}/submissions`
        );

        // Sort submissions so that those with a status other than "No submission" are at the top
        const sortedSubmissions = response.data.sort((a, b) => {
          if (a.status === "No submission" && b.status !== "No submission") {
            return 1;
          } else if (
            a.status !== "No submission" &&
            b.status === "No submission"
          ) {
            return -1;
          } else {
            return 0;
          }
        });

        setSubmissions(sortedSubmissions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReportDetails();
      fetchSubmissions();
    }
  }, [reportId]);

  const columns = [
    { field: "user_id", headerName: "ID", width: 90 },
    {
      field: "name",
      headerName: "Name",
      width: 300,
      valueGetter: (params) => `${params.row.firstName} ${params.row.lastName}`,
    },
    { field: "status", headerName: "Status", width: 150 },
  ];

  const handleRowClick = (params) => {
    if (params.row.hasSubmission) {
      navigate(
        `/app/bns-submission-page/${reportId}?userId=${params.row.user_id}`
      );
    }
  };

  const subtitle = `${reportDetails.type || ""} - ${
    reportDetails.month ? getMonthLabel(reportDetails.month) : ""
  } ${reportDetails.year || ""}`;

  return (
    <Box m={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="All BNS Reports" subtitle={subtitle} />
      </Box>
      <Box mt={2}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Submissions
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : submissions.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="60vh"
          >
            <Typography variant="h6" color="textSecondary">
              No submissions yet
            </Typography>
          </Box>
        ) : (
          <DataGrid
            rows={submissions}
            columns={columns}
            pageSize={10}
            autoHeight
            getRowId={(row) => row.user_id}
            onRowClick={handleRowClick}
            getRowClassName={(params) =>
              !params.row.hasSubmission ? "no-submission" : ""
            }
            sx={{
              "& .no-submission": {
                pointerEvents: "none",
                opacity: 0.6,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
              },
            }}
            columnVisibilityModel={{
              user_id: false,
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default AllSubmissions;
