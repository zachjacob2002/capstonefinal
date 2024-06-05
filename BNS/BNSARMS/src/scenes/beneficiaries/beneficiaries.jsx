import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import ArchiveIcon from "@mui/icons-material/Archive";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchUnarchivedBeneficiaries } from "../../functions/forBeneficiaries";
import dayjs from "dayjs"; // Import dayjs for date formatting
import duration from "dayjs/plugin/duration"; // Import duration plugin for age calculation
import axios from "axios";
import { useSnackbar } from "../../context/SnackbarContext"; // Import useSnackbar

dayjs.extend(duration); // Extend dayjs with the duration plugin

const calculateAge = (birthdate) => {
  const now = dayjs();
  const birth = dayjs(birthdate);
  const ageInDays = now.diff(birth, "day");
  const ageInWeeks = now.diff(birth, "week");
  const ageInMonths = now.diff(birth, "month");
  const ageInYears = now.diff(birth, "year");

  if (ageInDays < 7) {
    return `${ageInDays} Days Old`;
  }

  const years = ageInYears > 0 ? `${ageInYears} Years` : "";
  const months = ageInMonths % 12 > 0 ? `${ageInMonths % 12} Months` : "";
  const weeks = ageInWeeks % 4 > 0 ? `${ageInWeeks % 4} Weeks` : "";

  return [years, months, weeks].filter(Boolean).join("\n");
};

const Beneficiaries = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState(null);
  const { showSnackbar } = useSnackbar(); // Use the snackbar context

  useEffect(() => {
    const loadBeneficiaries = async () => {
      try {
        const data = await fetchUnarchivedBeneficiaries();

        // Format the data to include secondary and tertiary types and combine them with primary type
        const formattedData = data.map((beneficiary) => ({
          ...beneficiary,
          birthdate: dayjs(beneficiary.birthdate).format("MMMM-DD-YYYY"), // Format birthdate
          age: calculateAge(beneficiary.birthdate).replace(/\n/g, "<br>"), // Replace \n with <br> for display
          types: Array.isArray(beneficiary.types)
            ? beneficiary.types.join("<br>") // Join types array into a string with <br> for display
            : "",
          subType: beneficiary.subType || "", // Include subType
        }));

        setBeneficiaries(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch beneficiaries:", error);
      }
    };

    loadBeneficiaries();
  }, []);

  const handleRowClick = (params) => {
    navigate("/app/new-beneficiary", { state: { beneficiary: params.row } });
  };

  const handleArchive = async () => {
    try {
      await axios.patch(
        `http://localhost:3000/beneficiaries/archive/${selectedBeneficiaryId}`
      );
      setBeneficiaries((prev) =>
        prev.filter((b) => b.beneficiaryId !== selectedBeneficiaryId)
      );
      handleCloseArchiveDialog();
      showSnackbar("Beneficiary successfully archived", "success");
    } catch (error) {
      console.error("Failed to archive beneficiary:", error);
      showSnackbar("Failed to archive beneficiary", "error");
    }
  };

  const handleOpenArchiveDialog = (beneficiaryId) => {
    setSelectedBeneficiaryId(beneficiaryId);
    setOpenArchiveDialog(true);
  };

  const handleCloseArchiveDialog = () => {
    setOpenArchiveDialog(false);
    setSelectedBeneficiaryId(null);
  };

  const columns = [
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key={`archive-${params.id}`}
          icon={<ArchiveIcon />}
          label="Archive"
          onClick={() => handleOpenArchiveDialog(params.row.beneficiaryId)}
        />,
      ],
    },
    { field: "beneficiaryId", headerName: "ID", width: 90 },
    { field: "firstName", headerName: "First Name", width: 150 },
    { field: "middleName", headerName: "Middle Name", width: 150 },
    { field: "lastName", headerName: "Last Name", width: 150 },
    { field: "suffix", headerName: "Suffix", width: 90 },
    { field: "birthdate", headerName: "Birthdate", width: 150 },
    {
      field: "age",
      headerName: "Age",
      width: 150,
      renderCell: (params) => (
        <div
          style={{ whiteSpace: "pre-wrap" }}
          dangerouslySetInnerHTML={{ __html: params.value }}
        />
      ),
    },
    { field: "sex", headerName: "Sex", width: 120 },
    {
      field: "types",
      headerName: "Types",
      width: 200,
      renderCell: (params) => (
        <div
          style={{ whiteSpace: "pre-wrap" }}
          dangerouslySetInnerHTML={{ __html: params.value }}
        />
      ),
    },
    {
      field: "subType",
      headerName: "SubType",
      width: 150,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap" }}>{params.value}</div>
      ),
    },
    { field: "job", headerName: "Job", width: 150 },
    { field: "barangay", headerName: "Barangay", width: 150 },
    { field: "healthStation", headerName: "Health Station", width: 150 },
    { field: "civilStatus", headerName: "Civil Status", width: 150 },
    { field: "contactNumber", headerName: "Contact Number", width: 150 },
  ];

  const filteredRows = beneficiaries.filter((beneficiary) => {
    const fullName = `${beneficiary.firstName} ${
      beneficiary.middleName || ""
    } ${beneficiary.lastName} ${beneficiary.suffix || ""}`.trim();
    return fullName.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Beneficiaries" subtitle="View Beneficiaries" />
        <Box display="flex" alignItems="center">
          <TextField
            variant="outlined"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
            sx={{ marginRight: 2 }}
          />
          <Button
            variant="contained"
            sx={{ bgcolor: "green" }}
            onClick={() => navigate("/app/new-beneficiary")}
          >
            Add Beneficiary
          </Button>
        </Box>
      </Box>
      <Box m="20px">
        <div style={{ height: 400, width: "100%", marginTop: 20 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={5}
            loading={loading}
            getRowId={(row) => row.beneficiaryId}
            getRowHeight={() => 130}
            sortModel={[{ field: "lastName", sort: "asc" }]}
            columnVisibilityModel={{
              beneficiaryId: false,
            }}
            onRowClick={handleRowClick}
            sx={{
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
              },
            }}
          />
        </div>
      </Box>
      <Dialog
        open={openArchiveDialog}
        onClose={handleCloseArchiveDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Archiving"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to archive this Beneficiary?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseArchiveDialog} color="primary">
            No
          </Button>
          <Button onClick={handleArchive} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Beneficiaries;
