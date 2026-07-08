import axios from "axios";

const API = "http://localhost:5000/api/reports";

// Attach the JWT so every protected request is authorised.
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getReports = async () => {
  try {
    const response = await axios.get(API, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    console.error("Fetch reports error:", error);
    return [];
  }
};

export const getReportById = async (id) => {
  try {
    const response = await axios.get(`${API}/${id}`, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    console.error("Fetch report error:", error);
    return null;
  }
};

export const createReport = async (reportData) => {
  try {
    const response = await axios.post(API, reportData, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    console.error("Create report error:", error);
    return reportData;
  }
};
