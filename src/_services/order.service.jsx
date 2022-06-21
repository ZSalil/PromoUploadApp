import axios from 'axios';
import { authHeader } from './auth-header';


const API_URL = process.env.REACT_APP_API_URL+'v1/order-uploader/';

class OrderService {
  // generateOrders(payload={}) {
  //   return axios.post(API_URL + 'generate-orders',payload, { headers: authHeader() });
  // }
  processSingleOrder(payload={}) {
    return axios.post(API_URL + 'process-single-customer-order',payload, { headers: authHeader() });
  }

  processMultiCustomerOrder(payload={}) {
    return axios.post(API_URL + 'process-multi-customer-order',payload, { headers: authHeader() });
  }

  // getGeneratedOrders(qString) {
  //   return axios.get(API_URL + 'generate-orders'+(qString ? ('?'+qString) :''), { headers: authHeader() });
  // }

  // deleteGeneratedOrders(payload={}) {
  //   return axios.post(API_URL + 'bulk-delete',payload, { headers: authHeader() });
  // }

  // updateOrders(id,payload={}) {
  //   return axios.post(API_URL + `cruising-order/${id}`,payload, { headers: authHeader() });
  // }
  
  // emailSend(payload) {
  //   return axios.post(API_URL + 'schedule-email-send',payload,{ headers: authHeader() });
  // }
}

export default new OrderService();
