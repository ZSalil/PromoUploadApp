import React, { useEffect, useReducer, useState } from "react";
import moment from "moment";
import { SET_MESSAGE } from "../../_actions/types";
import { connect } from "react-redux";
import { setMessage } from "../../_actions/message";
import { toast } from "react-toastify";
import Papa from "papaparse";
import {
  debounce,
  difference,
  keyBy,
  merge,
  slice,
  uniq,
  uniqBy,
  values,
} from "lodash";
import Swal from "sweetalert2";
import orderService from "../../_services/order.service";
const queryString = require("query-string");
export const DashboardContext = React.createContext({
  selectedValues: {},
  handleChange() {},
});

function reducer(state, action) {
  switch (action.type) {
    case "form-value":
      console.log(state);
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

const DashboardProvider = (props) => {
  const [{ selectedValues }, dispatch] = useReducer(reducer, {
    selectedValues: {},
  });

  const [items, setItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [paginateItems, setPaginateItems] = useState([]);
  const [isItemTableLoading, setIsItemTableLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = React.useState(false);
  useEffect(() => {
    update();
  }, []);

  const handleSearch = debounce((value) => handleFiledSearch(value), 1000);

  const handleFiledSearch = (event) => {
    const name = "search_text";
    dispatch({ type: "form-value", name, fieldValue: event.target.value });
    if (event.target.value) {
      update({ search_text: event.target.value });
    } else {
      update({ search_text: "empty" });
    }
  };

  const update = async (params) => {
    let qString;
    let obj = {
    };
    if(params?.page) {
      obj.page =params.page
    }
    if(params?.search_text !== 'empty')
    {
      obj.search_kw = params?.search_text;
    }
    else{
      obj.search_kw = '';
    }

    if (selectedValues?.search_text?.value && params?.search_text !== "empty") {
      obj.search_kw = selectedValues?.search_text?.value;
    }
    if (obj) {
      qString = queryString.stringify(obj);
    }

    setIsLoading(true);
    await orderService
      .customersOrder(qString)
      .then(({ data: { data, ...others } }) => {
        let processedData = data?.map((obj, index) => ({ id: index, ...obj }));
        setItems(processedData);
        setPaginateItems(others);
        setIsLoading(false);
      })
      .catch((_) => {
        toast.error("Something Wrong");
        setIsLoading(false);
      });
  };

  const updateOrderItemTable = async (params) => {
    let qString;
    let obj = {
      ...params,
    };
    if (obj) {
      qString = queryString.stringify(obj);
    }
    setOrderItems([])
    setIsItemTableLoading(true);
    await orderService
      .orderItems(qString)
      .then(({ data }) => {
        let processedData = data?.map((obj, index) => ({ id: index, ...obj }));
        setOrderItems(processedData);
        setIsItemTableLoading(false);
      })
      .catch((_) => {
        toast.error("Something Wrong");
        setIsItemTableLoading(false);
      });
  };

  // Handle form change
  const handleChange = (event) => {
    const { type, name, value } = event.target;
    const fieldValue = value;
    dispatch({ type: "form-value", name, fieldValue });
  };

  return (
    <DashboardContext.Provider
      value={{
        items,
        isItemTableLoading,
        update,orderItems,
        updateOrderItemTable,
        paginateItems,
        isLoading,
        selectedValues,
        handleChange,
        handleSearch,
        open,
        setOpen,
      }}
    >
      {props.children}
    </DashboardContext.Provider>
  );
};

function mapStateToProps(state) {
  const { user } = state.auth;
  return {
    user,
  };
}

export default connect(mapStateToProps)(DashboardProvider);
