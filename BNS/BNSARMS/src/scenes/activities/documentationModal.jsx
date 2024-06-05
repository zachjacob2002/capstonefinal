/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import axios from "axios";
import { uploadPhotos } from "../../functions/forDocumentation";

const DocumentationModal = ({
  open,
  handleClose,
  activityId,
  refreshParticipations,
}) => {
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);

  useEffect(() => {
    if (open) {
      fetchExistingPhotos();
    }
  }, [open]);

  const fetchExistingPhotos = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/activities/photos/${activityId}`
      );
      setExistingPhotos(response.data);
    } catch (error) {
      console.error("Error fetching existing photos:", error);
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    setPhotos([...photos, ...files]);
  };

  const handlePhotoRemove = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("activityId", activityId); // Ensure activityId is appended to the form data
    photos.forEach((photo) => formData.append("photos", photo));

    try {
      await uploadPhotos(activityId, formData);
      refreshParticipations();
      setPhotos([]); // Clear photos state after successful upload
      handleClose();
    } catch (error) {
      console.error("Error uploading photos:", error);
    }
  };

  const handleCloseModal = () => {
    setPhotos([]); // Clear photos state when the modal is closed
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleCloseModal}>
      <Box
        sx={{
          padding: 4,
          backgroundColor: "white",
          borderRadius: 4,
          margin: "auto",
          marginTop: "10%",
          maxWidth: "600px",
        }}
      >
        <Typography variant="h6">Upload Photo Documentation</Typography>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          style={{ margin: "10px 0" }}
        />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {existingPhotos.map((photo, index) => (
            <Box key={index} sx={{ position: "relative" }}>
              <img
                src={`http://localhost:3000/uploads/${photo.filename}`}
                alt={`photo-${index}`}
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            </Box>
          ))}
          {photos.map((photo, index) => (
            <Box key={index} sx={{ position: "relative" }}>
              <img
                src={URL.createObjectURL(photo)}
                alt={`photo-${index}`}
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
              <Tooltip title="Remove photo">
                <IconButton
                  onClick={() => handlePhotoRemove(index)}
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    backgroundColor: "red",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "darkred",
                    },
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={handleCloseModal}
            sx={{ backgroundColor: "gray" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ backgroundColor: "green" }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DocumentationModal;
