/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  Alert,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/authStore";
import dayjs from "dayjs";
import { useSnackbar } from "../../context/SnackbarContext";

const initialFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  barangay: "",
  healthStation: "",
  sex: "Male",
  job: "",
  birthdate: "",
  ageGroup: "",
  civilStatus: "",
  contactNumber: "",
  types: [],
  subType: "", // Corrected casing
};

const barangayOptions = [
  "Bentung",
  "Cannery Site",
  "Crossing Palkan",
  "Glamang",
  "Kinilis",
  "Klinan 6",
  "Koronadal Proper",
  "Lamcaliaf",
  "Landan",
  "Lapu",
  "Magsaysay",
  "Maligo",
  "Pagalungan",
  "Palkan",
  "Poblacion",
  "Polo",
  "Rubber",
  "Silway-7",
  "Silway-8",
  "Sulit",
  "Sumbakil",
  "Upper Klinan",
].sort();

const civilStatusOptions = [
  "Single",
  "Married",
  "Widowed",
  "Legally Separated",
];

const parseSubtypes = (subtypesStringArray) => {
  try {
    return subtypesStringArray.map((subtype) => ({
      typeId: subtype,
      typeName: subtype,
    }));
  } catch (error) {
    console.error("Error parsing subtypes:", error);
    return [];
  }
};

const NewBeneficiaryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const beneficiary = location.state?.beneficiary || null;
  const { user } = useAuthStore();
  const { showSnackbar } = useSnackbar();
  const [existingBeneficiaryWarning, setExistingBeneficiaryWarning] =
    useState("");

  const [formData, setFormData] = useState({
    ...initialFormData,
    barangay: user?.barangay || "Cannery Site",
  });
  const [age, setAge] = useState("");
  const [types, setTypes] = useState([]);
  const [subtypes, setSubtypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [typeSubtypes, setTypeSubtypes] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const calculateAge = (birthdate) => {
    if (!birthdate) return "";
    const birth = dayjs(birthdate);
    const today = dayjs();
    const years = today.diff(birth, "year");
    const months = today.diff(birth.add(years, "year"), "month");
    const weeks = today.diff(birth.add(months, "month"), "week");
    const days = today.diff(birth.add(weeks, "week"), "day");

    if (years > 0) {
      return `${years} Years and ${months} Months Old`;
    } else if (months > 0) {
      return `${months} Months Old`;
    } else if (weeks > 0) {
      return `${weeks} Weeks Old`;
    } else {
      return `${days} Days Old`;
    }
  };

  useEffect(() => {
    const calculateAge = (birthdate) => {
      if (!birthdate) return "";
      const birth = dayjs(birthdate);
      const today = dayjs();
      const years = today.diff(birth, "year");
      const months = today.diff(birth.add(years, "year"), "month");
      const weeks = today.diff(birth.add(months, "month"), "week");
      const days = today.diff(birth.add(weeks, "week"), "day");

      if (years > 0) {
        return `${years} Years and ${months} Months Old`;
      } else if (months > 0) {
        return `${months} Months Old`;
      } else if (weeks > 0) {
        return `${weeks} Weeks Old`;
      } else {
        return `${days} Days Old`;
      }
    };

    const determineAgeGroup = (birthdate) => {
      if (!birthdate) return "";
      const birth = dayjs(birthdate);
      const today = dayjs();
      const ageInYears = today.diff(birth, "year");

      if (ageInYears < 1) return "Infant";
      if (ageInYears < 3) return "Toddler";
      if (ageInYears < 12) return "Child";
      if (ageInYears < 18) return "Teen";
      if (ageInYears < 60) return "Adult";
      return "Senior Citizen";
    };

    setAge(calculateAge(formData.birthdate));
    const ageGroup = determineAgeGroup(formData.birthdate);
    setFormData((prev) => ({ ...prev, ageGroup }));

    if (ageGroup && formData.sex) {
      fetchTypes(ageGroup, formData.sex);
    }
  }, [formData.birthdate, formData.sex]);

  const checkExistingBeneficiary = async (firstName, middleName, lastName) => {
    try {
      const response = await axios.get(
        "http://localhost:3000/beneficiaries/check-existing",
        {
          params: { firstName, middleName, lastName },
        }
      );
      if (response.data.exists) {
        setExistingBeneficiaryWarning(
          `Beneficiary already exists: ${response.data.beneficiary.firstName} ${response.data.beneficiary.middleName} ${response.data.beneficiary.lastName}`
        );
        showSnackbar(
          `Beneficiary already exists: ${response.data.beneficiary.firstName} ${response.data.beneficiary.middleName} ${response.data.beneficiary.lastName}`,
          "error"
        );
      } else {
        setExistingBeneficiaryWarning("");
      }
    } catch (error) {
      console.error("Error checking existing beneficiary:", error);
    }
  };

  useEffect(() => {
    if (beneficiary) {
      console.log("Beneficiary data on load:", beneficiary);
      setFormData({
        firstName: beneficiary.firstName,
        middleName: beneficiary.middleName || "",
        lastName: beneficiary.lastName,
        suffix: beneficiary.suffix || "",
        birthdate: beneficiary.birthdate
          ? dayjs(beneficiary.birthdate).format("YYYY-MM-DD")
          : "",
        barangay: beneficiary.barangay,
        healthStation: beneficiary.healthStation,
        sex: beneficiary.sex,
        job: beneficiary.job,
        ageGroup: beneficiary.ageGroup || "",
        civilStatus: beneficiary.civilStatus || "",
        contactNumber: beneficiary.contactNumber || "",
        types: Array.isArray(beneficiary.beneficiaryTypes)
          ? beneficiary.beneficiaryTypes.map((type) => type.typeId)
          : [], // Ensure types is an array
        subType: beneficiary.subType || "", // Set subtype
      });

      // Fetch types and subtypes for the beneficiary's age group and sex
      const fetchTypesAndSubtypes = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3000/beneficiaries/types?ageGroup=${beneficiary.ageGroup}&sex=${beneficiary.sex}`
          );
          setTypes(response.data);
          console.log("Fetched types:", response.data);

          // Fetch subtypes for each type
          const subtypesData = {};
          for (const type of response.data) {
            const subtypesResponse = await axios.get(
              `http://localhost:3000/beneficiaries/subtypes?typeId=${type.typeId}`
            );
            subtypesData[type.typeId] = parseSubtypes(subtypesResponse.data);
          }
          setTypeSubtypes(subtypesData);
          console.log("Fetched subtypes:", subtypesData);

          // Set the selected type if there is a subtype
          if (beneficiary.subType) {
            const selectedType = response.data.find((type) =>
              subtypesData[type.typeId].some(
                (subtype) => subtype.typeName === beneficiary.subType
              )
            );
            setSelectedType(selectedType?.typeId || null);
          }
        } catch (error) {
          console.error("Error fetching types and subtypes:", error);
        }
      };

      fetchTypesAndSubtypes();
    }
  }, [beneficiary]);

  const fetchTypes = async (ageGroup, sex) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/beneficiaries/types?ageGroup=${ageGroup}&sex=${sex}`
      );
      setTypes(response.data);
      setSubtypes([]);
      setSelectedType(null);
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

  const fetchSubtypes = async (typeId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/beneficiaries/subtypes?typeId=${typeId}`
      );
      const parsedSubtypes = parseSubtypes(response.data);
      setTypeSubtypes((prev) => ({ ...prev, [typeId]: parsedSubtypes }));
    } catch (error) {
      console.error("Error fetching subtypes:", error);
      setTypeSubtypes((prev) => ({ ...prev, [typeId]: [] }));
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "firstName" || name === "middleName" || name === "lastName") {
      checkExistingBeneficiary(
        name === "firstName" ? value : formData.firstName,
        name === "middleName" ? value : formData.middleName,
        name === "lastName" ? value : formData.lastName
      );
    }
  };

  const handleTypeChange = (event) => {
    const { value, checked } = event.target;
    const selectedTypeId = parseInt(value, 10);

    setFormData((prev) => {
      const updatedTypes = checked
        ? [...prev.types, selectedTypeId]
        : prev.types.filter((typeId) => typeId !== selectedTypeId);

      if (checked) {
        fetchSubtypes(selectedTypeId);
        setSelectedType(selectedTypeId);
      } else {
        if (selectedType === selectedTypeId) {
          setSelectedType(null);
        }
        return { ...prev, types: updatedTypes, subType: "" }; // Corrected casing
      }

      return { ...prev, types: updatedTypes };
    });
  };

  const handleSubtypeChange = (event) => {
    const { value } = event.target;
    console.log("Selected subType:", value); // Log the selected subType
    setFormData((prev) => ({ ...prev, subType: value })); // Corrected casing
  };

  const handleClearSelection = () => {
    setFormData((prev) => ({ ...prev, subtype: "" }));
  };

  const handleCancel = () => {
    navigate("/app/beneficiaries");
  };

  const handleSave = async () => {
    if (errorMessage) return;

    const ageValue = calculateAge(formData.birthdate); // Calculate age before saving
    console.log("Form data before saving:", { ...formData, age: ageValue }); // Log form data

    try {
      const response = await axios.post(
        "http://localhost:3000/beneficiaries",
        { ...formData, age: ageValue } // Include age in the form data
      );
      console.log("Beneficiary successfully added:", response.data);
      showSnackbar("Beneficiary successfully added", "success");
      navigate("/app/beneficiaries");
    } catch (error) {
      console.error("Error saving beneficiary:", error);
      showSnackbar("Error saving beneficiary", "error");
    }
  };

  const handleUpdate = async () => {
    if (errorMessage) return;

    const ageValue = calculateAge(formData.birthdate); // Calculate age before updating
    console.log("Form data before updating:", { ...formData, age: ageValue }); // Log form data

    try {
      const response = await axios.put(
        `http://localhost:3000/beneficiaries/${beneficiary.beneficiaryId}`,
        { ...formData, age: ageValue } // Include age in the form data
      );
      console.log("Beneficiary successfully updated:", response.data);
      showSnackbar("Beneficiary successfully updated", "success");
      navigate("/app/beneficiaries");
    } catch (error) {
      console.error("Error updating beneficiary:", error);
      showSnackbar("Error updating beneficiary", "error");
    }
  };

  return (
    <Box p="20px">
      <Typography variant="h4" mb="20px">
        {beneficiary ? "Edit Beneficiary" : "Add New Beneficiary"}
      </Typography>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      <form noValidate autoComplete="off">
        <Grid container spacing={2} direction="column">
          {existingBeneficiaryWarning && (
            <Typography
              color="error"
              variant="body1"
              gutterBottom
              sx={{ ml: 2 }}
            >
              {existingBeneficiaryWarning}
            </Typography>
          )}
          <Grid item xs={12}>
            <TextField
              autoFocus
              margin="dense"
              name="lastName"
              label="Last Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              name="firstName"
              label="First Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item container spacing={2} xs={12}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="middleName"
                label="Middle Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.middleName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="suffix"
                label="Suffix"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.suffix}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense" required>
              <InputLabel id="sex-label">Sex</InputLabel>
              <Select
                labelId="sex-label"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                label="Sex"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item container spacing={2} xs={12}>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                name="birthdate"
                label="Birthdate"
                type="date"
                fullWidth
                variant="outlined"
                value={formData.birthdate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                name="age"
                label="Age"
                type="text"
                fullWidth
                variant="outlined"
                value={age}
                InputProps={{
                  readOnly: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                name="ageGroup"
                label="Age Group"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.ageGroup}
                InputProps={{
                  readOnly: true,
                }}
                required
              />
            </Grid>
          </Grid>

          {/* Types switches */}
          <Grid item xs={12}>
            <Typography variant="h6">Select Types</Typography>
            {types.map((type) => (
              <Box key={type.typeId} mb={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.types.includes(type.typeId)}
                      onChange={handleTypeChange}
                      value={type.typeId.toString()}
                      color="success"
                    />
                  }
                  label={type.typeName}
                />
                {/* Display subtypes if type is selected */}
                {formData.types.includes(type.typeId) &&
                  typeSubtypes[type.typeId]?.length > 0 && (
                    <Box ml={4}>
                      <RadioGroup
                        name="subtype"
                        value={formData.subType} // Reflect selected subtype
                        onChange={handleSubtypeChange}
                      >
                        {typeSubtypes[type.typeId].map((subtype) => (
                          <FormControlLabel
                            key={subtype.typeId}
                            value={subtype.typeId}
                            control={<Radio />}
                            label={subtype.typeName}
                          />
                        ))}
                      </RadioGroup>
                      <Button
                        size="small"
                        color="primary"
                        onClick={handleClearSelection}
                      >
                        Clear selection
                      </Button>
                    </Box>
                  )}
              </Box>
            ))}
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth margin="dense" required>
              <InputLabel id="barangay-label">Barangay</InputLabel>
              <Select
                labelId="barangay-label"
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                label="Barangay"
              >
                {barangayOptions.map((barangay) => (
                  <MenuItem key={barangay} value={barangay}>
                    {barangay}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense" required>
              <InputLabel id="healthStation-label">Health Station</InputLabel>
              <Select
                labelId="healthStation-label"
                name="healthStation"
                value={formData.healthStation}
                onChange={handleChange}
                label="Health Station"
              >
                {[1, 2, 3, 4, 5, 6].map((healthStation) => (
                  <MenuItem key={healthStation} value={healthStation}>
                    {healthStation}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense" required>
              <InputLabel id="civilStatus-label">Civil Status</InputLabel>
              <Select
                labelId="civilStatus-label"
                name="civilStatus"
                value={formData.civilStatus}
                onChange={handleChange}
                label="Civil Status"
              >
                {civilStatusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              name="contactNumber"
              label="Contact Number"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.contactNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              name="job"
              label="Job"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.job}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Box mt="20px">
          <Button onClick={handleCancel} color="secondary">
            Cancel
          </Button>
          {beneficiary ? (
            <Button
              onClick={handleUpdate}
              color="primary"
              disabled={!formData.civilStatus}
            >
              Update
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              color="primary"
              disabled={!formData.civilStatus}
            >
              Save
            </Button>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default NewBeneficiaryPage;
