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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
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
  const [types, setTypes] = useState([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [searchText, setSearchText] = useState("");
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const { showSnackbar } = useSnackbar();
  const { updateActivity } = useActivityStore(); // Use useActivityStore

  useEffect(() => {
    if (open) {
      fetchBeneficiaries();
    }
  }, [open]);

  useEffect(() => {
    if (selectedAgeGroup) {
      fetchTypes(selectedAgeGroup);
    } else {
      setTypes([]);
      setSelectedType("");
      setSelectedSubType("");
    }
  }, [selectedAgeGroup]);

  const fetchBeneficiaries = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/beneficiaries/unarchived"
      );
      const formattedBeneficiaries = response.data.map((beneficiary) => ({
        ...beneficiary,
        birthdate: dayjs(beneficiary.birthdate).format("MMMM-DD-YYYY"),
        types: beneficiary.beneficiaryTypes
          .map((bt) => bt.type.typeName)
          .join(", "),
        typeAndSubType: beneficiary.subType
          ? `${beneficiary.types.join(", ")} - ${beneficiary.subType}`
          : beneficiary.types.join(", "),
      }));
      setBeneficiaries(formattedBeneficiaries);
      setFilteredBeneficiaries(formattedBeneficiaries);
      console.log("Beneficiaries loaded", formattedBeneficiaries);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
    }
  };

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

  const handleAddSelected = async () => {
    try {
      const selectedBeneficiaries = selectedRows.map((id) =>
        beneficiaries.find((b) => b.beneficiaryId === id)
      );

      console.log("Selected Beneficiaries:", selectedBeneficiaries);

      const response = await axios.post(
        "http://localhost:3000/participation/add",
        {
          activityId,
          beneficiaries: selectedBeneficiaries,
        }
      );

      console.log("Response from server:", response.data);
      showSnackbar("Beneficiaries successfully added", "success");
      handleClose();
      refreshParticipations(); // Immediately refresh participations
    } catch (error) {
      console.error("Error adding beneficiaries:", error);
      showSnackbar("Failed to add beneficiaries", "error");
    }
  };

  const columns = [
    { field: "beneficiaryId", headerName: "ID", width: 90 },
    { field: "firstName", headerName: "First Name", width: 150 },
    { field: "middleName", headerName: "Middle Name", width: 150 },
    { field: "lastName", headerName: "Last Name", width: 150 },
    { field: "suffix", headerName: "Suffix", width: 90 },
    { field: "typeAndSubType", headerName: "Types", width: 250 },
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
            <FormControl fullWidth>
              <InputLabel id="age-group-select-label">Age Group</InputLabel>
              <Select
                labelId="age-group-select-label"
                value={selectedAgeGroup}
                label="Age Group"
                onChange={(e) => {
                  setSelectedAgeGroup(e.target.value);
                  setSelectedType(""); // Clear selected type when age group changes
                  setSelectedSubType(""); // Clear selected subtype when age group changes
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
              <Stack direction="column" spacing={1} mt={2}>
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
              </Stack>
            )}
          </Stack>
          <Box sx={{ width: "67%" }}>
            <div style={{ height: 600, width: "100%", marginBottom: 16 }}>
              <DataGrid
                rows={filteredBeneficiaries}
                columns={columns}
                pageSize={5}
                columnVisibilityModel={{
                  beneficiaryId: false,
                  birthdate: false,
                  age: false,
                  sex: false,
                  job: false,
                  healthStation: false,
                  civilStatus: false,
                  contactNumber: false,
                  subType: false,
                }}
                getRowHeight={() => 130}
                checkboxSelection
                onRowSelectionModelChange={(newSelection) => {
                  setSelectedRows(newSelection);
                  console.log("Selected Rows:", newSelection);
                }}
                getRowId={(row) => row.beneficiaryId}
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
