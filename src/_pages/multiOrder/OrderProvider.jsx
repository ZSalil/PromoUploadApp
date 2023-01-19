import React, { useEffect, useReducer, useState } from "react";
import OrderService from "../../_services/order.service";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import Papa from "papaparse";
import {
  difference,
  isEmpty,
  keyBy,
  merge,
  sum,
  uniqBy,
  values,
} from "lodash";
import Swal from "sweetalert2";

const defaultColumn = [
  {
    field: "product_number",
    headerName: "Product Number",
    align: "center",
    headerAlign: "center",
    width: 180,
  },
];

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
  const [orderType, setOrderType] = React.useState("retail");
  useEffect(() => {}, []);

  // Handle form change
  const handleChange = (event) => {
    const { type, name, value } = event.target;
    const fieldValue = value;
    dispatch({ type: "form-value", name, fieldValue });
  };

  function isProductUnique() {
    return difference(
      finalList,
      uniqBy(finalList, "product_number"),
      "product_number"
    );
  }

  const handleFormValueUpdate = (event) => {
    const { name, value } = event;
    dispatch({ type: "form-value", name, fieldValue: value });
  };

  function sortByError(a, b) {
    if (parseInt(a.total) < parseInt(a.free_stock)) {
      return 1;
    }
    if (parseInt(a.total) > parseInt(a.free_stock)) {
      return -1;
    }

    return 0;
  }

  const processMultiCustomerOrder = (props) => {
    setIsLoading(true);
    setMessage(null);
    OrderService.processMultiCustomerOrder(props)
      .then(({ data }) => {
        const newArray = merge(
          keyBy(data?.productStock, "product"),
          keyBy(items, "product_number")
        );
        console.log(newArray);
        const _newArray = values(newArray);
        _newArray.sort(sortByError);
        setItems(_newArray);
        setFinalList(_newArray);
        setMessage(data?.message);
        setIsLoading(false);
        if (data?.isReadyForUpload) {
          setIsSubmittable(true);
        } else {
          setIsSubmittable(false);
          toast.error("Something Wrong With the Data");
        }
      })
      .catch((_) => {
        setIsSubmittable(false);

        setIsLoading(false);
      });
  };

  const processCsv = (file) => {
    setMessage(null);
    setItems([]);
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: function ({ data, meta: { fields } }) {
        if (data?.length > 1) {
          const name = "rawValue";
          console.log(data);
          dispatch({ type: "form-value", name, fieldValue: data });
        }
      },
    });
    let newColumn = [];

    let columns = ["marketing", "wholesale", "Marketing", "Wholesale", "MARKETING","WHOLESALE"];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function ({ data, meta: { fields } }) {
        if (data?.length > 0) {
          let newProcessedArray = data.map((obj, index) => {
            let qtyObj = Object.assign({}, obj);

            let columnFind = columns.find((prop) => prop in qtyObj); // Check in  the object any key from columns array exist or not

            let columnValue = qtyObj[columnFind]; // Get the value if exist


            if (!isEmpty(columnFind)) {
              columns.forEach((prop) => delete qtyObj[prop]);
            } else {
              delete qtyObj[
                Object.keys(qtyObj)[Object.keys(qtyObj).length - 1]
              ];
            }
            console.log(qtyObj);
            return {
              product_number:
              columnValue?.toUpperCase(),
              id: index,
              total: sum(Object.values(qtyObj).map(Number)),
              ...obj,
            };
          });
          fields.slice(1).forEach(function (value) {
            newColumn.push({
              field: value,
              headerName: value,
              align: "center",
              headerAlign: "center",
              width: 100,
            });
          });

          setColumns([
            ...defaultColumn,
            ...newColumn,
            {
              field: "total",
              headerName: "Total Order",
              type: "number",
              align: "center",
              headerAlign: "center",
              width: 100,
              editable: true,
            },
            {
              field: "free_stock",
              headerName: "Available Stock",
              type: "number",
              align: "center",
              headerAlign: "center",
              width: 100,
              editable: true,
            },
            {
              field: "buffered_stock",
              headerName: "Buff. Stock",
              align: "center",
              headerAlign: "center",
              width: 100,
            },
            {
              field: "uom",
              headerName: "Unit",
              width: 100,
              align: "center",
              headerAlign: "center",
            },
            {
              field: "location",
              headerName: "Location",
              align: "center",
              headerAlign: "center",
              width: 100,
            },
            {
              field: "adn",
              headerName: "ADN",
              align: "center",
              headerAlign: "center",
              width: 100,
            },
            {
              field: "mdn_link",
              headerName: "Mdm Link",
              align: "center",
              headerAlign: "center",
              width: 100,
              renderCell: (params) => (
                <strong>
                  <a
                    target="_blank"
                    href={`http://branch.jaycar.com.au/mdm/index.php?itemCode=${params?.row?.product_number}&page=description&catalogueversion=`}
                  >
                    Mdm Page
                  </a>
                </strong>
              ),
            },
          ]);
          setItems(newProcessedArray);
        }
      },
    });
  };
  function removeVowelKeys(object) {
    for (let key in object) {
      if (key.match(/^[aeiouy]/)) {
        delete object[key];
      }
    }
    return object;
  }

  const onSubmit = async () => {
    const duplicate = isProductUnique();
    if (duplicate.length) {
      toast.warning(
        "Duplicate Product Ids : " +
          duplicate.map((obj) => obj.part_number).toString(",")
      );
    } else if (
      orderType === "wholesale" &&
      finalList?.some(
        (obj) =>
          parseInt(obj?.buffered_stock) !== 0 &&
          parseInt(obj?.buffered_stock) < parseInt(obj?.total)
      )
    ) {
      toast.error(
        "Product order quantity cannot be less than Bufferstock for wholesale order"
      );
      let errorMessage = [];
      for (const item of finalList) {
        if (
          parseInt(item?.buffered_stock) !== 0 &&
          parseInt(item?.buffered_stock) < parseInt(item?.total)
        ) {
          errorMessage.push(
            `<li>Product:${item?.product} order total: ${item?.total} is more than Buffer stock: ${item?.buffered_stock} </li>`
          );
        }
      }
      setMessage({ warning: errorMessage });
      // setIsSubmittable(false);
    } else if (
      !finalList?.filter(
        (obj) => parseInt(obj?.quantity) > parseInt(obj?.free_stock)
      ).length
    ) {
      let object = {
        raw_data: selectedValues?.rawValue?.value,
        source: selectedValues?.source?.value,
        holdPick: selectedValues?.holdPick?.value,
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
    } else {
      toast.error("Please Fix or remove the red rows");
    }
  };
  const handleHoldPickChange = (event) => {
    const { name } = event.target;
    if (event.target.checked) {
      dispatch({ type: "form-value", name, fieldValue: "Y" });
    } else {
      dispatch({ type: "form-value", name, fieldValue: "N" });
    }
  };
  const orderConfirm = (params) => {
    setMessage(null);
    setIsLoading(true);
    OrderService.saveMultiCustomerOrder(params)
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
    if (selectedValues?.source?.value) {
      let object = {
        raw_data: selectedValues?.rawValue?.value,
        source: selectedValues?.source?.value,
      };
      processMultiCustomerOrder(object);
    } else {
      toast.error("You must have to select a source before process");
    }
  };

  return (
    <OrderContext.Provider
      value={{
        columns,
        isSubmittable,
        message,
        setMessage,
        setColumns,
        handleFormValueUpdate,
        items,
        isLoading,
        processCsv,
        selectedValues,
        handleChange,
        onSubmit,
        handleProcess,
        finalList,
        setFinalList,
        orderType,handleHoldPickChange,
        setOrderType,
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
