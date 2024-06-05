// forDocumentation.js
import axios from "axios";

export const uploadPhotos = async (activityId, formData) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/activities/upload-photos/${activityId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading photos:", error);
    throw error;
  }
};
