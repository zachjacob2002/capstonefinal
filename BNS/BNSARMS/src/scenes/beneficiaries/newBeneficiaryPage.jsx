// NewBeneficiaryPage.jsx
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
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Alert,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import dayjs from "dayjs";
import {
  fetchSecondaryTypesByPrimarySex,
  fetchTertiaryTypesBySecondary,
} from "../../functions/forTypes";
import {
  createBeneficiary,
  checkExistingBeneficiary,
  updateBeneficiary,
} from "../../functions/forBeneficiaries";
import { useSnackbar } from "../../context/SnackbarContext"; // Import useSnackbar

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
  primaryType: "",
  civilStatus: "",
  contactNumber: "",
  secondaryTypes: [],
  tertiaryType: "",
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

const NewBeneficiaryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const beneficiary = location.state?.beneficiary || null;
  const { user } = useAuthStore();
  const { showSnackbar } = useSnackbar(); // Use the snackbar context

  const [formData, setFormData] = useState({
    ...initialFormData,
    barangay: user?.barangay || "Cannery Site",
  });
  const [age, setAge] = useState("");
  const [secondaryTypes, setSecondaryTypes] = useState([]);
  const [tertiaryTypes, setTertiaryTypes] = useState([]);
  const [selectedSecondaryType, setSelectedSecondaryType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (beneficiary) {
      setFormData({
        firstName: beneficiary.firstName,
        middleName: beneficiary.middleName || "",
        lastName: beneficiary.lastName,
        suffix: beneficiary.suffix || "",
        birthdate: beneficiary.birthdate
          ? dayjs(beneficiary.birthdate).format("YYYY-MM-DD") // Format birthdate
          : "",
        barangay: beneficiary.barangay,
        healthStation: beneficiary.healthStation,
        sex: beneficiary.sex,
        job: beneficiary.job,
        primaryType: beneficiary.primaryType || "",
        civilStatus: beneficiary.civilStatus || "",
        contactNumber: beneficiary.contactNumber || "",
        secondaryTypes: beneficiary.secondaryTypeIds || [],
        tertiaryType: beneficiary.tertiaryTypeId || "",
      });
    }
  }, [beneficiary]);

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

    setAge(calculateAge(formData.birthdate));

    const determinePrimaryType = (birthdate) => {
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

    const primaryType = determinePrimaryType(formData.birthdate);
    setFormData((prev) => ({ ...prev, primaryType }));

    const fetchSecondary = async () => {
      if (primaryType && formData.sex) {
        const data = await fetchSecondaryTypesByPrimarySex(
          primaryType,
          formData.sex
        );
        setSecondaryTypes(data);

        if (beneficiary && beneficiary.secondaryTypeIds) {
          const fetchedSecondaryTypeIds = data.map((type) => type.typeId);
          setFormData((prev) => ({
            ...prev,
            secondaryTypes: beneficiary.secondaryTypeIds.filter((typeId) =>
              fetchedSecondaryTypeIds.includes(typeId)
            ),
          }));

          // Set the selected secondary type to trigger tertiary type fetching
          if (beneficiary.secondaryTypeIds.length > 0) {
            setSelectedSecondaryType(beneficiary.secondaryTypeIds[0]);
          }
        }
      }
    };

    fetchSecondary();
  }, [formData.birthdate, formData.sex, beneficiary]);

  useEffect(() => {
    const fetchTertiary = async () => {
      if (selectedSecondaryType) {
        const data = await fetchTertiaryTypesBySecondary(selectedSecondaryType);
        setTertiaryTypes(data);

        if (beneficiary && beneficiary.tertiaryTypeId) {
          const fetchedTertiaryTypeIds = data.map((type) => type.typeId);
          if (fetchedTertiaryTypeIds.includes(beneficiary.tertiaryTypeId)) {
            setFormData((prev) => ({
              ...prev,
              tertiaryType: beneficiary.tertiaryTypeId,
            }));
          }
        }
      }
    };

    fetchTertiary();
  }, [selectedSecondaryType, beneficiary]);

  const handleChange = async (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (["firstName", "middleName", "lastName", "suffix"].includes(name)) {
      try {
        const exists = await checkExistingBeneficiary({
          firstName: name === "firstName" ? value : formData.firstName,
          middleName: name === "middleName" ? value : formData.middleName,
          lastName: name === "lastName" ? value : formData.lastName,
          suffix: name === "suffix" ? value : formData.suffix,
        });

        if (exists) {
          setErrorMessage("Beneficiary already exists");
        } else {
          setErrorMessage("");
        }
      } catch (error) {
        console.error("Failed to check beneficiary existence:", error);
      }
    }
  };

  const handleCheckboxChange = async (event) => {
    const { name, checked } = event.target;
    const nameAsNumber = parseInt(name, 10);
    setFormData((prev) => {
      const newSecondaryTypes = checked
        ? [...prev.secondaryTypes, nameAsNumber]
        : prev.secondaryTypes.filter((type) => type !== nameAsNumber);
      return { ...prev, secondaryTypes: newSecondaryTypes };
    });

    if (checked) {
      const data = await fetchTertiaryTypesBySecondary(nameAsNumber);
      setTertiaryTypes(data);
      setSelectedSecondaryType(nameAsNumber);
    } else {
      setTertiaryTypes([]);
      setSelectedSecondaryType("");
    }
  };

  const handleRadioChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({ ...prev, tertiaryType: parseInt(value, 10) }));
  };

  const clearTertiarySelection = () => {
    setFormData((prev) => ({ ...prev, tertiaryType: "" }));
  };

  const handleCancel = () => {
    navigate("/app/beneficiaries");
  };

  const handleSave = async () => {
    if (errorMessage) return;

    try {
      await createBeneficiary({
        ...formData,
        healthStation: String(formData.healthStation),
        age,
      });
      showSnackbar("Beneficiary successfully added", "success");
      navigate("/app/beneficiaries");
    } catch (error) {
      console.error("Failed to save beneficiary:", error);
      showSnackbar("Failed to add beneficiary", "error");
    }
  };

  const handleUpdate = async () => {
    if (errorMessage) return;

    try {
      await updateBeneficiary(beneficiary.beneficiaryId, {
        ...formData,
        healthStation: String(formData.healthStation),
        age,
      });
      showSnackbar("Beneficiary successfully updated", "success");
      navigate("/app/beneficiaries");
    } catch (error) {
      console.error("Failed to update beneficiary:", error);
      showSnackbar("Failed to update beneficiary", "error");
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
                required
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
                name="primaryType"
                label="Age Group"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.primaryType}
                InputProps={{
                  readOnly: true,
                }}
                required
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Select Types</Typography>
            {secondaryTypes.map((type) => (
              <FormControlLabel
                key={type.typeId}
                control={
                  <Checkbox
                    checked={formData.secondaryTypes.includes(type.typeId)}
                    onChange={handleCheckboxChange}
                    name={type.typeId.toString()}
                  />
                }
                label={type.typeName}
              />
            ))}
          </Grid>
          {selectedSecondaryType && (
            <Grid item xs={12}>
              <Typography variant="h6"></Typography>
              <RadioGroup
                name="tertiaryType"
                value={formData.tertiaryType}
                onChange={handleRadioChange}
              >
                {tertiaryTypes.map((type) => (
                  <FormControlLabel
                    key={type.typeId}
                    value={type.typeId.toString()}
                    control={<Radio />}
                    label={type.typeName}
                  />
                ))}
              </RadioGroup>
              {formData.tertiaryType && (
                <Button onClick={clearTertiarySelection} color="primary">
                  Clear Selection
                </Button>
              )}
            </Grid>
          )}
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
              required
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
              required
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
