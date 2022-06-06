import React, { useEffect, useReducer, useState } from "react";
import redeemOrderService from "../../_services/redeem-order.service";
import moment from "moment";
import { SET_MESSAGE } from "../../_actions/types";
import { connect } from "react-redux";
import { setMessage } from "../../_actions/message";
import { toast } from "react-toastify";
import Papa from "papaparse";
import { slice } from "lodash";
const queryString = require("query-string");

export const OrderContext = React.createContext({
  selectedValues: {},
  handleChange() {},
});

function reducer(state, action) {
  switch (action.type) {
    case "form-value":
      console.log(state)
      return {
        ...state,
        selectedValues: {
          ...state.selectedValues,
          [action.name]: {
            ...state.selectedValues[action.name],
            value: action.fieldValue,
          },
        },
      };
    case "reset":
      return {
        ...state,
        selectedValues: {},
      };
    default:
      return state;
  }
}

const OrderProvider = (props) => {
  const [{ selectedValues }, dispatch] = useReducer(reducer, {
    selectedValues: {},
  });

  const [items, setItems] = useState([]);
  const [accountInfo, setAccountInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [date, setDate] = React.useState("");
  const [open, setOpen] = React.useState(false);

  useEffect(() => {}, []);

  // Handle form change
  const handleChange = (event) => {
    console.log(event);

    const { type, name, value } = event.target;

    const fieldValue = value;

    dispatch({ type: "form-value", name, fieldValue });
  };

  const getGeneratedOrders = (props) => {
    setIsLoading(true);
    redeemOrderService
      .getGeneratedOrders(props)
      .then(({ data: { data } }) => {
        setItems(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setItems([]);
        toast.error("Error while loading Data", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.log(error);
      });
  };

  const generateOrders = (props) => {
    setIsLoading(true);
    redeemOrderService.generateOrders(props).then(({ data: { data } }) => {
      setItems(data);
      setIsLoading(false);
    });
  };

  const processCsv = (file) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: function ({ data }) {
        if (data?.length > 1) {
          let newArray = slice(data, 1, data.length);
          setItems(
            newArray.map((obj, index) => ({
              id: index,
              part_number: obj[0],
              quantity: obj[1],
            }))
          );
          let po_name = "po_number";
          let cus_account = "customer_account";
          let po_data = data[0][0];
          let acc_data = data[0][1];
          dispatch({ type: "form-value", name:po_name,fieldValue:po_data });
          dispatch({ type: "form-value", name:cus_account, fieldValue:acc_data });
          // setAccountInfo({
          //   poNumber: data[0][0],
          //   customer_account: data[0][1],
          // });
        }

        console.log(data);
      },
    });
  };

  const onSubmit = () => {
    toast.success("Submitted Successfully");
  };

  useEffect(() => {
    // if(date)
    // {
    //   updateOrderTable();
    // }
  }, [date]);

  return (
    <OrderContext.Provider
      value={{
        items,
        isLoading,
        processCsv,
        selectedValues,
        handleChange,
        onSubmit,
      }}
    >
      {props.children}
    </OrderContext.Provider>
  );
};

function mapStateToProps(state) {
  const { user } = state.auth;
  return {
    user,
  };
}

export default connect(mapStateToProps)(OrderProvider);
