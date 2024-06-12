/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Stack, TextField, Button } from "@mui/material";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { DataGrid } from "@mui/x-data-grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import useActivityStore from "../../stores/useActivityStore";
import useAuthStore from "../../stores/authStore";
import TargetBeneficiariesModal from "./targetBeneficiariesModal";
import DocumentationModal from "./documentationModal"; // Import the new modal
import {
  fetchActivityParticipations,
  markAsAttended,
} from "../../functions/forParticipation";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useSnackbar } from "../../context/SnackbarContext"; // Import useSnackbar
import axios from "axios";

const ViewActivity = () => {
  const { user } = useAuthStore();
  const { activityId } = useParams();
  const activity = useActivityStore((state) =>
    state.activities.find((a) => a.id === Number(activityId))
  );
  const { updateActivity } = useActivityStore();

  const [open, setOpen] = useState(false);
  const [openDocumentationModal, setOpenDocumentationModal] = useState(false); // State for documentation modal
  const [participations, setParticipations] = useState([]);
  const [filteredParticipations, setFilteredParticipations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [allTypes, setAllTypes] = useState([]);

  const { showSnackbar } = useSnackbar(); // Use useSnackbar

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenDocumentationModal = () => setOpenDocumentationModal(true); // Open documentation modal
  const handleCloseDocumentationModal = () => setOpenDocumentationModal(false); // Close documentation modal

  const refreshParticipations = async () => {
    if (activityId) {
      const data = await fetchActivityParticipations(activityId);
      setParticipations(data);
      updateActivity({ ...activity, participations: data });
    }
  };

  useEffect(() => {
    refreshParticipations();
  }, [activityId]);

  useEffect(() => {
    const lowercasedFilter = searchText.toLowerCase();
    const filteredData = participations.filter((item) =>
      Object.keys(item).some((key) =>
        String(item[key]).toLowerCase().includes(lowercasedFilter)
      )
    );
    setFilteredParticipations(filteredData);
  }, [searchText, participations]);

  useEffect(() => {
    const sortedParticipations = [...participations].sort(
      (a, b) => b.attended - a.attended
    );
    setFilteredParticipations(sortedParticipations);
  }, [participations]);

  useEffect(() => {
    const fetchAllTypes = async () => {
      try {
        const response = await axios.get("http://localhost:3000/types");
        setAllTypes(response.data);
      } catch (error) {
        console.error("Failed to fetch all types:", error);
      }
    };

    fetchAllTypes();
  }, []);

  const formatBirthdate = (date) => {
    return dayjs(date).format("MMMM - DD - YYYY");
  };

  const calculateAge = (birthdate) => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    const diff = today - birthDate;

    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    const months = Math.floor(
      (diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.4375)
    );
    const weeks = Math.floor(
      (diff % (1000 * 60 * 60 * 24 * 30.4375)) / (1000 * 60 * 60 * 24 * 7)
    );

    return `${years} years\n${months} months\n${weeks} weeks old`;
  };

  if (!activity) return <Typography>Activity not found.</Typography>;

  const displayDate = dayjs(activity.activityDate).format("MMMM - YYYY");

  const typeColumns = allTypes.map((type) => ({
    field: type.typeName,
    headerName: `${type.typeName}?`,
    width: 150,
    renderCell: (params) => {
      const value = params.row.beneficiaryTypes.includes(type.typeName)
        ? type.typeName
        : "No";
      console.log(`Value for ${type.typeName}:`, value); // Log the value for each type column
      return <div style={{ whiteSpace: "pre-wrap" }}>{value}</div>;
    },
  }));

  const columns = [
    {
      field: "attended",
      headerName: "Attended?",
      width: 90,
      renderCell: (params) =>
        params.value ? (
          <CheckCircleIcon style={{ color: "green" }} />
        ) : (
          <DoNotDisturbOnIcon style={{ color: "darkGrey" }} />
        ),
    },
    { field: "beneficiaryId", headerName: "ID", width: 90 },
    { field: "beneficiaryFirstName", headerName: "First Name", width: 150 },
    { field: "beneficiaryMiddleName", headerName: "Middle Name", width: 150 },
    { field: "beneficiaryLastName", headerName: "Last Name", width: 150 },
    { field: "beneficiarySuffix", headerName: "Suffix", width: 90 },
    { field: "beneficiaryAgeGroup", headerName: "Age Group", width: 150 },
    { field: "beneficiaryJob", headerName: "Job", width: 150 },
    { field: "beneficiaryBarangay", headerName: "Barangay", width: 150 },
    {
      field: "beneficiaryHealthStation",
      headerName: "Health Station",
      width: 150,
    },
    ...typeColumns,
    { field: "beneficiarySubType", headerName: "Subtype", width: 200 },
  ];

  const handleSelectionModelChange = (newSelectionModel) => {
    const selectedData = newSelectionModel.map((id) =>
      participations.find((row) => row.beneficiaryId === id)
    );

    setSelectedRows(
      selectedData
        .filter((row) => !row.attended)
        .map((row) => row.beneficiaryId)
    );
    console.log("Selected Rows:", selectedData); // Log the selected beneficiary data
  };

  const handleMarkAsAttended = async () => {
    try {
      const ids = selectedRows.map((row) => row.beneficiaryId || row);
      if (ids.length === 0) {
        console.error("No rows selected");
        return;
      }
      await markAsAttended(ids);
      console.log("Marked as attended:", ids);
      refreshParticipations();
      showSnackbar("Marked as attended", "success");
    } catch (error) {
      console.error("Error marking as attended:", error);
      showSnackbar("Failed to mark as attended", "error");
    }
  };

  const handleRemoveSelection = async () => {
    try {
      const ids = selectedRows.map((row) => row.beneficiaryId || row);
      if (ids.length === 0) {
        console.error("No rows selected");
        return;
      }
      for (const id of ids) {
        await axios.delete(
          `http://localhost:3000/activities/activity-participations/${activityId}/${id}`
        );
      }
      console.log("Removed selection:", ids);
      refreshParticipations();
      showSnackbar("Beneficiary removed successfully", "success");
    } catch (error) {
      console.error("Error removing beneficiary:", error);
      showSnackbar("Failed to remove beneficiary", "error");
    }
  };

  const exportPDF = (rows, columns) => {
    const unit = "pt";
    const size = "A4"; // Use A4 size
    const orientation = "landscape"; // Landscape or portrait

    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(15);

    const pageWidth = doc.internal.pageSize.getWidth();
    const title = activity.title; // Use the title from the activity state
    const location = "Polomolok, South Cotabato";
    const activityDate = dayjs(activity.activityDate).format("MMMM YYYY");

    const filteredColumns = columns
      .filter(
        (col) =>
          ![
            "actions",
            "beneficiaryId",
            "beneficiaryBirthdate",
            "beneficiaryAge",
            "beneficiaryCivilStatus",
            "beneficiaryContactNumber",
            "beneficiaryJob",
            "beneficiaryHealthStation",
            "beneficiaryTypes",
            "beneficiarySubType",
            "beneficiaryAgeGroup",
            "beneficiarySex", // Exclude the Sex field
          ].includes(col.field)
      )
      .map((col) => {
        if (col.field === "beneficiaryBarangay") {
          return { ...col, headerName: "Barangay" }; // Rename column header
        }
        return col;
      });

    const headers = [filteredColumns.map((col) => col.headerName)];

    const data = rows.map((row) =>
      filteredColumns.map((column) => {
        if (column.field === "attended") {
          return row[column.field] ? "Yes" : "No";
        } else if (column.field === "beneficiaryBirthdate") {
          const date = new Date(row[column.field]);
          return `${date.toLocaleString("default", {
            month: "long",
          })} - ${date.getDate()}, ${date.getFullYear()}: Time: ${date.toLocaleTimeString()}`;
        }
        return row[column.field];
      })
    );

    // Optional - Set up the logo dimensions
    const logoUrl = "/assets/pol-logo.jpg"; // Update with the correct path
    const logoWidth = 50;
    const logoHeight = 50;
    const logoX = pageWidth / 2 - logoWidth / 2; // Center the logo

    doc.addImage(logoUrl, "PNG", logoX, 40, logoWidth, logoHeight);

    const titleX = pageWidth / 2;
    const titleY = 110; // Adjust based on your layout
    const locationY = titleY + 20; // Position below the title
    const dateY = locationY + 20; // Position below the location

    doc.setFontSize(15);
    doc.text(title, titleX, titleY, { align: "center" });
    doc.setFontSize(12);
    doc.text(location, titleX, locationY, { align: "center" });
    doc.text(activityDate, titleX, dateY, { align: "center" });

    doc.autoTable({
      head: headers,
      body: data,
      startY: dateY + 10, // Add space between the date and the table
      theme: "striped",
      headStyles: {
        fillColor: [22, 160, 133], // example RGB values
        textColor: [255, 255, 255],
      },
      styles: {
        overflow: "linebreak",
        fontSize: 10,
        cellPadding: 2,
        overflowColumns: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: "auto" },
        2: { cellWidth: "auto" },
        // add more column styles here if necessary
      },
    });

    doc.save("report.pdf");
  };

  const CustomExportButton = ({ rows, columns }) => {
    return (
      <Button
        variant="contained"
        onClick={() => exportPDF(rows, columns)}
        sx={{ mb: 2, backgroundColor: "green", mr: 1 }}
      >
        Export to PDF
      </Button>
    );
  };

  return (
    <Box sx={{ margin: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack spacing={1}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "darkGreen",
              textTransform: "uppercase",
            }}
          >
            Check Participation for: {activity.title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "Green" }}>
            {activity.description}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "Green" }}>
            Date: {displayDate}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {user.role !== "1" && (
            <Button
              aria-label="add"
              size="large"
              onClick={handleOpen}
              sx={{
                color: "white",
                backgroundColor: "green",
                mt: 1,
                mr: 2,
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "darkGreen",
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.25)",
                },
              }}
              startIcon={<GroupAddIcon />}
            >
              Add Target Beneficiaries
            </Button>
          )}
        </Stack>
      </Stack>
      <div style={{ height: 400, width: "100%", marginTop: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CustomExportButton rows={filteredParticipations} columns={columns} />
          <Button
            variant="contained"
            sx={{
              color: "white",
              backgroundColor: "green",
              mb: 2,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "darkGreen",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.25)",
              },
            }}
            onClick={handleOpenDocumentationModal} // Open the documentation modal
          >
            View Photo Documentation
          </Button>
        </Stack>
        <DataGrid
          rows={filteredParticipations}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          checkboxSelection
          getRowHeight={() => 150}
          onRowSelectionModelChange={handleSelectionModelChange}
          rowSelectionModel={selectedRows}
          getRowId={(row) => row.beneficiaryId}
          isRowSelectable={(params) => !params.row.attended}
        />
      </div>
      {selectedRows.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleMarkAsAttended}
            sx={{
              backgroundColor: "Green",
              color: "white",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "darkGreen",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.25)",
              },
            }}
          >
            Mark As Attended
          </Button>
          <Button
            variant="contained"
            onClick={handleRemoveSelection}
            sx={{
              backgroundColor: "red",
              color: "white",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "darkRed",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.25)",
              },
            }}
          >
            Remove Selected
          </Button>
        </Stack>
      )}
      <TargetBeneficiariesModal
        open={open}
        handleClose={handleClose}
        activityId={activityId}
        refreshParticipations={refreshParticipations}
        currentParticipants={participations}
      />
      <DocumentationModal
        open={openDocumentationModal}
        handleClose={handleCloseDocumentationModal}
        activityId={activityId}
        refreshParticipations={refreshParticipations}
      />
    </Box>
  );
};

export default ViewActivity;
