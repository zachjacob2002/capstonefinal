/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Modal,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
  FormGroup,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useSnackbar } from "../../context/SnackbarContext";
import useActivityStore from "../../stores/useActivityStore"; // Import useActivityStore

const TargetBeneficiariesModal = ({
  open,
  handleClose,
  activityId,
  refreshParticipations,
}) => {
  const [ageGroups] = useState([
    "Infant",
    "Toddler",
    "Child",
    "Teen",
    "Adult",
    "Senior Citizen",
  ]);
  const [sexOptions] = useState(["Male", "Female"]);
  const [types, setTypes] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState([]);
  const [selectedSexes, setSelectedSexes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSubType, setSelectedSubType] = useState("");
  const [searchText, setSearchText] = useState("");
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const { showSnackbar } = useSnackbar();
  const { updateActivity } = useActivityStore(); // Use useActivityStore

  useEffect(() => {
    const fetchAllTypes = async () => {
      try {
        const response = await axios.get("http://localhost:3000/types");
        setAllTypes(response.data);
        setTypes(response.data); // Set the types immediately for display
      } catch (error) {
        console.error("Failed to fetch all types:", error);
      }
    };

    fetchAllTypes();
  }, []);

  useEffect(() => {
    if (open && allTypes.length) {
      fetchBeneficiaries();
    }
  }, [open, allTypes]);

  const fetchBeneficiaries = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/beneficiaries/unarchived"
      );
      const formattedBeneficiaries = response.data.map((beneficiary) => ({
        ...beneficiary,
        birthdate: dayjs(beneficiary.birthdate).format("MMMM-DD-YYYY"),
        types: beneficiary.beneficiaryTypes.map((bt) => bt.type.typeName),
      }));
      setBeneficiaries(formattedBeneficiaries);
      setFilteredBeneficiaries(formattedBeneficiaries); // Initially set filtered beneficiaries
      console.log("Beneficiaries loaded: ", formattedBeneficiaries); // Log the loaded beneficiaries
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
    }
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

  const handleAddSelected = async () => {
    try {
      const selectedBeneficiaries = selectedRows.map((id) =>
        beneficiaries.find((b) => b.beneficiaryId === id)
      );

      console.log("Selected Beneficiaries: ", selectedBeneficiaries); // Log the selected beneficiaries

      const response = await axios.post(
        "http://localhost:3000/participation/add",
        {
          activityId,
          beneficiaries: selectedBeneficiaries,
        }
      );

      console.log("Response from server: ", response.data);
      showSnackbar("Beneficiaries successfully added", "success");
      handleClose();
      refreshParticipations(); // Immediately refresh participations
    } catch (error) {
      console.error("Error adding beneficiaries:", error);
      showSnackbar("Failed to add beneficiaries", "error");
    }
  };

  const typeColumns = allTypes.map((type) => ({
    field: type.typeName,
    headerName: `${type.typeName}?`,
    width: 150,
    renderCell: (params) => {
      const value = params.row.types.includes(type.typeName)
        ? type.typeName
        : "No";
      console.log(`Value for ${type.typeName}: `, value); // Log the value for each type column
      return <div style={{ whiteSpace: "pre-wrap" }}>{value}</div>;
    },
  }));

  const columns = [
    { field: "beneficiaryId", headerName: "ID", width: 90 },
    { field: "firstName", headerName: "First Name", width: 150 },
    { field: "middleName", headerName: "Middle Name", width: 150 },
    { field: "lastName", headerName: "Last Name", width: 150 },
    { field: "suffix", headerName: "Suffix", width: 90 },
    { field: "birthdate", headerName: "Birthdate", width: 150 },
    { field: "age", headerName: "Age", width: 150 },
    { field: "sex", headerName: "Sex", width: 120 },
    { field: "job", headerName: "Job", width: 150 },
    { field: "barangay", headerName: "Barangay", width: 150 },
    { field: "healthStation", headerName: "Health Station", width: 150 },
    { field: "ageGroup", headerName: "Age Group", width: 150 },
    { field: "subType", headerName: "Subtype", width: 150 },
    { field: "civilStatus", headerName: "Civil Status", width: 150 },
    { field: "contactNumber", headerName: "Contact Number", width: 150 },
    ...typeColumns,
  ];

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1600,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2" mb={2}>
          Add Target Beneficiaries
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleClearSelection}
          sx={{ mb: 2, alignSelf: "flex-start" }}
        >
          Clear Selection
        </Button>
        <Stack direction="row" spacing={2} mb={2} sx={{ width: "100%" }}>
          <Stack
            direction="column"
            spacing={2}
            alignItems="flex-start"
            sx={{ width: "33%" }}
          >
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              fullWidth
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
                                      onChange={() =>
                                        setSelectedSubType(subType)
                                      }
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
          </Stack>
          <Box sx={{ width: "67%" }}>
            <div style={{ height: 600, width: "100%", marginBottom: 16 }}>
              <DataGrid
                rows={filteredBeneficiaries}
                columns={columns}
                pageSize={5}
                getRowHeight={() => 130}
                checkboxSelection
                onRowSelectionModelChange={(newSelection) => {
                  setSelectedRows(newSelection);
                  console.log("Selected Rows: ", newSelection);
                }}
                getRowId={(row) => row.beneficiaryId}
                sx={{
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bold",
                  },
                }}
              />
            </div>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="contained" color="primary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddSelected}
          >
            Add Selected
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default TargetBeneficiariesModal;
