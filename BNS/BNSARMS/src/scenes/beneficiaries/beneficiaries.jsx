import axios from "axios";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
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
import { fetchUnarchivedBeneficiaries } from "../../functions/forBeneficiaries";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useSnackbar } from "../../context/SnackbarContext";

dayjs.extend(duration);

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
  const { showSnackbar } = useSnackbar();

  const [ageGroups] = useState([
    "Infant",
    "Toddler",
    "Child",
    "Teen",
    "Adult",
    "Senior Citizen",
  ]);
  const [types, setTypes] = useState([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);

  useEffect(() => {
    const loadBeneficiaries = async () => {
      try {
        const data = await fetchUnarchivedBeneficiaries();

        const formattedData = data.map((beneficiary) => ({
          ...beneficiary,
          birthdate: dayjs(beneficiary.birthdate).format("MMMM-DD-YYYY"),
          age: calculateAge(beneficiary.birthdate).replace(/\n/g, "<br>"),
          types: Array.isArray(beneficiary.types)
            ? beneficiary.types.join("<br>")
            : "",
          subType: beneficiary.subType || "",
        }));

        setBeneficiaries(formattedData);
        setFilteredBeneficiaries(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch beneficiaries:", error);
      }
    };

    loadBeneficiaries();
  }, []);

  useEffect(() => {
    if (selectedAgeGroup) {
      fetchTypes(selectedAgeGroup);
    } else {
      setTypes([]);
      setSelectedType("");
      setSelectedSubType("");
    }
  }, [selectedAgeGroup]);

  const fetchTypes = async (ageGroup) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/types/typesforparticipation?ageGroup=${ageGroup}`
      );
      setTypes(response.data);
      console.log("Types loaded", response.data);
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

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
      setFilteredBeneficiaries((prev) =>
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

  const handleClearSelection = () => {
    setSelectedAgeGroup("");
    setSelectedType("");
    setSelectedSubType("");
    setSearchText("");
    setFilteredBeneficiaries(beneficiaries);
    console.log("Selections cleared");
  };

  const handleFilterChange = () => {
    let filtered = beneficiaries;

    if (selectedAgeGroup) {
      filtered = filtered.filter(
        (beneficiary) => beneficiary.ageGroup === selectedAgeGroup
      );
    }

    if (selectedType) {
      filtered = filtered.filter((beneficiary) =>
        beneficiary.types.includes(selectedType)
      );
    }

    if (selectedSubType) {
      filtered = filtered.filter(
        (beneficiary) => beneficiary.subType === selectedSubType
      );
    }

    if (searchText) {
      filtered = filtered.filter((beneficiary) =>
        Object.values(beneficiary).some((value) =>
          String(value).toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    setFilteredBeneficiaries(filtered);
  };

  useEffect(() => {
    handleFilterChange();
  }, [
    selectedAgeGroup,
    selectedType,
    selectedSubType,
    searchText,
    beneficiaries,
  ]);

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
      headerName: "Sub Type",
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

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Beneficiaries" subtitle="View Beneficiaries" />
        <Button
          variant="contained"
          sx={{ bgcolor: "green" }}
          onClick={() => navigate("/app/new-beneficiary")}
        >
          Add Beneficiary
        </Button>
      </Box>
      <Box display="flex" mt={2}>
        <Box
          sx={{
            width: "35%",
            mr: 2,
            p: 2,
            border: "1px solid #ccc",
            borderRadius: 2,
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="age-group-select-label">Age Group</InputLabel>
            <Select
              labelId="age-group-select-label"
              value={selectedAgeGroup}
              label="Age Group"
              onChange={(e) => {
                setSelectedAgeGroup(e.target.value);
                setSelectedType("");
                setSelectedSubType("");
                console.log("Selected Age Group:", e.target.value);
              }}
            >
              {ageGroups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {types.length > 0 && (
            <Box>
              {types.map((type) => (
                <Box key={type.typeId}>
                  <FormControlLabel
                    control={
                      <Radio
                        checked={selectedType === type.typeName}
                        onChange={() => {
                          setSelectedType(type.typeName);
                          setSelectedSubType("");
                        }}
                      />
                    }
                    label={type.typeName}
                  />
                  {selectedType === type.typeName &&
                    type.subTypes.length > 0 && (
                      <RadioGroup
                        value={selectedSubType}
                        onChange={(e) => setSelectedSubType(e.target.value)}
                        sx={{ ml: 3 }}
                      >
                        {type.subTypes.map((subType) => (
                          <FormControlLabel
                            key={subType}
                            value={subType}
                            control={<Radio />}
                            label={subType}
                          />
                        ))}
                      </RadioGroup>
                    )}
                </Box>
              ))}
            </Box>
          )}
          <Button
            variant="outlined"
            color="primary"
            onClick={handleClearSelection}
            sx={{ mt: 2 }}
          >
            Clear Selection
          </Button>
        </Box>
        <Box flex={2}>
          <Box sx={{ height: 600, width: "55%" }}>
            <DataGrid
              rows={filteredBeneficiaries}
              columns={columns}
              pageSize={5}
              loading={loading}
              getRowId={(row) => row.beneficiaryId}
              getRowHeight={() => 80}
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
          </Box>
        </Box>
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
