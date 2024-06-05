// forTypes.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

export const createType = async (typeData) => {
  try {
    const response = await api.post("/types", typeData);
    return response.data;
  } catch (error) {
    console.error("Error creating type:", error);
    throw error;
  }
};

// New function for fetching all types
export const fetchAllTypes = async () => {
  try {
    const response = await api.get("/types");
    return response.data;
  } catch (error) {
    console.error("Error fetching types:", error);
    throw error;
  }
};

export const fetchSecondaryTypes = async () => {
  try {
    const response = await api.get("/types/secondary");
    return response.data;
  } catch (error) {
    console.error("Error fetching secondary types:", error);
    throw error;
  }
};

export const fetchSecondaryTypesByPrimary = async (primaryTypeId) => {
  try {
    const response = await api.get(
      `/types/secondary/by-primary/${primaryTypeId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching secondary types by primary type:", error);
    throw error;
  }
};

export const fetchPrimaryTypes = async () => {
  try {
    const response = await api.get("/types/primary");
    return response.data;
  } catch (error) {
    console.error("Error fetching primary types:", error);
    throw error;
  }
};

export const fetchSecondaryTypesByPrimarySex = async (primaryType, sex) => {
  try {
    const response = await api.get(
      `/types/secondary/by-primary/${primaryType}/${sex}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching secondary types by primary type and sex:",
      error
    );
    throw error;
  }
};

export const fetchTertiaryTypesBySecondary = async (secondaryTypeName) => {
  try {
    const response = await api.get(
      `/types/tertiary/by-secondary/${secondaryTypeName}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tertiary types by secondary type:", error);
    throw error;
  }
};
