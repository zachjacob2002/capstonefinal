import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import dayjs from "dayjs";

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

const formatSubmissionDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("HH:mm A - MMMM, DD - YYYY");
};

const AllSubmissions = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportDetails, setReportDetails] = useState({});
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUser, setFilterUser] = useState("");

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

        const sortedSubmissions = response.data.sort((a, b) => {
          if (a.status === "No submission" && b.status !== "No submission") {
            return 1;
          } else if (
            a.status !== "No submission" &&
            b.status === "No submission"
          ) {
            return -1;
          } else if (a.lastName > b.lastName) {
            return 1;
          } else if (a.lastName < b.lastName) {
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

  const handleRowClick = (params) => {
    if (params.row.hasSubmission) {
      navigate(
        `/app/bns-submission-page/${reportId}?userId=${params.row.user_id}`
      );
    }
  };

  const filteredSubmissions = submissions
    .filter((submission) =>
      filterUser
        ? `${submission.firstName} ${submission.lastName}`.includes(filterUser)
        : true
    )
    .filter((submission) =>
      filterStatus ? submission.status === filterStatus : true
    );

  const columns = [
    { field: "user_id", headerName: "ID", width: 90 },
    { field: "lastName", headerName: "Last Name", width: 150 },
    { field: "firstName", headerName: "First Name", width: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        let color;
        switch (params.value) {
          case "Submitted":
            color = "orange";
            break;
          case "Needs Revision":
            color = "red";
            break;
          case "Completed":
            color = "green";
            break;
          default:
            color = "black";
        }
        return <span style={{ color }}>{params.value}</span>;
      },
    },
    {
      field: "submissionDate",
      headerName: "Submission Date",
      width: 200,
      valueGetter: (params) => {
        return params.row.status !== "No submission"
          ? formatSubmissionDate(params.row.submissionDate)
          : "";
      },
    },
  ];

  const subtitle = `${reportDetails.type || ""} - ${
    reportDetails.month ? getMonthLabel(reportDetails.month) : ""
  } ${reportDetails.year || ""}`;

  return (
    <Box m={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="All BNS Reports" subtitle={subtitle} />
      </Box>
      <Box mt={2} display="flex" alignItems="center">
        <FormControl variant="outlined" size="small" sx={{ width: "30%" }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="No submission">No submission</MenuItem>
            <MenuItem value="Submitted">Submitted</MenuItem>
            <MenuItem value="Needs Revision">Needs Revision</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
        <FormControl
          variant="outlined"
          size="small"
          sx={{ width: "30%", ml: 2 }}
        >
          <InputLabel>BNS</InputLabel>
          <Select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            label="User"
          >
            <MenuItem value="">All</MenuItem>
            {submissions.map((user) => (
              <MenuItem
                key={user.user_id}
                value={`${user.firstName} ${user.lastName}`}
              >
                {user.firstName} {user.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box mt={2}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Submissions
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : filteredSubmissions.length === 0 ? (
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
            rows={filteredSubmissions}
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
