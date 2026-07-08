import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api`;

export const loginTeacher = async (email, password) => {
  const response = await axios.post(`${API}/auth/login`, {
    email,
    password,
  });

  return response.data;
};