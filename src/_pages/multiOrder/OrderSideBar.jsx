import React from "react";
import Stack from "@mui/material/Stack";
import DragAndDrop from "./DragAndDrop";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { OrderContext } from "./OrderProvider";
import Button from "@mui/material/Button";
import { LoadingButton } from "@mui/lab";
import AutoFixHighTwoToneIcon from "@mui/icons-material/AutoFixHighTwoTone";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
const OrderSideBar = () => {
  const {
    selectedValues,
    handleChange,
    onSubmit,
    isLoading,
    handleProcess,
    dataProcessed,
    isSubmittable,
  } = React.useContext(OrderContext);
  const [orderType, setOrderType] = React.useState("retail");
  const handleOrderTypeChange = (event) => {
    setOrderType(event.target.value);
  };
  return (
    <>
      <Stack spacing={2}>
        <Typography
          variant="h4"
          className="border-bottom pb-2 border-success"
          component="div"
          gutterBottom
        >
          Multi Order
        </Typography>
        <FormControl>
          <FormLabel
            id="demo-controlled-radio-buttons-group"
            className="fw-bold"
          >
            Order Type
          </FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={orderType}
            exclusive
            onChange={handleOrderTypeChange}
          >
            <ToggleButton value="retail">Retail</ToggleButton>
            <ToggleButton value="wholesale">Wholesale</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
        <DragAndDrop />
        {orderType === "retail" ? (
          <FormControl>
            <FormLabel
              id="demo-controlled-radio-buttons-group"
              className="fw-bold"
            >
              Retail Order Upload
            </FormLabel>
            <FormLabel
              id="demo-controlled-radio-buttons-group"
              className="fw-bold"
            >
              Company To create Order In
            </FormLabel>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="source"
              value={selectedValues?.source?.value}
              onChange={handleChange}
            >
              <FormControlLabel
                value="jrau"
                control={<Radio />}
                label="Jaycar AU (jrau)" 
              />
              <FormControlLabel
                value="jrnz"
                control={<Radio />}
                label=" Jaycar NZ (jrnz)"
              />
              <FormControlLabel
                value="nzau"
                control={<Radio />}
                label="Jaycar NZ (supply from Australia) (nzau)"
              />
              <FormControlLabel
                value="rtau"
                control={<Radio />}
                label="RTM AU (rtau)"
              />
            </RadioGroup>
          </FormControl>
        ) : (
          ""
        )}
        {orderType === "wholesale" ? (
          <FormControl>
            <FormLabel
              id="demo-controlled-radio-buttons-group"
              className="fw-bold"
            >
              Wholesale Order Upload
            </FormLabel>
            <FormLabel
              id="demo-controlled-radio-buttons-group"
              className="fw-bold"
            >
              Company To create Order In
            </FormLabel>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="source"
              value={selectedValues?.electus?.sdau}
              onChange={handleChange}
            >
              <FormControlLabel
                value="sdau"
                control={<Radio />}
                label="Electus Wholesale Au (sdau)"
              />
              <FormControlLabel
                value="sdnz"
                control={<Radio />}
                label="Electus Wholesale NZ (sdnz)"
              />
            </RadioGroup>
          </FormControl>
        ) : (
          ""
        )}
        <LoadingButton
          disabled={!dataProcessed}
          onClick={handleProcess}
          endIcon={<AutoFixHighTwoToneIcon />}
          loading={isLoading}
          loadingPosition="end"
          variant="contained"
        >
          Process Data
        </LoadingButton>
        <Button
          variant="contained"
          disabled={!isSubmittable}
          onClick={onSubmit}
        >
          Submit
        </Button>
      </Stack>
    </>
  );
};

export default OrderSideBar;
