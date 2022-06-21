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
  const [isLoading, setIsLoading] = useState(false);
  const [finalList, setFinalList] = React.useState([]);
  const [dataProcessed, setDataProcessed] = React.useState(false);
  const [isSubmittable, setIsSubmittable] = React.useState(false);

  useEffect(() => {}, []);

  // Handle form change
  const handleChange = (event) => {
    setDataProcessed(true);
    const { type, name, value } = event.target;
    const fieldValue = value;
    dispatch({ type: "form-value", name, fieldValue });
  };


  function isProductUnique(){
    return difference(finalList, uniqBy(finalList, 'part_number'), 'part_number');
}

  const handleFormValueUpdate = (event) => {
    setDataProcessed(true);
    const { name, value } = event;
    dispatch({ type: "form-value", name, fieldValue:value });
  };


  const processSingleOrder = (props) => {
    setIsLoading(true);
    OrderService.processSingleOrder(props).then(({data}) => {

      setDataProcessed(false);
      const newArray = merge(keyBy(data?.products, 'product'), keyBy(selectedValues?.products?.value, 'part_number'));
      const _newArray = values(newArray);
      setItems(_newArray);
      setFinalList(_newArray)
      setIsLoading(false);
      if(!data?.canTransactCustomer?.valid)
      {
        
        Swal.fire({
          icon: 'error',
          html:
            "<ul style='text-align: left;' >" +data?.canTransactCustomer?.message+
            "</ul>",
          showCloseButton: true,
          showCancelButton: true,
        })
      }
    }).catch( _ => {
      toast.error('Something Wrong')
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
          dispatch({ type: "form-value", name:po_name,fieldValue:po_data });
          dispatch({ type: "form-value", name:customer_array,fieldValue:data[0] });
          dispatch({ type: "form-value", name:cus_account, fieldValue:acc_data });
          dispatch({ type: "form-value", name:'products', fieldValue:newProcessedArray });
        }

        console.log(data);
      },
    });
  };

  const onSubmit = () => {
    const duplicate = isProductUnique();
    if(duplicate.length)
    {
      toast.warning('Duplicate Product Ids : '+duplicate.map(obj=>obj.part_number).toString(','));
    }
    else if(!finalList?.filter(obj => parseInt(obj?.quantity) > parseInt(obj?.free_stock) ).length)
    {
      let object = {
        products: items,
        po_number:selectedValues?.po_number?.value,
        source: selectedValues?.source?.value,
        customer_array: selectedValues?.updatedRows?.value,
      }

      toast.success('Submit Successfully')
    }
    else
    {
      toast.error('Please Fix or remove the red rows')
    }

    
  };

  const handleProcess = () => {
    let object = {
      products: items,
      po_number:selectedValues?.po_number?.value,
      source: selectedValues?.source?.value,
      customer_array: [selectedValues?.po_number?.value,selectedValues?.customer_account?.value],
    }
    processSingleOrder(object)
  };


  return (
    <OrderContext.Provider
      value={{
        handleFormValueUpdate,
        items,
        isLoading,
        processCsv,
        selectedValues,
        handleChange,
        dataProcessed,
        onSubmit,
        handleProcess,
        finalList, setFinalList
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
