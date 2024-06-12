import axios from "axios";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
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
  const [allTypes, setAllTypes] = useState([]);

  const [ageGroups] = useState([
    "Infant",
    "Toddler",
    "Child",
    "Teen",
    "Adult",
    "Senior Citizen",
  ]);
  const [sexOptions] = useState(["Male", "Female"]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState([]);
  const [selectedSexes, setSelectedSexes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSubType, setSelectedSubType] = useState("");
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);

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

  useEffect(() => {
    const loadBeneficiaries = async () => {
      try {
        const data = await fetchUnarchivedBeneficiaries();

        const formattedData = data.map((beneficiary) => {
          const typesData = allTypes.reduce((acc, type) => {
            acc[type.typeName] = beneficiary.types.includes(type.typeName)
              ? type.typeName
              : "No";
            return acc;
          }, {});

          return {
            ...beneficiary,
            birthdate: dayjs(beneficiary.birthdate).format("MMMM-DD-YYYY"),
            age: calculateAge(beneficiary.birthdate).replace(/\n/g, "<br>"),
            ...typesData,
          };
        });

        setBeneficiaries(formattedData);
        setFilteredBeneficiaries(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch beneficiaries:", error);
      }
    };

    if (allTypes.length) {
      loadBeneficiaries();
    }
  }, [allTypes]);

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
    setSelectedAgeGroups([]);
    setSelectedSexes([]);
    setSelectedTypes([]);
    setSelectedSubType("");
    setSearchText("");
    setFilteredBeneficiaries(beneficiaries);
    console.log("Selections cleared");
  };

  const handleFilterChange = () => {
    let filtered = beneficiaries;

    if (selectedAgeGroups.length > 0) {
      filtered = filtered.filter((beneficiary) =>
        selectedAgeGroups.includes(beneficiary.ageGroup)
      );
    }

    if (selectedSexes.length > 0) {
      filtered = filtered.filter((beneficiary) =>
        selectedSexes.includes(beneficiary.sex)
      );
    }

    if (selectedTypes.length > 0) {
      filtered = filtered.filter((beneficiary) =>
        selectedTypes.some((type) => beneficiary.types.includes(type))
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
    selectedAgeGroups,
    selectedSexes,
    selectedTypes,
    selectedSubType,
    searchText,
    beneficiaries,
  ]);

  // Sort typeColumns and place "Mother" before "Sub Type"
  let typeColumns = allTypes.map((type) => ({
    field: type.typeName,
    headerName: `${type.typeName}?`,
    width: 150,
    renderCell: (params) => (
      <div style={{ whiteSpace: "pre-wrap" }}>{params.value}</div>
    ),
  }));

  const motherColumn = typeColumns.find((col) => col.field === "Mother");
  typeColumns = typeColumns.filter((col) => col.field !== "Mother");
  if (motherColumn) {
    typeColumns.push(motherColumn); // Add "Mother" column at the end
  }

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
    { field: "job", headerName: "Job", width: 150 },
    { field: "barangay", headerName: "Barangay", width: 150 },
    { field: "healthStation", headerName: "Health Station", width: 150 },
    { field: "civilStatus", headerName: "Civil Status", width: 150 },
    { field: "contactNumber", headerName: "Contact Number", width: 150 },
    ...typeColumns,
    { field: "subType", headerName: "Subtype", width: 150 },
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
            width: "20%",
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
          <FormGroup>
            <Stack
              direction="column"
              justifyContent="space-evenly"
              alignItems="flex-start"
              spacing={1}
            >
              <strong>Age Group:</strong>
              <Box sx>
                {ageGroups.map((group) => (
                  <FormControlLabel
                    key={group}
                    control={
                      <Checkbox
                        checked={selectedAgeGroups.includes(group)}
                        onChange={() => {
                          setSelectedAgeGroups((prev) =>
                            prev.includes(group)
                              ? prev.filter((ageGroup) => ageGroup !== group)
                              : [...prev, group]
                          );
                        }}
                      />
                    }
                    label={group}
                  />
                ))}
              </Box>
            </Stack>
            <Stack
              direction="column"
              justifyContent="space-evenly"
              alignItems="flex-start"
              spacing={1}
            >
              <strong>Sex:</strong>
              <Box>
                {sexOptions.map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={selectedSexes.includes(option)}
                        onChange={() => {
                          setSelectedSexes((prev) =>
                            prev.includes(option)
                              ? prev.filter((sex) => sex !== option)
                              : [...prev, option]
                          );
                        }}
                      />
                    }
                    label={option}
                  />
                ))}
              </Box>
            </Stack>
            <Stack
              direction="column"
              justifyContent="space-evenly"
              alignItems="flex-start"
              spacing={1}
            >
              <Box>
                <strong>Types:</strong>
                {allTypes.map((type) => (
                  <Box key={type.typeId}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedTypes.includes(type.typeName)}
                          onChange={() => {
                            setSelectedTypes((prev) =>
                              prev.includes(type.typeName)
                                ? prev.filter((t) => t !== type.typeName)
                                : [...prev, type.typeName]
                            );
                            setSelectedSubType("");
                          }}
                        />
                      }
                      label={type.typeName}
                    />
                    {selectedTypes.includes(type.typeName) &&
                      type.subTypes.length > 0 && (
                        <Box sx={{ ml: 3 }}>
                          <FormGroup>
                            {type.subTypes.map((subType) => (
                              <FormControlLabel
                                key={subType}
                                control={
                                  <Checkbox
                                    checked={selectedSubType === subType}
                                    onChange={() => setSelectedSubType(subType)}
                                  />
                                }
                                label={subType}
                              />
                            ))}
                          </FormGroup>
                        </Box>
                      )}
                  </Box>
                ))}
              </Box>
            </Stack>
          </FormGroup>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleClearSelection}
            sx={{ mt: 2 }}
          >
            Clear Selection
          </Button>
        </Box>
        <Box flex={2} sx={{ overflowX: "auto" }}>
          <Box sx={{ height: 600, minWidth: 100 }}>
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
