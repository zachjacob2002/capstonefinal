import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  TextField,
  Button,
  Paper,
  Menu,
  MenuItem,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogContent,
} from "@mui/material";

import {
  fetchReportById,
  submitFeedback,
  updateReportStatus,
} from "../../functions/reportSubmit";
import useAuthStore from "../../stores/authStore";

const BnsSubmissionDetails = () => {
  const { reportId } = useParams();
  const [reportDetails, setReportDetails] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const { user } = useAuthStore(); // Assumes useAuthStore correctly provides user info
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus) => {
    setPendingStatus(newStatus);
    setDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    try {
      const response = await updateReportStatus(reportId, pendingStatus);
      setReportDetails({ ...reportDetails, status: pendingStatus });
      console.log("Status updated:", response);
    } catch (error) {
      console.error("Error updating report status:", error);
    }
    setDialogOpen(false);
    handleMenuClose();
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackText.trim()) {
      try {
        const response = await submitFeedback(
          reportId,
          user.user_id,
          feedbackText
        );
        console.log("Feedback submitted:", response);
        setFeedbackText(""); // Clear the text field after successful submission
        const newFeedback = {
          content: feedbackText,
          user: {
            user_id: user.user_id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        };
        setReportDetails({
          ...reportDetails,
          feedbacks: [...reportDetails.feedbacks, newFeedback],
        });
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
    } else {
      alert("Feedback text is empty!");
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await fetchReportById(reportId);
        setReportDetails(details);
      } catch (error) {
        console.error("Failed to fetch report details:", error);
      }
    };

    fetchDetails();
  }, [reportId]);

  const fileViewer = (file) => {
    const filePath = `http://localhost:3000/uploads/${file.filePath}`;
    const fileExtension = file.filePath.split(".").pop().toLowerCase();

    if (fileExtension === "pdf") {
      return (
        <iframe
          src={filePath}
          style={{ width: "100%", height: "500px" }}
          frameBorder="0"
        ></iframe>
      );
    } else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      return (
        <img
          src={filePath}
          alt="Uploaded content"
          style={{ width: "100%", height: "500px" }}
        />
      );
    } else {
      // For non-PDF and non-image files, provide a downloadable link with a default name
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Typography variant="h6">
            The Viewer does not support this file type. Click the file to
            download:
            <a href={filePath} download="bns-submission">
              Bns-submission
            </a>
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "row" }}>
      <Card sx={{ flex: 2, mr: 2, borderRadius: "16px" }}>
        {reportDetails?.files?.[0] ? (
          fileViewer(reportDetails.files[0])
        ) : (
          <Typography>No file available</Typography>
        )}
      </Card>

      <Card sx={{ flex: 1, borderRadius: "16px", padding: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
              {reportDetails?.user?.firstName +
                " " +
                reportDetails?.user?.lastName}
            </Typography>
            <Typography variant="h5" gutterBottom>
              {`${reportDetails?.month} ${reportDetails?.year}`}
            </Typography>
            <Button
              aria-controls="status-menu"
              aria-haspopup="true"
              onClick={handleMenuClick}
              variant="contained"
              sx={{
                mt: 1,
                bgcolor:
                  reportDetails?.status === "Needs Revision"
                    ? "red"
                    : reportDetails?.status === "Submitted"
                    ? "grey"
                    : "green",
                color: "white",
              }}
            >
              Status: {reportDetails?.status}
            </Button>
            <Menu
              id="status-menu"
              anchorEl={anchorEl}
              keepMounted
              open={openMenu}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleStatusChange("Needs Revision")}>
                Needs Revision
              </MenuItem>
              <MenuItem onClick={() => handleStatusChange("Completed")}>
                Completed
              </MenuItem>
            </Menu>
            <Dialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {"Confirm Status Change"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Are you sure you want to change the status of the report to{" "}
                  {pendingStatus}?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)} color="primary">
                  No
                </Button>
                <Button
                  onClick={handleConfirmStatusChange}
                  color="primary"
                  autoFocus
                >
                  Yes
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
          <Divider sx={{ my: 2, width: "100%" }} />
          <Typography variant="h5" color="initial" sx={{ pl: 2, pb: 1 }}>
            Comments:
          </Typography>
          <List sx={{ width: "100%", overflow: "auto", pl: 2 }}>
            {reportDetails?.feedbacks?.length > 0 ? (
              reportDetails.feedbacks.map((feedback, index) => (
                <ListItem
                  key={index}
                  sx={{
                    justifyContent:
                      feedback.user.user_id === user.user_id
                        ? "flex-end"
                        : "flex-start",
                    display: "flex",
                  }}
                >
                  <Paper
                    sx={{
                      maxWidth: "70%",
                      py: 1,
                      px: 2,
                      bgcolor:
                        feedback.user.user_id === user.user_id
                          ? "#8bc34a"
                          : "green",
                      color: "common.white",
                      borderRadius: "20px",
                    }}
                  >
                    <Typography variant="body2">{feedback.content}</Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: "block" }}
                    ></Typography>
                  </Paper>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary="No feedback submitted yet."
                  primaryTypographyProps={{
                    sx: { textAlign: "center" }, // Centers the text
                  }}
                />
              </ListItem>
            )}
          </List>
          <Divider sx={{ my: 2, width: "100%" }} />
          <TextField
            label="Your Feedback"
            multiline
            rows={4}
            fullWidth
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            sx={{ ml: 1 }}
          />
          <Button
            onClick={handleFeedbackSubmit}
            variant="contained"
            sx={{ color: "white", ml: 1, mt: 2, backgroundColor: "green" }}
          >
            Submit Feedback
          </Button>
        </Grid>
      </Card>
    </Box>
  );
};

export default BnsSubmissionDetails;
