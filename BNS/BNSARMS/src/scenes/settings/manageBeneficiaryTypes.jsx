import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import Header from "../../components/Header";
import axios from "axios";
import { useSnackbar } from "../../context/SnackbarContext";
import { useNavigate, useLocation } from "react-router-dom";

const ManageBeneficiaryTypesPage = () => {
  const [subTypes, setSubTypes] = useState([]);
  const [ageGroupChecked, setAgeGroupChecked] = useState({
    Infant: false,
    Toddler: false,
    Child: false,
    Teen: false,
    Adult: false,
    "Senior Citizen": false,
  });
  const [sexChecked, setSexChecked] = useState({
    Male: false,
    Female: false,
  });
  const [typeName, setTypeName] = useState("");
  const [typeNameError, setTypeNameError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { state } = useLocation();
  const isEditMode = state && state.type;

  useEffect(() => {
    if (isEditMode) {
      const { typeName, ageGroups, sex, subTypes } = state.type;
      setTypeName(typeName);
      setAgeGroupChecked((prev) =>
        Object.keys(prev).reduce((acc, key) => {
          acc[key] = ageGroups.includes(key);
          return acc;
        }, {})
      );
      setSexChecked((prev) =>
        Object.keys(prev).reduce((acc, key) => {
          acc[key] = sex.includes(key);
          return acc;
        }, {})
      );
      setSubTypes(subTypes);
    }
  }, [isEditMode, state]);

  const handleAddSubtype = () => {
    setSubTypes([...subTypes, ""]);
  };

  const handleSubtypeChange = (index, value) => {
    const updatedSubTypes = subTypes.map((subType, i) =>
      i === index ? value : subType
    );
    setSubTypes(updatedSubTypes);
  };

  const handleSelectAll = (group) => {
    if (group === "ageGroup") {
      const allChecked = !Object.values(ageGroupChecked).every(Boolean);
      setAgeGroupChecked({
        Infant: allChecked,
        Toddler: allChecked,
        Child: allChecked,
        Teen: allChecked,
        Adult: allChecked,
        "Senior Citizen": allChecked,
      });
    } else if (group === "sex") {
      const allChecked = !Object.values(sexChecked).every(Boolean);
      setSexChecked({
        Male: allChecked,
        Female: allChecked,
      });
    }
  };

  useEffect(() => {
    const checkDuplicateTypeName = async () => {
      if (typeName && !isEditMode) {
        try {
          const response = await axios.post(
            "http://localhost:3000/types/check-duplicate",
            { typeName }
          );
          setTypeNameError(
            response.data.isDuplicate ? "Type name already exists" : ""
          );
        } catch (error) {
          console.error("Error checking duplicate type name:", error);
        }
      } else {
        setTypeNameError("");
      }
    };
    checkDuplicateTypeName();
  }, [typeName, isEditMode]);

  const validateForm = async () => {
    if (!typeName) {
      setTypeNameError("Type name is required");
      return false;
    }

    if (typeNameError) {
      return false;
    }

    if (
      !Object.values(ageGroupChecked).some((checked) => checked) ||
      !Object.values(sexChecked).some((checked) => checked)
    ) {
      alert("Please select at least one age group and one sex");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSaving(true);
    try {
      const payload = {
        typeName,
        ageGroups: Object.keys(ageGroupChecked).filter(
          (key) => ageGroupChecked[key]
        ),
        sex: Object.keys(sexChecked).filter((key) => sexChecked[key]),
        subTypes,
      };

      if (isEditMode) {
        await axios.put(
          `http://localhost:3000/types/${state.type.typeId}`,
          payload
        );
        console.log("Type updated successfully");
        showSnackbar("Type updated successfully", "success");
      } else {
        await axios.post("http://localhost:3000/types", payload);
        console.log("New type saved successfully");
        showSnackbar("New type saved successfully", "success");
      }

      navigate("/app/viewtypes");
    } catch (error) {
      console.error("Error saving type:", error);
      showSnackbar(`Error ${isEditMode ? "updating" : "saving"} type`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      typeName &&
      !typeNameError &&
      Object.values(ageGroupChecked).some((checked) => checked) &&
      Object.values(sexChecked).some((checked) => checked)
    );
  };

  return (
    <Box m={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Beneficiary Type"
          subtitle={`${isEditMode ? "Edit" : "Create New"} Beneficiary Type`}
        />
      </Box>
      <Box>
        <Typography variant="body1" fontWeight="bold" fontSize={18}>
          Beneficiary Type Name:
        </Typography>
        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
          Enter the name of the {isEditMode ? "existing" : "new"} Beneficiary
          Type
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          name="Beneficiary Type Name"
          label="Beneficiary Type Name"
          type="text"
          sx={{ width: "20%" }}
          value={typeName}
          onChange={(e) => setTypeName(e.target.value)}
        />
        {typeNameError && (
          <Typography color="error">{typeNameError}</Typography>
        )}
      </Box>
      <Box mt={2}>
        <Typography variant="body1" fontWeight="bold" fontSize={18}>
          Age Group:
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          This beneficiary type will appear for the following selected age group
          (Choose at least one).
        </Typography>
        <Box display="flex" flexDirection="column" mt={1}>
          <Typography
            variant="body2"
            color="primary"
            style={{ cursor: "pointer" }}
            onClick={() => handleSelectAll("ageGroup")}
          >
            <IconButton size="small" color="primary">
              {Object.values(ageGroupChecked).every(Boolean) ? (
                <CheckBoxIcon />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )}
            </IconButton>
            Select All
          </Typography>
          {[
            "Infant",
            "Toddler",
            "Child",
            "Teen",
            "Adult",
            "Senior Citizen",
          ].map((label) => (
            <FormControlLabel
              key={label}
              control={<Checkbox checked={ageGroupChecked[label]} />}
              label={label}
              onChange={() =>
                setAgeGroupChecked((prev) => ({
                  ...prev,
                  [label]: !prev[label],
                }))
              }
              sx={{ ml: 2 }}
            />
          ))}
        </Box>
      </Box>
      <Box mt={2}>
        <Typography variant="body1" fontWeight="bold" fontSize={18}>
          Sex:
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          This beneficiary type will appear for the following selected sex
          (Choose at least one).
        </Typography>
        <Box display="flex" flexDirection="column" mt={1}>
          <Typography
            variant="body2"
            color="primary"
            style={{ cursor: "pointer" }}
            onClick={() => handleSelectAll("sex")}
          >
            <IconButton size="small" color="primary">
              {Object.values(sexChecked).every(Boolean) ? (
                <CheckBoxIcon />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )}
            </IconButton>
            Select All
          </Typography>
          {["Male", "Female"].map((label) => (
            <FormControlLabel
              key={label}
              control={<Checkbox checked={sexChecked[label]} />}
              label={label}
              onChange={() =>
                setSexChecked((prev) => ({
                  ...prev,
                  [label]: !prev[label],
                }))
              }
              sx={{ ml: 2 }}
            />
          ))}
        </Box>
      </Box>
      <Box mt={2}>
        <Typography variant="body1" fontWeight="bold" fontSize={18}>
          Sub Types:
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          You can add sub types for the Beneficiary Type. These subtypes will
          only appear if the current beneficiary type is selected in the New
          Beneficiary Form.
        </Typography>
        <Box mt={1} ml={2}>
          {subTypes.map((subType, index) => (
            <Box key={index} display="flex" alignItems="center" mt={1}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Add a Subtype for this Type"
                value={subType}
                onChange={(e) => handleSubtypeChange(index, e.target.value)}
                sx={{ width: "20%" }}
              />
            </Box>
          ))}
          {subTypes.length === 0 ||
          (subTypes.length > 0 && subTypes[subTypes.length - 1]) ? (
            <Typography
              variant="body2"
              color="primary"
              style={{ cursor: "pointer" }}
              onClick={handleAddSubtype}
              mt={2}
            >
              <IconButton size="small" color="primary">
                <AddIcon />
              </IconButton>
              Add Subtype
            </Typography>
          ) : null}
        </Box>
      </Box>
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            /* Handle cancel action */
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!isFormValid() || isSaving}
          sx={{ ml: 2 }}
        >
          {isEditMode ? "Update" : "Save"}
        </Button>
      </Box>
    </Box>
  );
};

export default ManageBeneficiaryTypesPage;
