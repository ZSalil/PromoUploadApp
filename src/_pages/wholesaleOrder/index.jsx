import React from "react";
import OrderTable from "./OrderTable";
import OrderProvider from "./OrderProvider";

const WholesaleOrder = () => {
  return (
    <div>
      <React.StrictMode>
        <OrderProvider>
          <OrderTable />
        </OrderProvider>
      </React.StrictMode>
    </div>
  );
};

export default WholesaleOrder;
