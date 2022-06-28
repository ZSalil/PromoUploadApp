import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const instance = axios.create({
  baseURL: "http://localhost:8004",
});

const AxiosInterceptor = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    axios.interceptors.request.use(
      (req) => {
        // Add configurations here
        return req;
      },
      (err) => {
        console.log(err);
        return Promise.reject(err);
      }
    );

    // For POST requests
    axios.interceptors.response.use(
      (res) => {
        return res;
      },
      (err) => {
        if (err.response.status === 401) {
          toast.error('Unauthorized')
          navigate("/login");
        }

        return Promise.reject(err);
      }
    );
  }, [navigate]);

  return children;
};

export default instance;
export { AxiosInterceptor };
