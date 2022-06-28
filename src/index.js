import React from "react";
import ReactDOM from 'react-dom/client';
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AxiosInterceptor } from "./AxiosInterceptor";
import store from './store.js'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter basename="/order-uploader">
    <AxiosInterceptor>
    <Provider store={store}>
      <App />
    </Provider>
    </AxiosInterceptor>

  </BrowserRouter>
);