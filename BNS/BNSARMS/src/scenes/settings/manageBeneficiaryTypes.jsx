// manageBeneficaryType.jsx

import { useState } from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import Header from "../../components/Header";

const ManageBeneficiaryTypesPage = () => {
  const [subTypes, setSubTypes] = useState([]);
  const [ageGroupChecked, setAgeGroupChecked] = useState({
    all: false,
    Infant: false,
    Toddler: false,
    Child: false,
    Teen: false,
    Adult: false,
    "Senior Citizen": false,
  });
  const [sexChecked, setSexChecked] = useState({
    all: false,
    Male: false,
    Female: false,
  });

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
      const newChecked = !ageGroupChecked.all;
      setAgeGroupChecked({
        all: newChecked,
        Infant: newChecked,
        Toddler: newChecked,
        Child: newChecked,
        Teen: newChecked,
        Adult: newChecked,
        "Senior Citizen": newChecked,
      });
    } else if (group === "sex") {
      const newChecked = !sexChecked.all;
      setSexChecked({
        all: newChecked,
        Male: newChecked,
        Female: newChecked,
      });
    }
  };

  return (
    <Box m={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Beneficiary Type"
          subtitle="Create New Beneficiary Type"
        />
      </Box>
      <Box>
        <Typography variant="body1" fontWeight="bold" fontSize={18}>
          Beneficiary Type Name:
        </Typography>
        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
          Enter the name of the New Beneficiary Type
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          name="Beneficiary Type Name"
          label="Beneficiary Type Name"
          type="text"
          sx={{ width: "20%" }}
        />
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
              {ageGroupChecked.all ? (
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
              {sexChecked.all ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
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
    </Box>
  );
};

export default ManageBeneficiaryTypesPage;
