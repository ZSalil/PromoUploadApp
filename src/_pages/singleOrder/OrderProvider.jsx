import React, { useEffect, useReducer, useState } from "react";
import OrderService from "../../_services/order.service";
import moment from "moment";
import { SET_MESSAGE } from "../../_actions/types";
import { connect } from "react-redux";
import { setMessage } from "../../_actions/message";
import { toast } from "react-toastify";
import Papa from "papaparse";
import { difference, keyBy, merge, slice, uniq, uniqBy, values } from "lodash";
import Swal from "sweetalert2";

export const OrderContext = React.createContext({
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

const OrderProvider = (props) => {
  const [{ selectedValues }, dispatch] = useReducer(reducer, {
    selectedValues: {},
  });

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finalList, setFinalList] = React.useState([]);
  const [dataProcessed, setDataProcessed] = React.useState(false);
  const [isSubmittable, setIsSubmittable] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  useEffect(() => {}, []);

  // Handle form change
  const handleChange = (event) => {
    setDataProcessed(true);
    const { type, name, value } = event.target;
    const fieldValue = value;
    dispatch({ type: "form-value", name, fieldValue });
  };

  function isProductUnique() {
    return difference(
      finalList,
      uniqBy(finalList, "part_number"),
      "part_number"
    );
  }
  const handleHoldPickChange = (event) => {
    const {  name } = event.target;
    if(event.target.checked) {
      dispatch({ type: "form-value", name, fieldValue:'Y' });
    }
    else {
      dispatch({ type: "form-value", name, fieldValue:'N' });
    }
   
  };
  const handleFormValueUpdate = (event) => {
    setDataProcessed(true);
    const { name, value } = event;
    dispatch({ type: "form-value", name, fieldValue: value });
  };

  function sortByError(a, b) {


    if(parseInt(a.quantity) < parseInt(a.free_stock))
    {
      return 1
    }
    if(parseInt(a.quantity) > parseInt(a.free_stock))
    {
      return -1
    }
    
    return 0;
  }

  const processSingleOrder = (props) => {
    setMessage(null);
    setIsLoading(true);
    OrderService.processSingleOrder(props)
      .then(({ data }) => {
        setDataProcessed(false);
        const newArray = merge(
          keyBy(data?.products, "product"),
          keyBy(finalList, "part_number")
        );
        const _newArray = values(newArray);
        _newArray.sort(sortByError)
        setItems(_newArray);
        setFinalList(_newArray);
        setIsLoading(false);
        if (data.isReadyForUpload) {
          setIsSubmittable(true);
        }
        else
        {
          setIsSubmittable(false);
        }
        if (!data?.validate) {
          toast.error("Data is not Valid, Please Change and resubmit");
        }
        setMessage(data?.message);
      })
      .catch((_) => {
        toast.error("Something Wrong");
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
          const newProcessedArray = newArray.map((obj, index) => ({
            id: index,
            part_number: obj[0],
            quantity: obj[1],
          }));
          setItems(newProcessedArray);
          let po_name = "po_number";
          let customer_array = "customer_array";
          let cus_account = "customer_account";
          let po_data = data[0][0];
          let acc_data = data[0][1];
          dispatch({ type: "form-value", name: po_name, fieldValue: po_data });
          dispatch({
            type: "form-value",
            name: customer_array,
            fieldValue: data[0],
          });
          dispatch({
            type: "form-value",
            name: cus_account,
            fieldValue: acc_data,
          });
          dispatch({
            type: "form-value",
            name: "products",
            fieldValue: newProcessedArray,
          });
        }

        console.log(data);
      },
    });
    setMessage(null);
  };

  const onSubmit = () => {
    let arr = finalList
      .map(({ part_number, quantity, ...obj }) => ({ part_number, quantity }))
      .map((obj) => Object.keys(obj).map((k) => obj[k]));
    let object = {
      products: finalList,
      po_number: selectedValues?.po_number?.value,
      source: selectedValues?.source?.value,
      holdPick: selectedValues?.holdPick?.value,
      raw_data: [
        [
          selectedValues?.po_number?.value,
          selectedValues?.customer_account?.value,
        ],
      ].concat(arr), //process the data as like raw data
    };

    if (message?.warning) {
      Swal.fire({
        title: "Are you sure?",
        text: "Some Products maybe out of stock, still want to proceed with the order ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Order it!",
      }).then((result) => {
        if (result.isConfirmed) {
          orderConfirm(object);
        }
      });
    } else {
      orderConfirm(object);
    }
  };

  const orderConfirm = (params) => {
    setMessage(null);
    setIsLoading(true);
    OrderService.saveSingleOrder(params)
      .then(({ data }) => {
        setIsLoading(false);
        if (data?.orderConfirmed) {
          toast.success("Successfully Order Complete");
        }
        setMessage(data?.message);
      })
      .catch((_) => {
        toast.error("Something Wrong");
        setIsLoading(false);
      });
  };

  const handleProcess = () => {
    if (!finalList?.length || finalList?.length < 1) {
      toast.error("Please upload a proper file first");
      setIsLoading(false);
    } else {
      let arr = finalList
        .map(({ part_number, quantity, ...obj }) => ({ part_number, quantity }))
        .map((obj) => Object.keys(obj).map((k) => obj[k]));
      let object = {
        products: finalList,
        po_number: selectedValues?.po_number?.value,
        source: selectedValues?.source?.value,
        raw_data: [
          [
            selectedValues?.po_number?.value,
            selectedValues?.customer_account?.value,
          ],
        ].concat(arr), //process the data as like raw data
      };
      processSingleOrder(object);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        message,
        isSubmittable,
        handleFormValueUpdate,
        items,
        isLoading,
        processCsv,
        selectedValues,
        handleChange,
        dataProcessed,
        onSubmit,
        handleProcess,
        finalList,
        handleHoldPickChange,
        setFinalList,
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
