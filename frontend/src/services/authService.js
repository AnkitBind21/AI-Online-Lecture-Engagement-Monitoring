import axios from "axios";

const API = "http://localhost:5000/api";

export const loginTeacher = async (email, password) => {
  const response = await axios.post(`${API}/auth/login`, {
    email,
    password,
  });

  return response.data;
};