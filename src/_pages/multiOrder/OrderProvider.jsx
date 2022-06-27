import React, { useEffect, useReducer, useState } from "react";
import OrderService from "../../_services/order.service";
import moment from "moment";
import { SET_MESSAGE } from "../../_actions/types";
import { connect } from "react-redux";
import { setMessage } from "../../_actions/message";
import { toast } from "react-toastify";
import Papa from "papaparse";
import { difference, keyBy, merge, slice, sum, uniq, uniqBy, values } from "lodash";

const defaultColumn = [    {
  field: "product_number",
  headerName: "Product Number",
  align: "center",
  headerAlign: "center",
  width: 180,
  editable: true,
},]

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
  const [message, setMessage] = React.useState();
  const [isSubmittable, setIsSubmittable] = React.useState(false);
  const [columns, setColumns] = React.useState([]);
  const [finalList, setFinalList] = React.useState([]);
  const [dataProcessed, setDataProcessed] = React.useState(false);

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

  const handleFormValueUpdate = (event) => {
    setDataProcessed(true);
    const { name, value } = event;
    dispatch({ type: "form-value", name, fieldValue: value });
  };

  const processMultiCustomerOrder = (props) => {
    setIsLoading(true);
    setMessage(null);
    OrderService.processMultiCustomerOrder(props).then(({ data }) => {
      setDataProcessed(false);
      const newArray = merge(
        keyBy(data?.productStock, "product"),
        keyBy(items, "product_number")
      );
      const _newArray = values(newArray);
      setItems(_newArray);
      setFinalList(_newArray);
      setMessage(data?.message)
      setIsLoading(false);
      if(!data?.orderArray)
      {
        toast.error('Something Wrong With the Data')
      }
      else
      {
        setIsSubmittable(true);
      }
    }).catch(_ => {
      setDataProcessed(false);
      setIsLoading(false);
    });
  };

  const processCsv = (file) => {
    setMessage(null);
    setItems([])
    Papa.parse(file, {
      header: false,
      skipEmptyLines:true,
      complete: function ({ data, meta: { fields } }) {
        if (data?.length > 1) {
          const name = 'rawValue';
          console.log(data)
          dispatch({ type: "form-value", name, fieldValue:data });
        }

      },
    });
    let newColumn = [];
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines:true,
      complete: function ({ data, meta: { fields } }) {
        if (data?.length > 0) {
          let newProcessedArray = data.map((obj, index) =>{
            let qtyObj = Object.assign({}, obj);
            delete qtyObj[Object.keys(qtyObj)[Object.keys(qtyObj).length - 1]];

            return({
            product_number: obj[Object.keys(obj)[Object.keys(obj).length - 1]],
            id: index,
            total:sum(Object.values(qtyObj)),
            ...obj,
          })});
          fields.slice(1).forEach(function (value) {
            newColumn.push({
              field: value,
              headerName: value,
              align: "center",
              headerAlign: "center",
              width: 180,
              editable: true,
              flex: 1,
            });
          });
          setColumns([...defaultColumn, ...newColumn,{
            field: "total",
            headerName: "Total Order",
            type: "number",
            align: "center",
            headerAlign: "center",
            width: 180,
            editable: true,
          },{
            field: "free_stock",
            headerName: "Available Stock",
            type: "number",
            align: "center",
            headerAlign: "center",
            width: 180,
            editable: true,
          },
          {
            field: "uom",
            headerName: "Unit",
            width: 180,
            align: "center",
            headerAlign: "center",
          },
          {
            field: "location",
            headerName: "Location",
            align: "center",
            headerAlign: "center",
            width: 180,
          },
          {
            field: "adn",
            headerName: "ADN",
            align: "center",
            headerAlign: "center",
            width: 180,
          },]);
          setItems(newProcessedArray);
        }

      },
    });
  };

  const onSubmit = async () => {
    const duplicate = isProductUnique();
    if (duplicate.length) {
      toast.warning(
        "Duplicate Product Ids : " +
          duplicate.map((obj) => obj.part_number).toString(",")
      );
    } else if (
      !finalList?.filter(
        (obj) => parseInt(obj?.quantity) > parseInt(obj?.free_stock)
      ).length
    ) {
      let object = {
        raw_data: selectedValues?.rawValue?.value,
        source: selectedValues?.source?.value,
      };
      setIsLoading(true);
      setMessage(null);
     await OrderService.saveMultiCustomerOrder(object).then(({ data }) => {
        setMessage(data?.message)
        setIsLoading(false);
      }).catch(_ => {
        setIsLoading(false);
      });
      toast.success("Submit Successfully");
    } else {
      toast.error("Please Fix or remove the red rows");
    }
  };

  const handleProcess = () => {
    let object = {
      raw_data: selectedValues?.rawValue?.value,
      source: selectedValues?.source?.value,
    };
    processMultiCustomerOrder(object);
  };

  return (
    <OrderContext.Provider
      value={{
        columns,
        isSubmittable,
        message, setMessage,
        setColumns,
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
