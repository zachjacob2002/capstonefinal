// ../../functions/forTypeModal.js

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

export const fetchPrimaryTypes = async () => {
  try {
    const response = await api.get("/typeModal/primary-types");
    return response.data;
  } catch (error) {
    console.error("Error fetching primary types:", error);
    throw error;
  }
};

export const fetchSecondaryTypes = async (primaryTypeId, sex) => {
  try {
    const response = await api.get("/typeModal/secondary-types", {
      params: { primaryTypeId, sex },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching secondary types:", error);
    throw error;
  }
};

export const fetchTertiaryTypes = async (secondaryTypeId) => {
  try {
    const response = await api.get("/typeModal/tertiary-types", {
      params: { secondaryTypeId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tertiary types:", error);
    throw error;
  }
};

export const fetchSexOptions = async () => {
  try {
    const response = await api.get("/typeModal/sex-options");
    return response.data;
  } catch (error) {
    console.error("Error fetching sex options:", error);
    throw error;
  }
};
