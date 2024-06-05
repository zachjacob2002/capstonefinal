import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import Header from "../../components/Header";
import {
  submitNarrativeReport,
  uploadFile,
  submitFeedback,
  getNarrativeReportDetails,
  updateFile,
  deleteReport,
} from "../../functions/reportSubmit"; // Import Axios functions
import useAuthStore from "../../stores/authStore"; // Import Zustand auth store

const ReportSubmissionPage = () => {
  const { month, year } = useParams();

  const [feedback, setFeedback] = useState("");
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userRole = user && user.role == 1 ? "npc" : "bns";
  const [openModal, setOpenModal] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchReport = async () => {
        const details = await getNarrativeReportDetails(
          month,
          year,
          user.user_id
        );
        if (details && details.feedbacks) {
          setFeedbackHistory(details.feedbacks);
          console.log("Feedback history set:", details.feedbacks);
        }
        if (details.files && details.files.length > 0) {
          setExistingFile({
            fileId: details.files[0].fileId,
            filePath: details.files[0].filePath,
            reportId: details.reportId,
          });
        }
      };
      fetchReport();
    }
  }, [month, year, user]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    if (event.target.files[0]) {
      console.log("Selected file details:", {
        name: event.target.files[0].name,
        size: event.target.files[0].size,
        type: event.target.files[0].type,
      });
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("You need to be logged in to submit a report.");
      return;
    }

    if (!file && !existingFile) {
      setOpenModal(true); // Show modal if no file is attached
      return;
    }

    try {
      let reportData = existingFile ? existingFile : null;

      // If no existing report, create a new one
      if (!reportData) {
        reportData = await submitNarrativeReport(
          user.user_id,
          month,
          parseInt(year, 10)
        );
      }

      // Handle file upload or replacement
      if (file) {
        const formData = new FormData();
        formData.append("filePath", file);

        if (reportData && file) {
          if (existingFile) {
            const updateResult = await updateFile(
              existingFile.fileId,
              formData
            );
            console.log("File update successful:", updateResult);
          } else {
            const uploadResult = await uploadFile(
              reportData.reportId,
              formData
            );
            console.log("File upload successful:", uploadResult);
          }
        }
      }

      // Submit feedback if there is any
      if (feedback) {
        await submitFeedback(reportData.reportId, user.user_id, feedback);
        setFeedbackHistory((prev) => [...prev, feedback]);
        setFeedback("");
      }

      navigate(-1);
      console.log("Report and file management successful");
    } catch (error) {
      console.error("Failed to submit report and/or manage file:", error);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!user) {
      alert("You need to be logged in to submit feedback.");
      return;
    }

    if (!feedback.trim()) {
      alert("Feedback cannot be empty.");
      return;
    }

    try {
      const feedbackResult = await submitFeedback(
        existingFile.reportId, // Assuming existingFile has the reportId if it exists
        user.user_id,
        feedback
      );
      // Update feedback history with the newly submitted feedback
      setFeedbackHistory((prevHistory) => [
        ...prevHistory,
        feedbackResult.content, // Assuming the server responds with the feedback object
      ]);
      setFeedback(""); // Clear the feedback input after submission
      console.log("Feedback submitted successfully:", feedbackResult);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const handleCancel = () => {
    navigate(-1); // or navigate to a specific path
  };

  const handleDelete = async () => {
    if (existingFile && existingFile.reportId) {
      try {
        const result = await deleteReport(existingFile.reportId);
        console.log("Delete successful:", result);
        navigate(`/app/narrative-select-month/${year}/${userRole}`); // Now userRole is defined here
      } catch (error) {
        console.error("Delete failed:", error);
      }
    } else {
      console.log("No existing file or report ID to delete.");
    }
  };

  const handleClose = () => setOpenModal(false);

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Submit Narrative Report"
          subtitle={`For the month of  ${month} ${year}`}
        />
        <Box>
          <Button onClick={handleCancel} variant="contained" color="primary">
            Cancel
          </Button>
          {existingFile && (
            <Button
              onClick={() => setOpenDeleteModal(true)}
              variant="contained"
              color="error"
              sx={{ ml: 1 }}
            >
              Remove Submission
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ color: "white", ml: 1, backgroundColor: "green" }}
          >
            Submit Report
          </Button>
        </Box>
      </Box>
      <Button
        variant="contained"
        component="label"
        sx={{ color: "white", ml: 1, backgroundColor: "green" }}
        startIcon={<AttachFileIcon />}
      >
        {existingFile ? "Replace Attachment" : "Add Attachment"}
        <input type="file" hidden onChange={handleFileChange} />
      </Button>
      {file && (
        <Box sx={{ mt: 2 }}>
          <Typography>Attached file: {file.name}</Typography>
        </Box>
      )}
      {existingFile && !file && (
        <Box sx={{ mt: 2 }}>
          <Typography>Attached File: {existingFile.filePath}</Typography>
        </Box>
      )}
      <Divider sx={{ my: 1, width: "100%" }} />

      <Typography variant="h6" sx={{ mt: 2 }}>
        Feedback History:
      </Typography>
      <List sx={{ overflow: "auto" }}>
        {feedbackHistory.map((feedback, index) => (
          <ListItem
            key={index}
            sx={{
              display: "flex",
              justifyContent:
                feedback.user && feedback.user.user_id === user.user_id
                  ? "flex-end"
                  : "flex-start",
            }}
          >
            <Paper
              sx={{
                maxWidth: "70%",
                bgcolor:
                  feedback.user && feedback.user.user_id === user.user_id
                    ? "#8bc34a"
                    : "green",
                color: "common.white",
                p: 1,
                borderRadius: "10px",
                mt: 1,
                wordWrap: "break-word",
              }}
            >
              <Typography>{feedback.content}</Typography>
            </Paper>
          </ListItem>
        ))}
      </List>
      <TextField
        label="Feedback"
        multiline
        rows={4}
        fullWidth
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        sx={{ mt: 2 }}
      />
      {existingFile && (
        <Button
          onClick={handleFeedbackSubmit}
          variant="contained"
          sx={{ color: "white", mt: 2, ml: 1, backgroundColor: "green" }}
        >
          Send Feedback
        </Button>
      )}

      <Modal
        open={openModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Please attach a file first.
          </Typography>
          <Button onClick={handleClose} sx={{ mt: 2 }}>
            OK
          </Button>
        </Box>
      </Modal>
      <Modal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="delete-modal-title" variant="h6" component="h2">
            Are you sure you want to remove your submission?
          </Typography>
          <Button onClick={() => setOpenDeleteModal(false)}>No</Button>
          <Button onClick={handleDelete} color="error">
            Yes
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default ReportSubmissionPage;
