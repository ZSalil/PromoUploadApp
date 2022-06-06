import React from "react";
import OrderTable from "./OrderTable";
import OrderProvider from './OrderProvider';

const Order = () => {

  return (
    <div>
      <OrderProvider>
        <OrderTable  />
      </OrderProvider>
      
    </div>
  );
};

export default Order;
