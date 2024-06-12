/* eslint-disable no-unused-vars */
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  Modal,
  Divider,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Header from "../../components/Header";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

const ReportSubmissionPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId") || user.user_id;

  const [files, setFiles] = useState([null, null, null]);
  const [status, setStatus] = useState("No Submission");
  const [feedback, setFeedback] = useState("");
  const [fileHistory, setFileHistory] = useState([]);
  const [reportDetails, setReportDetails] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileToView, setFileToView] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [alertSnackbarOpen, setAlertSnackbarOpen] = useState(false);

  const handleAlertSnackbarClose = () => {
    setAlertSnackbarOpen(false);
  };

  const showAlertSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarSeverity("warning");
    setAlertSnackbarOpen(true);
  };

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/newReports/report/${reportId}?userId=${userId}`
        );
        setReportDetails(response.data);
        setFileHistory(response.data.fileHistory);
        setFeedbackHistory(
          response.data.feedbackHistory.map((feedback) => ({
            ...feedback,
            user: feedback.user || {
              firstName: "Unknown",
              lastName: "User",
            },
          }))
        );

        if (response.data.fileHistory.length > 0) {
          setStatus(response.data.userStatus);
        } else {
          setStatus("No Submission");
        }

        console.log("Report Details:", response.data);
        console.log("Feedback History:", response.data.feedbackHistory);
      } catch (error) {
        console.error("Failed to fetch report details:", error);
      }
    };

    if (userId && reportId) {
      fetchReportDetails();
    }
  }, [userId, reportId]);

  const handleFileChange = (index) => (event) => {
    const newFiles = [...files];
    newFiles[index] = event.target.files[0];
    setFiles(newFiles);
    console.log(`File ${index + 1} selected:`, event.target.files[0]);
  };

  const handleFileClick = (file) => () => {
    const filePath = `http://localhost:3000/${file.filePath}`;
    const fileExtension = file.filePath.split(".").pop().toLowerCase();

    if (["pdf", "jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      setFileToView(filePath);
      setFileViewerOpen(true);
    } else {
      window.open(filePath, "_blank");
    }
  };

  const handleDeleteFile = (index) => () => {
    const newFiles = [...files];
    newFiles[index] = null;
    setFiles(newFiles);
    console.log(`File ${index + 1} removed`);
  };

  const handleSubmit = async () => {
    if (files.every((file) => file === null)) {
      showAlertSnackbar("Please attach a file first");
      return;
    }

    try {
      const formData = new FormData();
      files.forEach((file) => {
        if (file) formData.append("files", file);
      });

      formData.append("userId", userId);
      formData.append("reportId", reportId);

      const response = await axios.post(
        "http://localhost:3000/newReports/submit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Submission response:", response.data);

      setStatus("Submitted");
      setFileHistory(response.data.fileHistory);
      setFiles([null, null, null]);
      setSnackbarMessage("Successfully Submitted");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Submission error:", error);
      setSnackbarMessage("Submission Failed");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (feedback.trim() === "") {
      alert("Please enter feedback");
      return;
    }

    const submissionId = fileHistory[0]?.submissionId;

    if (!submissionId) {
      console.error("Submission ID is not available for feedback.");
      return;
    }

    try {
      const feedbackResponse = await axios.post(
        `http://localhost:3000/newReports/${reportId}/feedback`,
        {
          userId: user.user_id,
          content: feedback,
          submissionId,
        }
      );

      setFeedbackHistory([
        ...feedbackHistory,
        {
          ...feedbackResponse.data,
          user: feedbackResponse.data.user || {
            firstName: "Unknown",
            lastName: "User",
          },
        },
      ]);
      setFeedback("");

      if (user.role === "1") {
        await axios.patch(
          `http://localhost:3000/newReports/${reportId}/status`,
          {
            userId: userId,
            status: pendingStatus || status,
          }
        );
        setPendingStatus(null); // Clear the pending status
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
    }
  };

  const handleStatusChange = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/newReports/${reportId}/status`,
        {
          userId: userId,
          status: pendingStatus,
        }
      );

      console.log("Status update response:", response.data);
      setStatus(pendingStatus); // Update the status in the UI
      setPendingStatus(null); // Clear the pending status
      setDialogOpen(false); // Close the dialog
    } catch (error) {
      console.error("Failed to update status:", error);
      setSnackbarMessage("Failed to update status");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (newStatus) => {
    setPendingStatus(newStatus); // Set the new status in the pending state
    setAnchorEl(null);
    setDialogOpen(true); // Open the dialog
  };

  const handleClose = () => {
    setAnchorEl(null);
    setDialogOpen(false); // Close the dialog
  };

  console.log("Logged-in User ID:", user.user_id);
  console.log("Report ID:", reportId);

  const sortedFileHistory = fileHistory.reduce((acc, file) => {
    const submissionId = file.submissionId;
    if (!acc[submissionId]) {
      acc[submissionId] = [];
    }
    acc[submissionId].push(file);
    return acc;
  }, {});

  const sortedFileHistoryArray = Object.values(sortedFileHistory).sort(
    (a, b) => b[0].submissionId - a[0].submissionId
  );

  const allSubmissions = sortedFileHistoryArray.flat();

  console.log("Sorted File History:", sortedFileHistoryArray);

  const statusOptions = ["Needs Revision", "Completed"]; // Removed "Submitted"

  const formatSubmissionDate = (dateString) => {
    const date = dayjs(dateString);
    const dueDate = dayjs(reportDetails?.dueDate);
    const isLate = date.isAfter(dueDate);
    return (
      <span>
        Created at: {date.format("hh:mm A - MMMM DD - YYYY")}
        {isLate && <span style={{ color: "red" }}> (Late)</span>}
      </span>
    );
  };

  const calculateTimeLeft = () => {
    const dueDate = dayjs(reportDetails?.dueDate);
    const now = dayjs();
    const timeLeft = dueDate.diff(now, "day");

    if (timeLeft < 0) {
      return "Past Due Date";
    } else if (timeLeft === 0) {
      return "Due Today";
    } else {
      return `${timeLeft} days left`;
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Report Submission"
          subtitle={`${reportDetails?.type} for ${dayjs(
            reportDetails?.dueDate
          ).format("MMMM YYYY")}`}
        />
      </Box>
      <Typography sx={{ fontWeight: "bold", mt: 2 }}>
        Time Remaining: {calculateTimeLeft()}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
        <Typography sx={{ fontWeight: "bold", mr: 1 }}>Status:</Typography>
        {user.role === "1" ? (
          <>
            <Typography
              sx={{
                fontWeight: "bold",
                color:
                  status === "Submitted"
                    ? "orange"
                    : status === "Needs Revision"
                    ? "red"
                    : status === "Completed"
                    ? "green"
                    : "grey",
                mr: 2,
              }}
            >
              {status}
            </Typography>
            <Button
              variant="contained"
              onClick={handleButtonClick}
              sx={{
                backgroundColor: "green",
                color: "white",
                fontWeight: "bold",
                borderRadius: "5px",
                padding: "5px 15px",
              }}
              endIcon={<KeyboardArrowDownIcon />}
              disabled={status === "Completed"} // Disable the button when the status is "Completed"
            >
              Change Status
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {statusOptions.map((option) => (
                <MenuItem
                  key={option}
                  selected={option === status}
                  onClick={() => handleMenuItemClick(option)}
                >
                  {option}
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Typography
            sx={{
              fontWeight: "bold",
              color:
                status === "Submitted"
                  ? "orange"
                  : status === "Needs Revision"
                  ? "red"
                  : status === "Completed"
                  ? "green"
                  : "grey",
            }}
          >
            {status}
          </Typography>
        )}
      </Box>
      <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
        Comments:
      </Typography>
      <List sx={{ overflow: "auto" }}>
        {feedbackHistory.map((feedbackItem) => (
          <ListItem
            key={feedbackItem.feedbackId}
            sx={{
              display: "flex",
              justifyContent:
                user.role === "1"
                  ? feedbackItem.createdBy === user.user_id
                    ? "flex-end"
                    : "flex-start"
                  : feedbackItem.createdBy === 1
                  ? "flex-start"
                  : "flex-end",
            }}
          >
            <Paper
              sx={{
                maxWidth: "70%",
                bgcolor:
                  feedbackItem.createdBy === user.user_id
                    ? "#8bc34a"
                    : "darkGreen",
                color: "common.white",
                p: 1,
                borderRadius: "10px",
                mt: 1,
                wordWrap: "break-word",
              }}
            >
              <Typography>{feedbackItem.content}</Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Sent By: {feedbackItem.user.lastName},{" "}
                {feedbackItem.user.firstName}, at{" "}
                {dayjs(feedbackItem.createdAt).format(
                  "hh:mm A - MMMM DD - YYYY"
                )}
              </Typography>
            </Paper>
          </ListItem>
        ))}
      </List>

      {(user.role !== "1" && status !== "Completed") ||
      (user.role === "1" && status === "Needs Revision") ? (
        <>
          <TextField
            label="Comments"
            multiline
            rows={4}
            fullWidth
            sx={{ mt: 2 }}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              sx={{ color: "white", mt: 2, ml: 1, backgroundColor: "green" }}
              onClick={handleFeedbackSubmit}
            >
              Send
            </Button>
          </Box>
        </>
      ) : null}

      <Divider sx={{ my: 2, width: "100%" }} />

      {user.role !== "1" && (
        <>
          <Button
            variant="contained"
            component="label"
            sx={{ color: "white", ml: 1, backgroundColor: "green" }}
            startIcon={<AttachFileIcon />}
            disabled={status === "Completed"} // Disable the button when the status is "Completed"
          >
            Add Attachment
            <input
              type="file"
              hidden
              onChange={(event) =>
                handleFileChange(files.findIndex((file) => file === null))(
                  event
                )
              }
            />
          </Button>
          {files.map(
            (file, index) =>
              file && (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", mt: 2 }}
                >
                  <Paper
                    sx={{
                      padding: 1,
                      borderRadius: "5px",
                      border: "1px solid green",
                      cursor: "pointer",
                      mr: 2,
                    }}
                    onClick={handleFileClick(index)}
                  >
                    <Typography>{file.name}</Typography>
                    <input
                      id={`file-input-${index}`}
                      type="file"
                      hidden
                      onChange={handleFileChange(index)}
                    />
                  </Paper>
                  <IconButton onClick={handleDeleteFile(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )
          )}
          <Divider sx={{ my: 2, width: "100%" }} />
        </>
      )}

      <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
        Submissions:
      </Typography>
      <Box sx={{ mt: 1 }}>
        {allSubmissions.map((file, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1,
              p: 1,
              "&:hover .file-name": {
                color: "green",
              },
            }}
          >
            <Box
              sx={{
                cursor: "pointer",
                flex: 1,
              }}
              onClick={handleFileClick(file)}
            >
              <Typography className="file-name">{file.fileName}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography>
                Submitted Last:{" "}
                {dayjs(file.createdAt).format("hh:mm A - MMMM DD - YYYY")}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  color: dayjs(file.createdAt).isAfter(
                    dayjs(reportDetails?.dueDate)
                  )
                    ? "red"
                    : "black",
                }}
              >
                {dayjs(file.createdAt).isAfter(dayjs(reportDetails?.dueDate))
                  ? "Late"
                  : ""}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box display="flex" justifyContent="flex-end" mt={2}>
        {user.role !== "1" && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{ color: "white", ml: 1, backgroundColor: "green" }}
              onClick={handleSubmit}
              disabled={status === "Completed"}
            >
              Submit Report
            </Button>
          </>
        )}
      </Box>

      <Modal
        open={fileViewerOpen}
        onClose={() => setFileViewerOpen(false)}
        aria-labelledby="file-viewer-modal"
        aria-describedby="file-viewer-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: "none",
            p: 4,
            width: "80%",
            height: "80%",
          }}
        >
          {fileToView && fileToView.split(".").pop().toLowerCase() === "pdf" ? (
            <iframe
              src={fileToView}
              style={{ width: "100%", height: "100%" }}
              frameBorder="0"
            ></iframe>
          ) : (
            <img
              src={fileToView}
              alt="file"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the status to {pendingStatus}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleStatusChange} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={alertSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleAlertSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleAlertSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportSubmissionPage;
