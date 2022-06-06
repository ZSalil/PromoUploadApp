import axios from "axios";
import { authHeader } from './auth-header';
const API_URL = process.env.REACT_APP_API_URL+"v1/";
class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + "login", {
        username,
        password
      })
      .then(response => {
        const { data } = response.data;
        if (data.token) {
          localStorage.setItem("user", JSON.stringify(data));
        }
        return data;
      });
  }


   logout() {
     axios.post(API_URL + "logout",{}, { headers: authHeader() }).then(response => {
      localStorage.removeItem("user");
    });
    
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
  }
}
export default new AuthService();