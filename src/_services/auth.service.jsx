import axios from "axios";
import { authHeader } from './auth-header';

const API_URL = process.env.REACT_APP_API_URL + "v1/";

class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + "login", {
        username,
        password
      })
      .then(response => {
        const data = response.data;
        console.log(data); // Log the response data for debugging
        if (data.token) {
          localStorage.setItem("user", JSON.stringify(data));
        }
        return data;
      })
      .catch(error => {
        console.error("Login error:", error); // Log any error for debugging
        throw error;
      });
  }

  logout() {
    return axios.post(API_URL + "logout", {}, { headers: authHeader() })
      .then(response => {
        localStorage.removeItem("user");
        return response.data;
      })
      .catch(error => {
        console.error("Logout error:", error); // Log any error for debugging
        throw error;
      });
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
  }
}

export default new AuthService();
