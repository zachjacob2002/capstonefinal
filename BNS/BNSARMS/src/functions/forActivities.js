// forActivities.js
import axios from "axios";

const apiBaseUrl = "http://localhost:3000";

export const saveActivity = async (activityData) => {
  try {
    const response = await axios.post(`${apiBaseUrl}/activities`, activityData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError =
        error.response?.data || "An unexpected error occurred";
      console.error("There was an error saving the activity: ", serverError);
    } else {
      console.error("Error message: ", error.message);
    }
    return null;
  }
};

export const fetchActivities = async (userId) => {
  try {
    const response = await axios.get(`${apiBaseUrl}/activities`, {
      params: { userId: userId }, // Send user ID as a query parameter
    });
    return Array.isArray(response.data) ? response.data : []; // Ensure the response is an array
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError =
        error.response?.data || "An unexpected error occurred";
      console.error(
        "There was an error fetching the activities: ",
        serverError
      );
    } else {
      console.error("Error message: ", error.message);
    }
    return [];
  }
};

// Function to add activity participations for selected beneficiaries
export const addActivityParticipations = async (activityId, beneficiaries) => {
  try {
    const response = await axios.post(
      `${apiBaseUrl}/activities/activity-participations`,
      {
        activityId: parseInt(activityId, 10), // Ensure this is an integer
        beneficiaries, // Assuming these are already integers
      }
    );
    console.log("Successfully added activity participations:", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error adding activity participations:",
        error.response?.data || "An unexpected error occurred"
      );
    } else {
      console.error("Error message:", error.message);
    }
    return null;
  }
};

export const fetchActivityBeneficiaries = async (activityId) => {
  try {
    const response = await axios.get(
      `${apiBaseUrl}/activities/${activityId}/beneficiaries`
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching activity beneficiaries:", error);
    return [];
  }
};

export const updateParticipationAttendance = async (
  activityId,
  beneficiaryIds,
  attended
) => {
  try {
    const response = await axios.patch(
      `${apiBaseUrl}/activities/activity-participations/update-attendance`,
      {
        activityId,
        beneficiaryIds,
        attended,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error updating activity participations:",
        error.response?.data || "An unexpected error occurred"
      );
    } else {
      console.error("Error message:", error.message);
    }
    return null;
  }
};

export const uploadActivityImage = async (file, activityId, beneficiaryId) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axios.patch(
      `${apiBaseUrl}/activities/upload-image?activityId=${activityId}&beneficiaryId=${beneficiaryId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("Image uploaded successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error uploading image:",
      error.response?.data || "An unexpected error occurred"
    );
    return null;
  }
};

export const fetchBeneficiaryImage = async (activityId, beneficiaryId) => {
  try {
    const response = await axios.get(
      `${apiBaseUrl}/activities/get-image/${activityId}/${beneficiaryId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching beneficiary image:",
      error.response?.data || "An unexpected error occurred"
    );
    return null; // Return null or appropriate error response
  }
};

export const deleteActivityParticipation = async (
  activityId,
  beneficiaryId
) => {
  try {
    const response = await axios.delete(
      `${apiBaseUrl}/activities/activity-participations/${activityId}/${beneficiaryId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting activity participation:", error);
    return null;
  }
};

// New deleteActivity function
export const deleteActivity = async (activityId) => {
  try {
    const response = await axios.delete(
      `${apiBaseUrl}/activities/${activityId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError =
        error.response?.data || "An unexpected error occurred";
      console.error("There was an error deleting the activity: ", serverError);
    } else {
      console.error("Error message: ", error.message);
    }
    return null;
  }
};

export const updateActivity = async (activityId, updatedData) => {
  try {
    const response = await axios.patch(
      `${apiBaseUrl}/activities/${activityId}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError =
        error.response?.data || "An unexpected error occurred";
      console.error("There was an error updating the activity: ", serverError);
    } else {
      console.error("Error message: ", error.message);
    }
    return null;
  }
};

export const fetchAllUsers = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/activities/users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
