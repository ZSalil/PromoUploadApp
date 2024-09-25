import axios from 'axios';
import { authHeader } from './auth-header';

const API_URL = process.env.REACT_APP_API_URL + 'v1/order-uploader/';

class OrderService {
  processSingleOrder(payload = {}) {
    return axios.post(API_URL + 'process-single-customer-order', payload, { headers: authHeader() });
  }

  saveSingleOrder(payload = {}) {
    return axios.post(API_URL + 'save-single-customer-order', payload, { headers: authHeader() });
  }

  customersOrder(qString) {
    return axios.get(API_URL + 'customers-order' + (qString ? ('?' + qString) : ''), { headers: authHeader() });
  }

  orderItems(qString) {
    return axios.get(API_URL + 'order-items' + (qString ? ('?' + qString) : ''), { headers: authHeader() });
  }

  saveMultiCustomerOrder(payload = {}) {
    return axios.post(API_URL + 'save-multi-customer-order', payload, { headers: authHeader() });
  }

  processMultiCustomerOrder(payload = {}) {
    return axios.post(API_URL + 'process-multi-customer-order', payload, { headers: authHeader() });
  }
}

export default new OrderService();
