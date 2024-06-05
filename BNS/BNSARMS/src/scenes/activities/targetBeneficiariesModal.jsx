/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { fetchBeneficiaries } from "../../functions/forBeneficiaries";
import { addBeneficiariesToActivity } from "../../functions/forParticipation"; // Import the function
import {
  fetchPrimaryTypes,
  fetchSecondaryTypes,
  fetchTertiaryTypes,
  fetchSexOptions,
} from "../../functions/forTypeModal";
import dayjs from "dayjs";
import { useSnackbar } from "../../context/SnackbarContext"; // Import useSnackbar

const TargetBeneficiariesModal = ({
  open,
  handleClose,
  activityId,
  refreshParticipations,
  currentParticipants, // Add current participants as a prop
}) => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);
  const [primaryTypes, setPrimaryTypes] = useState([]);
  const [secondaryTypes, setSecondaryTypes] = useState([]);
  const [tertiaryTypes, setTertiaryTypes] = useState([]);
  const [sexOptions, setSexOptions] = useState([]);
  const [selectedPrimaryType, setSelectedPrimaryType] = useState("");
  const [selectedSecondaryType, setSelectedSecondaryType] = useState("");
  const [selectedTertiaryType, setSelectedTertiaryType] = useState("");
  const [selectedSex, setSelectedSex] = useState("");
  const [searchText, setSearchText] = useState("");

  const { showSnackbar } = useSnackbar(); // Use useSnackbar

  useEffect(() => {
    if (open) {
      const fetchAllBeneficiaries = async () => {
        try {
          const data = await fetchBeneficiaries();

          const formattedData = data.map((beneficiary) => ({
            ...beneficiary,
            birthdate: dayjs(beneficiary.birthdate).format("MMMM-DD-YYYY"),
            types: [
              beneficiary.primaryType,
              ...beneficiary.secondaryTypeNames,
              beneficiary.tertiaryTypeName,
            ]
              .filter((type) => type)
              .join("\n"),
          }));

          const filteredData = formattedData.filter(
            (beneficiary) =>
              !currentParticipants.some(
                (participant) =>
                  participant.beneficiaryId === beneficiary.beneficiaryId
              )
          );

          setBeneficiaries(filteredData);
          setFilteredBeneficiaries(filteredData);
          console.log("Beneficiaries loaded", formattedData);
        } catch (error) {
          console.error("Error fetching beneficiaries:", error);
        }
      };

      const fetchTypes = async () => {
        try {
          const primaryData = await fetchPrimaryTypes();
          setPrimaryTypes(primaryData);
          const sexData = await fetchSexOptions();
          setSexOptions(sexData.filter((sex) => sex !== "Both"));
          console.log("Primary Types:", primaryData);
          console.log(
            "Sex Options:",
            sexData.filter((sex) => sex !== "Both")
          );
        } catch (error) {
          console.error("Error fetching types and sex options:", error);
        }
      };

      fetchAllBeneficiaries();
      fetchTypes();
    }
  }, [open]);

  useEffect(() => {
    if (selectedPrimaryType && selectedSex) {
      const fetchSecondary = async () => {
        try {
          const secondaryData = await fetchSecondaryTypes(
            selectedPrimaryType,
            selectedSex
          );
          setSecondaryTypes(secondaryData);
          console.log("Secondary Types:", secondaryData);
        } catch (error) {
          console.error("Error fetching secondary types:", error);
        }
      };

      fetchSecondary();
    }
  }, [selectedPrimaryType, selectedSex]);

  useEffect(() => {
    if (selectedSecondaryType) {
      const fetchTertiary = async () => {
        try {
          const tertiaryData = await fetchTertiaryTypes(selectedSecondaryType);
          setTertiaryTypes(tertiaryData);
          console.log("Tertiary Types:", tertiaryData);
        } catch (error) {
          console.error("Error fetching tertiary types:", error);
        }
      };

      fetchTertiary();
    }
  }, [selectedSecondaryType]);

  useEffect(() => {
    filterBeneficiaries();
  }, [
    selectedPrimaryType,
    selectedSecondaryType,
    selectedTertiaryType,
    selectedSex,
    beneficiaries,
  ]);

  const filterBeneficiaries = () => {
    console.log("Filtering beneficiaries with:", {
      selectedPrimaryType,
      selectedSecondaryType,
      selectedTertiaryType,
      selectedSex,
    });
    let filtered = beneficiaries;

    if (selectedPrimaryType) {
      const primaryTypeName = primaryTypes.find(
        (type) => type.primaryTypeId === selectedPrimaryType
      )?.typeName;
      if (primaryTypeName) {
        filtered = filtered.filter(
          (beneficiary) => beneficiary.primaryType === primaryTypeName
        );
      }
    }

    if (selectedSecondaryType) {
      const secondaryTypeName = secondaryTypes.find(
        (type) => type.typeId === selectedSecondaryType
      )?.typeName;
      if (secondaryTypeName) {
        filtered = filtered.filter((beneficiary) =>
          beneficiary.secondaryTypeNames.includes(secondaryTypeName)
        );
      }
    }

    if (selectedTertiaryType) {
      const tertiaryTypeName = tertiaryTypes.find(
        (type) => type.typeId === selectedTertiaryType
      )?.typeName;
      if (tertiaryTypeName) {
        filtered = filtered.filter(
          (beneficiary) => beneficiary.tertiaryTypeName === tertiaryTypeName
        );
      }
    }

    if (selectedSex) {
      filtered = filtered.filter(
        (beneficiary) => beneficiary.sex === selectedSex
      );
    }

    setFilteredBeneficiaries(filtered);
    console.log("Filtered Beneficiaries:", filtered);
  };

  const handleAddSelected = async () => {
    try {
      await addBeneficiariesToActivity(activityId, selectedBeneficiaries);
      console.log("Selected Beneficiaries:", selectedBeneficiaries);
      refreshParticipations(); // Refresh the participation list
      handleClose();
      showSnackbar("Beneficiaries successfully added", "success");
    } catch (error) {
      console.error("Error adding beneficiaries to activity:", error);
      showSnackbar("Failed to add beneficiaries", "error");
    }
  };

  const handleSelectionModelChange = (newSelection) => {
    const selectedData = newSelection.map((id) =>
      beneficiaries.find((beneficiary) => beneficiary.beneficiaryId === id)
    );
    setSelectedBeneficiaries(selectedData);
    console.log("Selected Beneficiaries Data:", selectedData); // Log selected beneficiary data
  };

  const handleClearSelection = () => {
    setSelectedPrimaryType("");
    setSelectedSecondaryType("");
    setSelectedTertiaryType("");
    setSelectedSex("");
    setSearchText("");
    setFilteredBeneficiaries(beneficiaries);
    console.log("Selections cleared");
  };

  const columns = [
    { field: "beneficiaryId", headerName: "ID", width: 90 },
    { field: "firstName", headerName: "First Name", width: 150 },
    { field: "middleName", headerName: "Middle Name", width: 150 },
    { field: "lastName", headerName: "Last Name", width: 150 },
    { field: "suffix", headerName: "Suffix", width: 90 },
    {
      field: "types",
      headerName: "Types",
      width: 200,
      renderCell: (params) => (
        <div style={{ whiteSpace: "pre-wrap" }}>{params.value}</div>
      ),
    },
    { field: "birthdate", headerName: "Birthdate", width: 150 },
    { field: "age", headerName: "Age", width: 150 },
    { field: "sex", headerName: "Sex", width: 120 },
    { field: "job", headerName: "Job", width: 150 },
    { field: "barangay", headerName: "Barangay", width: 150 },
    { field: "healthStation", headerName: "Health Station", width: 150 },
    { field: "civilStatus", headerName: "Civil Status", width: 150 },
    { field: "contactNumber", headerName: "Contact Number", width: 150 },
  ];

  const filteredRows = filteredBeneficiaries.filter((beneficiary) =>
    Object.values(beneficiary).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1000,
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
        <Stack direction="row" spacing={2} mb={2} alignItems="center">
          <FormControl fullWidth>
            <InputLabel id="sex-select-label">Sex</InputLabel>
            <Select
              labelId="sex-select-label"
              value={selectedSex}
              label="Sex"
              onChange={(e) => {
                setSelectedSex(e.target.value);
                console.log("Selected Sex:", e.target.value);
              }}
            >
              {sexOptions.map((sex) => (
                <MenuItem key={sex} value={sex}>
                  {sex}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="primary-type-select-label">Primary Type</InputLabel>
            <Select
              labelId="primary-type-select-label"
              value={selectedPrimaryType}
              label="Primary Type"
              onChange={(e) => {
                setSelectedPrimaryType(e.target.value);
                console.log("Selected Primary Type:", e.target.value);
              }}
            >
              {primaryTypes.map((type) => (
                <MenuItem key={type.primaryTypeId} value={type.primaryTypeId}>
                  {type.typeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="secondary-type-select-label">
              Secondary Type
            </InputLabel>
            <Select
              labelId="secondary-type-select-label"
              value={selectedSecondaryType}
              label="Secondary Type"
              onChange={(e) => {
                setSelectedSecondaryType(e.target.value);
                console.log("Selected Secondary Type:", e.target.value);
              }}
            >
              {secondaryTypes.map((type) => (
                <MenuItem key={type.typeId} value={type.typeId}>
                  {type.typeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="tertiary-type-select-label">
              Tertiary Type
            </InputLabel>
            <Select
              labelId="tertiary-type-select-label"
              value={selectedTertiaryType}
              label="Tertiary Type"
              onChange={(e) => {
                setSelectedTertiaryType(e.target.value);
                console.log("Selected Tertiary Type:", e.target.value);
              }}
            >
              {tertiaryTypes.map((type) => (
                <MenuItem key={type.typeId} value={type.typeId}>
                  {type.typeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <div style={{ height: 400, width: "100%", marginBottom: 16 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={5}
            columnVisibilityModel={{
              beneficiaryId: false,
            }}
            getRowHeight={() => 130}
            checkboxSelection
            onRowSelectionModelChange={handleSelectionModelChange}
            getRowId={(row) => row.beneficiaryId}
          />
        </div>
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
