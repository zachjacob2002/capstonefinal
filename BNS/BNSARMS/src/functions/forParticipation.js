// forParticipation.js

import axios from "axios";

const API_URL = "http://localhost:3000"; // Update with your backend URL

export const addBeneficiariesToActivity = async (activityId, beneficiaries) => {
  try {
    const response = await axios.post(`${API_URL}/participation/add`, {
      activityId,
      beneficiaries,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding beneficiaries to activity:", error);
    throw error;
  }
};

export const fetchActivityParticipations = async (activityId) => {
  try {
    const response = await axios.get(`${API_URL}/participation/${activityId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching activity participations:", error);
    throw error;
  }
};

export const markAsAttended = async (ids) => {
  try {
    const response = await axios.patch(
      `${API_URL}/participation/mark-attended`,
      { ids }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking as attended:", error);
    throw error;
  }
};
