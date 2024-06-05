//  forDashboard.js

import axios from "axios";

export const fetchReportsCount = async (type, year, month) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/dashboard/reports/count/${type}/${year}/${month}`
    );
    return response.data.count; // Return only the count
  } catch (error) {
    console.error("Error fetching report counts:", error);
    return 0; // Return 0 in case of an error
  }
};

export const fetchBNSCount = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/dashboard/users/count/bns`
    );
    return response.data.bnsCount; // Return only the BNS count
  } catch (error) {
    console.error("Error fetching BNS count:", error);
    return 0; // Return 0 in case of an error
  }
};

export const fetchRecentReports = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/dashboard/reports/recent`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }
};

export const fetchActivitiesCountByYear = async (year) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/dashboard/activities/count/${year}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching activities count:", error);
    return [];
  }
};

export const fetchBeneficiariesCount = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/dashboard/beneficiaries/count`
    );
    return response.data.count;
  } catch (error) {
    console.error("Error fetching beneficiaries count:", error);
    return 0;
  }
};

export const fetchReportStatusCounts = async (type, year, month) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/dashboard/reports/statusCounts/${type}/${year}/${month}`
    );
    return response.data; // Return the status counts
  } catch (error) {
    console.error("Error fetching report status counts:", error);
    return { submitted: 0, needsRevision: 0, completed: 0 }; // Return default counts in case of an error
  }
};

export const fetchUserReportStatus = async (userId, type, year, month) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/dashboard/reports/status/${userId}/${type}/${year}/${month}`
    );
    return response.data.status; // Return the status
  } catch (error) {
    console.error("Error fetching user report status:", error);
    return "No submission"; // Return default status in case of an error
  }
};

export const fetchUserRecentReports = async (userId) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/dashboard/reports/recent/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }
};

export const fetchActivitiesCountByYearForUser = async (year, userId) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/dashboard/activities/count/${year}/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching activities count:", error);
    return [];
  }
};
