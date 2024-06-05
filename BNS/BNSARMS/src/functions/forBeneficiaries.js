import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

export const createBeneficiary = async (beneficiaryData) => {
  try {
    const response = await api.post("/beneficiaries", beneficiaryData);
    return response.data;
  } catch (error) {
    console.error("Error creating beneficiary:", error);
    throw error;
  }
};

export const fetchBeneficiaries = async () => {
  try {
    const response = await api.get("/beneficiaries");
    return response.data;
  } catch (error) {
    console.error("Error fetching beneficiaries:", error);
    throw error;
  }
};

export const checkExistingBeneficiary = async (beneficiaryData) => {
  try {
    const response = await api.get("/beneficiaries/exists", {
      params: beneficiaryData,
    });
    return response.data.exists;
  } catch (error) {
    console.error("Error checking beneficiary existence:", error);
    throw error;
  }
};

export const updateBeneficiary = async (beneficiaryId, beneficiaryData) => {
  try {
    const response = await api.patch(
      `/beneficiaries/${beneficiaryId}`,
      beneficiaryData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating beneficiary:", error);
    throw error;
  }
};

// forBeneficiaries.js

export const fetchUnarchivedBeneficiaries = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/beneficiaries/unarchived"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching unarchived beneficiaries:", error);
    throw error;
  }
};
