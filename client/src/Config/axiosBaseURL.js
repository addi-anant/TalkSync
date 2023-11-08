import axios from "axios";

export const axiosBaseURL = axios.create({
  baseURL: "http://localhost:8080/",
});

axiosBaseURL.defaults.withCredentials = true;
