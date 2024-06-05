import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { login } from "../../functions/authentication";
import useAuthStore from "../../stores/authStore";

const Login = () => {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [loginSuccess, setLoginSuccess] = useState(false); // State to track login success
  const [openSnackbar, setOpenSnackbar] = useState(false); // State to control Snackbar

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    onSubmit: async (values) => {
      try {
        const data = await login(values.username, values.password);
        if (data.user && (data.user.role === "1" || data.user.role === "2")) {
          storeLogin(data.user);
          setLoginSuccess(true); // Set login success to true
          setOpenSnackbar(true); // Open Snackbar
          setTimeout(() => navigate("/app/dashboard"), 2000); // Navigate after 2 seconds
        } else {
          throw new Error("Unauthorized");
        }
      } catch (error) {
        console.error("Login failed:", error.message || "Unauthorized access");
        setLoginSuccess(false); // Reset login success if login fails
        setOpenSnackbar(true); // Open Snackbar for error
      }
    },
  });

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Close Snackbar
  };

  return (
    <Box
      sx={{
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400, p: 3 }}>
        <Box display="flex" justifyContent="center" mb={3}>
          <img
            src="/assets/pol-logo.jpg"
            alt="Logo"
            style={{ width: "100px", height: "100px" }}
          />
        </Box>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" sx={{ mb: 3 }}>
              Login
            </Typography>
            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              sx={{ width: "100%" }}
            >
              <TextField
                label="Username"
                variant="outlined"
                margin="normal"
                required
                name="username"
                onChange={formik.handleChange}
                value={formik.values.username}
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                required
                name="password"
                onChange={formik.handleChange}
                value={formik.values.password}
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2, backgroundColor: "green" }}
                fullWidth
              >
                Login
              </Button>
            </Box>
            <Snackbar
              open={openSnackbar}
              autoHideDuration={3000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: "top", horizontal: "center" }} // Set Snackbar position
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity={loginSuccess ? "success" : "error"}
                sx={{ width: "100%" }}
              >
                {loginSuccess
                  ? "Login successful! Redirecting to dashboard..."
                  : "Login failed: Unauthorized access"}
              </Alert>
            </Snackbar>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
