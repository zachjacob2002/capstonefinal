// reportSubmit.js
import axios from "axios";

const apiBaseUrl = "http://localhost:3000"; // Adjust to your backend URL

export const submitReport = async (userId, month, year) => {
  console.log("Submitting report with:", userId, month, year); // Log to check values
  try {
    const response = await axios.post(`${apiBaseUrl}/reports`, {
      userId: parseInt(userId, 10),
      type: "Monthly Accomplishment Report",
      month,
      year: parseInt(year, 10),
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error submitting report:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const uploadFile = async (reportId, fileData) => {
  try {
    const response = await axios.post(
      `${apiBaseUrl}/reports/${reportId}/files`,
      fileData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error uploading file:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const submitFeedback = async (reportId, userId, content) => {
  console.log("Submitting Feedback:", reportId, userId, content);
  try {
    const response = await axios.post(
      `${apiBaseUrl}/reports/${reportId}/feedbacks`,
      {
        content,
        createdBy: userId,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error submitting feedback:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const checkReportSubmission = async (month, year, userId) => {
  try {
    const response = await axios.get(`${apiBaseUrl}/reports`, {
      params: { month, year, userId },
    });
    return response.data.length > 0;
  } catch (error) {
    console.error("Error fetching report submission status:", error);
    return false;
  }
};

export const getReportDetails = async (month, year, userId) => {
  try {
    const response = await axios.get(`${apiBaseUrl}/reports/details`, {
      params: { month, year, userId },
    });
    if (response.data) {
      // Log to verify the structure of received data including status
      console.log("Fetched report details:", response.data);
    }
    if (!month || !year || !userId) {
      console.error("Required parameters are missing");
      return;
    }
    return response.data;
  } catch (error) {
    return null;
  }
};

export const allReportDetails = async (month, year, type) => {
  try {
    const params = { month, year, type };
    const response = await axios.get(`${apiBaseUrl}/reports/submissions`, {
      params: params,
    });

    if (response.data) {
      // Log to verify the structure of received data including status
      console.log("Fetched report details:", response.data);
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching report details:", error);
    return null;
  }
};

export const updateFile = async (fileId, fileData) => {
  try {
    const response = await axios.patch(
      `${apiBaseUrl}/reports/files/${fileId}`,
      fileData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating file:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteReport = async (reportId) => {
  try {
    const response = await axios.delete(`${apiBaseUrl}/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting report:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// reportSubmit.js
export const getSubmissionCount = async (month, year) => {
  try {
    const response = await axios.get(
      `${apiBaseUrl}/reports/submissions-count`,
      {
        params: { month, year, type: "Monthly Accomplishment Report" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching submission count:", error);
    return null;
  }
};

// Axios function to fetch report details by reportId
export const fetchReportById = async (reportId) => {
  try {
    const response = await axios.get(
      `${apiBaseUrl}/reports/report/${reportId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching report by ID:", reportId, error);
    throw error;
  }
};

export const updateReportStatus = async (reportId, newStatus, userId) => {
  try {
    const response = await axios.patch(
      `${apiBaseUrl}/reports/${reportId}/status`,
      {
        status: newStatus,
        userId, // ID of the admin making the change
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating report status:", error);
    throw error;
  }
};

export const getNarrativeReportDetails = async (month, year, userId) => {
  try {
    const response = await axios.get(
      `${apiBaseUrl}/reports/narrative-details`,
      {
        params: { month, year, userId },
      }
    );
    if (response.data) {
      console.log("Fetched narrative report details:", response.data);
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching narrative report details:", error);
    return null;
  }
};

export const getNarrativeSubmissionCount = async (month, year) => {
  try {
    const response = await axios.get(
      `${apiBaseUrl}/reports/narrative-submissions-count`,
      {
        params: { month, year },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching narrative submission count:", error);
    return null;
  }
};

// Axios function to submit a narrative report
export const submitNarrativeReport = async (userId, month, year) => {
  console.log("Submitting narrative report with:", userId, month, year); // Log to check values
  try {
    const response = await axios.post(`${apiBaseUrl}/reports`, {
      userId: parseInt(userId, 10),
      type: "Narrative Report",
      month,
      year: parseInt(year, 10),
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error submitting narrative report:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getWorkActivityReportDetails = async (month, year, userId) => {
  try {
    const response = await axios.get(
      `${apiBaseUrl}/reports/work-activity-details`,
      {
        params: { month, year, userId },
      }
    );
    if (response.data) {
      console.log("Fetched work activity report details:", response.data);
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching work activity report details:", error);
    return null;
  }
};

export const getWorkActivitySubmissionCount = async (month, year) => {
  try {
    const response = await axios.get(
      `${apiBaseUrl}/reports/work-activity-submissions-count`,
      {
        params: { month, year },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching work activity submission count:", error);
    return null;
  }
};

export const getWorkActivityScheduleReportDetails = async (
  month,
  year,
  userId
) => {
  try {
    const response = await axios.get(
      `${apiBaseUrl}/reports/work-activity-schedule-details`,
      {
        params: { month, year, userId },
      }
    );
    if (response.data) {
      console.log(
        "Fetched work activity schedule report details:",
        response.data
      );
    }
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching work activity schedule report details:",
      error
    );
    return null;
  }
};

export const getWorkActivityScheduleSubmissionCount = async (month, year) => {
  try {
    const response = await axios.get(
      `${apiBaseUrl}/reports/work-activity-schedule-submissions-count`,
      {
        params: { month, year },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching work activity schedule submission count:",
      error
    );
    return null;
  }
};

// Axios function to submit a work activity schedule report
export const submitWorkActivityScheduleReport = async (userId, month, year) => {
  console.log(
    "Submitting work activity schedule report with:",
    userId,
    month,
    year
  ); // Log to check values
  try {
    const response = await axios.post(`${apiBaseUrl}/reports`, {
      userId: parseInt(userId, 10),
      type: "Work Activity Schedule Report",
      month,
      year: parseInt(year, 10),
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error submitting work activity schedule report:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getMonthlyAccomplishmentReportDetails = async (
  month,
  year,
  userId
) => {
  try {
    const response = await axios.get(
      `${apiBaseUrl}/reports/monthly-accomplishment-details`,
      {
        params: { month, year, userId },
      }
    );
    if (response.data) {
      console.log(
        "Fetched monthly accomplishment report details:",
        response.data
      );
    }
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching monthly accomplishment report details:",
      error
    );
    return null;
  }
};


