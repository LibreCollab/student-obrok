import axios from "axios";
import { BASE_API_URL } from "./consts";

export default axios.create({
  baseURL: BASE_API_URL,
});

export const axiostPrivate = axios.create({
  baseURL: BASE_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
