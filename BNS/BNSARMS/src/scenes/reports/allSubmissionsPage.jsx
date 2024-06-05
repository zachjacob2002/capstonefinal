import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";

const AllSubmissions = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/newReports/${reportId}`
        );
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
        setSubmissions(response.data);
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
    { field: "type", headerName: "Type of Report", width: 200 },
    { field: "month", headerName: "Month", width: 150 },
    { field: "year", headerName: "Year", width: 150 },
  ];

  const handleRowClick = (params) => {
    navigate(
      `/app/bns-submission-page/${reportId}?userId=${params.row.user_id}`
    );
  };

  return (
    <Box m={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="All BNS Reports" subtitle="View BNS Reports" />
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
            columnVisibilityModel={{
              type: false,
              month: false,
              year: false,
            }}
            sx={{
              "& .MuiDataGrid-row": {
                bgcolor: "#e0f7e0",
                color: "green",
                fontWeight: "bold",
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: "lightGreen",
                },
                "&.Mui-selected, &.MuiDataGrid-row--selected": {
                  bgcolor: "rgba(50, 205, 50, 0.8)",
                },
              },
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "darkGreen",
                color: "white",
                fontSize: "1.1rem",
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default AllSubmissions;
