import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import Papa from "papaparse";
import { isEmpty, slice } from "lodash";
import axios from "axios";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

export const OrderContext = React.createContext({
  selectedValues: {},
  handleChange() {},
});

function reducer(state, action) {
  switch (action.type) {
    case "form-value":
      return {
        ...state,
        selectedValues: {
          ...state.selectedValues,
          [action.name]: action.fieldValue,
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
  const [finalList, setFinalList] = useState([]);
  const [message, setMessage] = useState(null);
  const [orderType, setOrderType] = useState("jaycar-au");
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  
  // State for managing the dialog visibility and content
  const [openDialog, setOpenDialog] = useState(false);
  const [highDiscountItems, setHighDiscountItems] = useState([]);

  const submitOrderToDB = async (products, startDate, endDate, orderType) => {
    try {
      for (const item of products) {
        const { part_number, quantity } = item;

        await axios.post("http://localhost:5000/api/v1/promo-uploader/insert-item", {
          item_code: part_number,
          price: quantity,
          effective_date: startDate,
          end_date: endDate,
          orderType: orderType,
        });
      }

      toast.success("Promotion prices successfully updated.");
    } catch (error) {
      console.error("Error adding items to the database:", error);
      toast.error("Failed to add items to the database.");
    }
  };

  // Fetch original price from backend based on item_code
  const fetchOriginalPrice = async (part_number, orderType) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/get-original-price/${orderType}/${part_number}`); 
      return response.data.originalPrice;
    } catch (error) {
      console.error("Error fetching original price:", error);
      return 0;
    }
  };

  const processCsv = (file) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: async function ({ data }) {
        if (data?.length > 1) {
          const newArray = slice(data, 1);

          const newProcessedArray = await Promise.all(
            newArray.map(async (obj, index) => {
              const part_number = obj[0]?.toUpperCase()?.trim();
              let quantityString = obj[1]?.trim();
              let quantity = parseFloat(quantityString.replace(/[^0-9.-]+/g, ""));

              if (isNaN(quantity)) {
                return null;
              }

              const originalPrice = await fetchOriginalPrice(part_number, orderType);
              console.log(`Original price for ${part_number}: ${originalPrice}`);

              const discountPercentage = (originalPrice && quantity)
                ? ((originalPrice - quantity) / originalPrice) * 100
                : null;

              return {
                id: index,
                part_number,
                quantity: quantity.toFixed(2),
                discount: discountPercentage !== null
                  ? discountPercentage.toFixed(2) + '%'
                  : "0%",
              };
            })
          );

          setItems(newProcessedArray);
          setFinalList(newProcessedArray);
          dispatch({
            type: "form-value",
            name: "items",
            fieldValue: newProcessedArray,
          });
        }
      },
    });
  };

  // Function to check if any discounts exceed 35%
  const checkDiscounts = () => {
    const itemsWithHighDiscounts = finalList.filter(item => {
      const discountValue = parseFloat(item.discount.replace('%', '')); // Parse the discount value
      return discountValue > 35; // Check for discounts above 35%
    });

    if (itemsWithHighDiscounts.length > 0) {
      setHighDiscountItems(itemsWithHighDiscounts); // Store high discount items
      setOpenDialog(true); // Open the dialog to warn the user
    }
  };

  // Process Data: Only validate and prepare the data
  const handleProcess = (startDate, endDate) => {
    if (!finalList.length || !selectedValues.items?.length) {
      toast.error("Please upload a proper file first.");
      setIsLoading(false);
      setIsSubmitEnabled(false);
      return;
    }

    checkDiscounts(); // Call the checkDiscounts function

    toast.success("Data is ready for submission.");
    setIsSubmitEnabled(true);
  };

  const handleSubmit = (startDate, endDate, orderType) => {
    if (!finalList.length) {
      toast.error("No data available to submit.");
      return;
    }

    submitOrderToDB(finalList, startDate, endDate, orderType);
  };

  return (
    <OrderContext.Provider
      value={{
        message,
        items,
        isLoading,
        processCsv,
        selectedValues,
        handleProcess,
        handleSubmit,
        finalList,
        setFinalList,
        orderType,
        setOrderType,
        isSubmitEnabled,
        setIsSubmitEnabled,
      }}
    >
      {props.children}

      {/* Dialog for high discount warning */}
      <Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  aria-labelledby="discount-warning-title"
>
  <DialogTitle id="discount-warning-title">Warning: High Discounts</DialogTitle>
  <DialogContent>
    <p>The following items have a discount greater than 35%:</p>
    <ul>
      {highDiscountItems.map(item => (
        <li key={item.id}>
          {item.part_number}: {item.discount} discount
        </li>
      ))}
    </ul>
    {/* Additional message to disregard if data is valid */}
    <p style={{ marginTop: '16px', fontWeight: 'bold' }}>
      If the data is valid, please disregard this warning and click the submit button to proceed.
    </p>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDialog(false)} color="primary">
      Close
    </Button>
  </DialogActions>
</Dialog>

    </OrderContext.Provider>
  );
};

export default OrderProvider;
