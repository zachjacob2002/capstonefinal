import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PropTypes from "prop-types";
import useUserStore from "../../stores/useUserStore";
import axios from "axios";
import { useSnackbar } from "../../context/SnackbarContext";

const initialFormData = {
  firstName: "",
  lastName: "",
  username: "",
  password: "",
  sex: "",
  barangay: "",
};

const sexOptions = ["Male", "Female"];
const barangayOptions = [
  "Glamang",
  "Poblacion",
  "Silway-8",
  "Silway-7",
  "Magsaysay",
  "Palkan",
];

const NewBNS = ({ open, handleClose, user }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const { showSnackbar } = useSnackbar();
  const { addUser, updateUser } = useUserStore((state) => ({
    addUser: state.addUser,
    updateUser: state.updateUser,
  }));

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        password: "********",
        sex: user.sex || "",
        barangay: user.barangay || "",
      });
      console.log("Current user data:", user);
    } else {
      setFormData(initialFormData);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "password" && value === "********" ? "" : value,
    }));

    if (name === "password" && value !== "********" && value !== "") {
      const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(value);
      setPasswordError(isAlphanumeric ? "" : "Password must be alphanumeric");
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid = () => {
    return (
      Object.values(formData).every((value) => value.trim() !== "") &&
      (formData.password === "" ||
        formData.password === "********" ||
        /^[a-zA-Z0-9]+$/.test(formData.password))
    );
  };

  const handleSave = async () => {
    const url =
      user && user.id
        ? `http://localhost:3000/bns/update/${user.id}`
        : "http://localhost:3000/bns";
    const method = user && user.id ? "put" : "post";

    const dataToSend = { ...formData };
    if (formData.password === "********" || formData.password === "") {
      delete dataToSend.password;
    }

    try {
      const response = await axios({
        method,
        url,
        data: {
          ...dataToSend,
          role: "2",
        },
      });
      const newUser = response.data;
      if (user && user.id) {
        updateUser(newUser);
      } else {
        addUser(newUser);
      }
      showSnackbar(
        user ? "BNS updated successfully" : "BNS created successfully",
        "success"
      );
      setFormData(initialFormData);
      handleClose();
    } catch (error) {
      console.error("Failed to save user:", error);
      showSnackbar(
        `Failed to save the user: ${
          error.response?.data?.error || error.message
        }`,
        "error"
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{user ? "Edit BNS" : "Add New BNS"}</DialogTitle>
      <DialogContent>
        {Object.keys(initialFormData).map((field) => {
          if (field === "sex" || field === "barangay") {
            return (
              <FormControl fullWidth margin="dense" key={field}>
                <InputLabel>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </InputLabel>
                <Select
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                >
                  {(field === "sex" ? sexOptions : barangayOptions).map(
                    (option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            );
          } else {
            return (
              <TextField
                key={field}
                autoFocus={field === "firstName"}
                margin="dense"
                name={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                fullWidth
                variant="outlined"
                type={
                  field === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : "text"
                }
                value={formData[field]}
                onChange={handleChange}
                placeholder={
                  field === "password" && user
                    ? "Enter new password to update"
                    : ""
                }
                InputProps={
                  field === "password"
                    ? {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                        autoComplete: "new-password", // Prevent autofill for password
                      }
                    : field === "username"
                    ? {
                        autoComplete: "new-username", // Prevent autofill for username
                      }
                    : null
                }
                error={field === "password" && passwordError !== ""}
                helperText={field === "password" ? passwordError : ""}
              />
            );
          }
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={!isFormValid()}>
          {user ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

NewBNS.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default NewBNS;
